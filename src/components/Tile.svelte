<script lang="ts">
  import TileIcon from './TileIcon.svelte';
  import { hostOf } from '../lib/icons';
  import { settings } from '../lib/settings.svelte';
  import { drag } from '../lib/dnd.svelte';
  import { dialog } from '../lib/dialog.svelte';
  import { menu } from '../lib/menu.svelte';
  import { sections as sectionStore } from '../lib/sections.svelte';
  import {
    copyAddress,
    deleteTile,
    hideTile,
    moveTile,
    updateShortcut,
  } from '../lib/mutations';
  import type { ResolvedSection, ResolvedTile } from '../lib/types';

  interface Props {
    tile: ResolvedTile;
    section: ResolvedSection;
    index: number;
  }

  let { tile, section, index }: Props = $props();

  const config = $derived(settings.current);
  const isCustom = $derived(config.shortcuts.mode === 'custom');
  const dragged = $derived(drag.kind === 'tile' && drag.key === tile.key);
  const caret = $derived.by(() => {
    if (drag.kind !== 'tile' || drag.overSection !== section.key) return '';
    if (drag.overIndex === index) return 'before';
    if (drag.overIndex === index + 1 && index === section.tiles.length - 1) return 'after';
    return '';
  });

  function edit() {
    dialog.show({
      heading: 'Edit shortcut',
      title: tile.title,
      url: tile.url,
      icon: tile.icon,
      sectionKey: section.key,
      lockSection: true,
      onSubmit: (data) => updateShortcut(tile, data),
    });
  }

  function nudge(direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target > section.tiles.length - 1) return;
    moveTile(tile, section, section, direction === 1 ? target + 1 : target);
  }

  function openMenu(event: MouseEvent) {
    menu.show(event, [
      {
        label: 'Open in a new tab',
        glyph: 'external',
        action: () => window.open(tile.url, '_blank', 'noopener'),
      },
      { label: 'Edit…', glyph: 'pencil', action: edit },
      { label: 'Copy address', glyph: 'link', action: () => copyAddress(tile.url) },
      { kind: 'separator' },
      {
        label: 'Move left',
        glyph: 'left',
        disabled: !section.reorderable || index === 0,
        action: () => nudge(-1),
      },
      {
        label: 'Move right',
        glyph: 'right',
        disabled: !section.reorderable || index === section.tiles.length - 1,
        action: () => nudge(1),
      },
      { kind: 'separator' },
      ...(isCustom
        ? [
            {
              label: 'Remove',
              glyph: 'trash' as const,
              danger: true,
              confirm: true,
              action: () => deleteTile(tile),
            },
          ]
        : [
            { label: 'Hide from Minima', glyph: 'eye-off' as const, action: () => hideTile(tile) },
            {
              label: 'Delete bookmark',
              glyph: 'trash' as const,
              danger: true,
              confirm: true,
              action: () => deleteTile(tile),
            },
          ]),
    ]);
  }

  function onDragStart(event: DragEvent) {
    drag.startTile(tile.key, section.key);
    event.dataTransfer?.setData('text/uri-list', tile.url);
    event.dataTransfer?.setData('text/plain', tile.url);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'copyMove';
  }

  function onDragOver(event: DragEvent) {
    if (!section.reorderable) return;
    event.preventDefault();
    event.stopPropagation();
    const box = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const after = event.clientX > box.left + box.width / 2;
    drag.hoverTile(section.key, after ? index + 1 : index);
  }

  function onDrop(event: DragEvent) {
    if (drag.kind !== 'tile') return;
    event.preventDefault();
    event.stopPropagation();
    const from = sectionStore.find(drag.fromSection);
    const source = from?.tiles.find((candidate) => candidate.key === drag.key);
    if (from && source) moveTile(source, from, section, drag.overIndex);
    drag.clear();
  }
</script>

<a
  class="tile"
  class:dragging={dragged}
  class:caret-before={caret === 'before'}
  class:caret-after={caret === 'after'}
  href={tile.url}
  title="{tile.title} · {hostOf(tile.url)}"
  draggable="true"
  ondragstart={onDragStart}
  ondragover={onDragOver}
  ondrop={onDrop}
  ondragend={() => drag.clear()}
  oncontextmenu={openMenu}
>
  <span class="art">
    <TileIcon
      title={tile.title}
      url={tile.url}
      icon={tile.icon}
      source={config.appearance.iconSource}
    />
  </span>
  {#if config.layout.showLabels}
    <span class="label">{tile.title}</span>
  {/if}
</a>

<style>
  .tile {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 7px;
    padding: 8px 4px;
    border-radius: var(--r-md);
    min-width: 0;
    transition: background var(--dur) var(--ease), opacity var(--dur) var(--ease);
  }

  .tile:hover {
    background: color-mix(in srgb, var(--accent) 9%, var(--surface));
  }

  .tile:hover .art :global(.icon) {
    border-color: var(--accent-line);
  }

  .tile.dragging {
    opacity: 0.35;
  }

  .tile::before,
  .tile::after {
    content: '';
    position: absolute;
    top: 8px;
    bottom: 8px;
    width: 2px;
    border-radius: 2px;
    background: var(--accent);
    opacity: 0;
    transition: opacity var(--dur) var(--ease);
  }

  .tile::before {
    left: -3px;
  }

  .tile::after {
    right: -3px;
  }

  .tile.caret-before::before,
  .tile.caret-after::after {
    opacity: 1;
  }

  .art {
    display: block;
    filter: grayscale(var(--grayscale));
    transition: filter var(--dur) var(--ease), transform var(--dur) var(--ease);
  }

  .tile:hover .art {
    filter: grayscale(var(--grayscale-hover));
    transform: translateY(-2px);
  }

  .label {
    max-width: 100%;
    font-size: var(--tile-label);
    line-height: 1.3;
    color: var(--text-faint);
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: color var(--dur) var(--ease);
  }

  .tile:hover .label {
    color: var(--accent-text);
  }
</style>
