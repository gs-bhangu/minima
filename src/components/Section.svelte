<script lang="ts">
  import Glyph from './Glyph.svelte';
  import Tile from './Tile.svelte';
  import { settings } from '../lib/settings.svelte';
  import { drag } from '../lib/dnd.svelte';
  import { dialog } from '../lib/dialog.svelte';
  import { menu } from '../lib/menu.svelte';
  import { sections as sectionStore } from '../lib/sections.svelte';
  import { ui } from '../lib/ui.svelte';
  import {
    createShortcut,
    deleteGroup,
    hideGroup,
    moveGroup,
    moveTile,
    openAll,
    renameGroup,
    setGroupColor,
  } from '../lib/mutations';
  import { looksLikeUrl } from '../lib/icons';
  import type { ResolvedSection } from '../lib/types';

  interface Props {
    section: ResolvedSection;
    index: number;
    total: number;
    showTitle?: boolean;
    collapsed?: boolean;
    onToggle?: (key: string) => void;
  }

  let {
    section,
    index,
    total,
    showTitle = true,
    collapsed = false,
    onToggle,
  }: Props = $props();

  const config = $derived(settings.current);
  const isCustom = $derived(config.shortcuts.mode === 'custom');
  const color = $derived(config.groupColors[section.key] ?? null);
  const canAdd = $derived(section.editable && config.layout.showAddButtons);

  let renaming = $state(false);
  let draftTitle = $state('');
  let external = $state(false);

  const groupCaret = $derived.by(() => {
    if (drag.kind !== 'group' || drag.key === section.key) return '';
    if (drag.overGroupIndex === index) return 'before';
    if (drag.overGroupIndex === index + 1 && index === total - 1) return 'after';
    return '';
  });

  function startRename() {
    draftTitle = section.title;
    renaming = true;
  }

  $effect(() => {
    if (ui.renameKey !== section.key) return;
    ui.renameKey = '';
    startRename();
  });

  function commitRename() {
    if (!renaming) return;
    renaming = false;
    if (draftTitle.trim() && draftTitle !== section.title) {
      renameGroup(section, draftTitle);
    }
  }

  function addShortcut() {
    dialog.show({
      heading: `Add to ${section.title}`,
      title: '',
      url: '',
      icon: { type: 'auto', value: '' },
      sectionKey: section.key,
      lockSection: true,
      onSubmit: (data) => createShortcut(section, data),
    });
  }

  function openMenu(event: MouseEvent) {
    menu.show(event, [
      {
        label: 'Add shortcut…',
        glyph: 'plus',
        disabled: !section.editable,
        action: addShortcut,
      },
      {
        label: `Open all (${section.tiles.length})`,
        glyph: 'external',
        disabled: !section.tiles.length,
        action: () => openAll(section),
      },
      {
        label: 'Rename…',
        glyph: 'pencil',
        disabled: !showTitle,
        action: startRename,
      },
      { kind: 'colors', value: color, onpick: (next) => setGroupColor(section.key, next) },
      { kind: 'separator' },
      {
        label: collapsed ? 'Expand' : 'Collapse',
        glyph: 'chevron',
        action: () => onToggle?.(section.key),
      },
      {
        label: 'Move up',
        glyph: 'up',
        disabled: section.synthetic || index === 0,
        action: () => moveGroup(sectionStore.all, section.key, index - 1),
      },
      {
        label: 'Move down',
        glyph: 'down',
        disabled: section.synthetic || index === total - 1,
        action: () => moveGroup(sectionStore.all, section.key, index + 2),
      },
      { kind: 'separator' },
      ...(isCustom
        ? [
            {
              label: 'Delete group',
              glyph: 'trash' as const,
              danger: true,
              confirm: true,
              action: () => deleteGroup(section),
            },
          ]
        : [
            {
              label: section.synthetic ? 'Hide loose bookmarks' : 'Hide group',
              glyph: 'eye-off' as const,
              action: () => hideGroup(section),
            },
            {
              label: 'Delete folder',
              glyph: 'trash' as const,
              danger: true,
              confirm: true,
              disabled: section.synthetic,
              action: () => deleteGroup(section),
            },
          ]),
    ]);
  }

  function onDragOver(event: DragEvent) {
    if (drag.kind === 'group') {
      event.preventDefault();
      const box = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const after = event.clientY > box.top + box.height / 2;
      drag.hoverGroup(after ? index + 1 : index);
      return;
    }
    if (drag.kind === 'tile') {
      if (!section.reorderable) return;
      event.preventDefault();
      drag.hoverTile(section.key, section.tiles.length);
      return;
    }
    if (section.editable && event.dataTransfer?.types.includes('text/uri-list')) {
      event.preventDefault();
      external = true;
    }
  }

  function onDrop(event: DragEvent) {
    external = false;
    if (drag.kind === 'group') {
      event.preventDefault();
      moveGroup(sectionStore.all, drag.key, drag.overGroupIndex);
      drag.clear();
      return;
    }
    if (drag.kind === 'tile') {
      event.preventDefault();
      const from = sectionStore.find(drag.fromSection);
      const tile = from?.tiles.find((candidate) => candidate.key === drag.key);
      if (from && tile) moveTile(tile, from, section, drag.overIndex);
      drag.clear();
      return;
    }

    const dropped =
      event.dataTransfer?.getData('text/uri-list') ||
      event.dataTransfer?.getData('text/plain') ||
      '';
    const url = dropped.split('\n')[0].trim();
    if (!url || !looksLikeUrl(url)) return;
    event.preventDefault();
    createShortcut(section, { title: '', url });
  }
</script>

<section
  class="group"
  class:bare={!showTitle}
  class:tinted={!!color}
  class:external
  class:caret-before={groupCaret === 'before'}
  class:caret-after={groupCaret === 'after'}
  class:dragging={drag.kind === 'group' && drag.key === section.key}
  role="group"
  aria-label={section.title}
  style={color ? `--tint: ${color}` : undefined}
  ondragover={onDragOver}
  ondragleave={() => (external = false)}
  ondrop={onDrop}
  oncontextmenu={openMenu}
>
  {#if showTitle}
    {#if renaming}
      <div class="head">
        <!-- svelte-ignore a11y_autofocus -->
        <input
          class="rename"
          bind:value={draftTitle}
          autofocus
          aria-label="Group name"
          spellcheck="false"
          onblur={commitRename}
          onkeydown={(event) => {
            if (event.key === 'Enter') commitRename();
            if (event.key === 'Escape') {
              renaming = false;
              event.stopPropagation();
            }
          }}
        />
      </div>
    {:else}
      <button
        class="head"
        type="button"
        aria-expanded={!collapsed}
        draggable={!section.synthetic}
        ondragstart={() => drag.startGroup(section.key)}
        ondragend={() => drag.clear()}
        onclick={() => onToggle?.(section.key)}
        ondblclick={startRename}
      >
        <span class="eyebrow title">{section.title}</span>
        <span class="rule" aria-hidden="true"></span>
        {#if canAdd}
          <span
            class="head-add"
            role="button"
            tabindex="0"
            title="Add shortcut"
            aria-label="Add shortcut to {section.title}"
            onclick={(event) => {
              event.stopPropagation();
              addShortcut();
            }}
            onkeydown={(event) => {
              if (event.key !== 'Enter' && event.key !== ' ') return;
              event.preventDefault();
              event.stopPropagation();
              addShortcut();
            }}
          >
            <Glyph name="plus" size={13} />
          </span>
        {/if}
        <span class="count">{section.tiles.length}</span>
        <span class="chevron" class:up={collapsed} aria-hidden="true">
          <Glyph name="chevron" size={14} />
        </span>
      </button>
    {/if}
  {/if}

  <div class="body" class:collapsed>
    <div class="clip" inert={collapsed}>
      <div class="grid">
        {#each section.tiles as tile, tileIndex (tile.key)}
          <Tile {tile} {section} index={tileIndex} />
        {/each}

        <!-- Only shown where the header "+" isn't available, so the ghost tile
             never reserves an empty row inside a full group. -->
        {#if canAdd && (!showTitle || !section.tiles.length)}
          <button class="add-tile" type="button" title="Add shortcut" onclick={addShortcut}>
            <span class="add-art"><Glyph name="plus" size={16} /></span>
            {#if config.layout.showLabels}<span class="add-label">Add</span>{/if}
          </button>
        {:else if !section.tiles.length}
          <p class="empty">Empty</p>
        {/if}
      </div>
    </div>
  </div>
</section>

<style>
  .group {
    position: relative;
    border-radius: var(--r-lg);
    padding: 12px 12px 6px;
    background: var(--card);
    border: 1px solid var(--card-line);
    transition: border-color var(--dur) var(--ease), background var(--dur) var(--ease),
      opacity var(--dur) var(--ease);
  }

  :global(:root[data-cards='off']) .group {
    background: none;
    border-color: transparent;
    padding-inline: 0;
  }

  .group.tinted,
  :global(:root[data-cards='off']) .group.tinted {
    background: color-mix(in srgb, var(--tint) 13%, var(--bg-tint));
    border-color: color-mix(in srgb, var(--tint) 32%, var(--card-line));
  }

  :global(:root[data-theme='dark']) .group.tinted {
    background: color-mix(in srgb, var(--tint) 15%, var(--bg-tint));
    border-color: color-mix(in srgb, var(--tint) 26%, var(--card-line));
  }

  .group.external {
    border-color: color-mix(in srgb, var(--accent) 55%, var(--card-line));
    background: color-mix(in srgb, var(--accent) 7%, var(--card));
  }

  .group.dragging {
    opacity: 0.4;
  }

  .group::before,
  .group::after {
    content: '';
    position: absolute;
    top: 6px;
    bottom: 6px;
    width: 2px;
    border-radius: 2px;
    background: var(--accent);
    opacity: 0;
    transition: opacity var(--dur) var(--ease);
  }

  .group::before {
    left: -7px;
  }

  .group::after {
    right: -7px;
  }

  .group.caret-before::before,
  .group.caret-after::after {
    opacity: 1;
  }

  .group.bare {
    padding-top: 6px;
  }

  .head {
    display: flex;
    align-items: center;
    gap: 9px;
    width: 100%;
    padding: 2px 4px 10px;
    text-align: left;
  }

  .title {
    flex: none;
    max-width: 60%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: color var(--dur) var(--ease);
  }

  .head:hover .title,
  .head:hover .count,
  .head:hover .chevron {
    color: var(--accent-text);
  }

  .rename {
    width: 100%;
    height: 22px;
    padding: 0 4px;
    margin-bottom: 8px;
    border: 1px solid var(--line);
    border-radius: var(--r-sm);
    background: var(--bg-tint);
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text);
    outline: none;
  }

  .rule {
    flex: 1;
    height: 1px;
    background: var(--line);
  }

  .count {
    flex: none;
    font-size: 10px;
    font-variant-numeric: tabular-nums;
    color: var(--text-faint);
    opacity: 0.7;
  }

  .chevron {
    display: flex;
    color: var(--text-faint);
    transition: transform var(--dur) var(--ease), color var(--dur) var(--ease);
  }

  .chevron.up {
    transform: rotate(-90deg);
  }

  .body {
    display: grid;
    grid-template-rows: 1fr;
    transition: grid-template-rows var(--dur) var(--ease), opacity var(--dur) var(--ease);
  }

  .body.collapsed {
    grid-template-rows: 0fr;
    opacity: 0;
  }

  .clip {
    min-height: 0;
    overflow: hidden;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(var(--tile-min), 1fr));
    gap: 4px;
    padding-bottom: 6px;
  }

  .head-add {
    display: flex;
    flex: none;
    padding: 2px;
    margin: -2px;
    border-radius: 4px;
    color: var(--text-faint);
    opacity: 0;
    cursor: pointer;
    transition: opacity var(--dur) var(--ease), color var(--dur) var(--ease),
      background var(--dur) var(--ease);
  }

  .group:hover .head-add,
  .head-add:focus-visible {
    opacity: 1;
  }

  .head-add:hover {
    background: var(--accent-soft);
    color: var(--accent-text);
  }

  .add-tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 7px;
    padding: 8px 4px;
    border-radius: var(--r-md);
    opacity: 0.45;
    transition: opacity var(--dur) var(--ease), background var(--dur) var(--ease);
  }

  .group:hover .add-tile,
  .add-tile:focus-visible {
    opacity: 0.7;
  }

  .add-tile:hover {
    opacity: 1;
    background: var(--accent-soft);
  }

  .add-tile:hover .add-art {
    border-color: var(--accent-line);
    color: var(--accent-text);
  }

  .add-art {
    display: grid;
    place-items: center;
    width: var(--tile-icon);
    height: var(--tile-icon);
    border-radius: var(--icon-radius);
    border: 1px dashed var(--line);
    color: var(--text-faint);
  }

  .add-label {
    font-size: var(--tile-label);
    color: var(--text-faint);
  }

  .empty {
    padding: 4px 4px 10px;
    font-size: 11.5px;
    color: var(--text-faint);
  }
</style>
