<script lang="ts">
  import type { Snippet } from 'svelte';
  import Glyph from './Glyph.svelte';
  import { drag } from '../lib/dnd.svelte';
  import { menu } from '../lib/menu.svelte';
  import { settings } from '../lib/settings.svelte';
  import type { PanelKey, PanelPlacement } from '../lib/types';

  interface Props {
    panel: PanelKey;
    title: string;
    count: number | string;
    collapsed?: boolean;
    onToggle?: (key: string) => void;
    actions?: Snippet;
    children: Snippet;
  }

  let {
    panel,
    title,
    count,
    collapsed = false,
    onToggle,
    actions,
    children,
  }: Props = $props();

  const config = $derived(settings.current[panel]);
  const key = $derived(`__${panel}__`);

  function place(placement: PanelPlacement) {
    settings.current[panel].placement = placement;
  }

  function openMenu(event: MouseEvent) {
    menu.show(event, [
      {
        label: 'Dock left',
        glyph: 'left',
        disabled: config.placement === 'left',
        action: () => place('left'),
      },
      {
        label: 'Dock right',
        glyph: 'right',
        disabled: config.placement === 'right',
        action: () => place('right'),
      },
      {
        label: 'Put back in the column',
        glyph: 'down',
        disabled: config.placement === 'inline',
        action: () => place('inline'),
      },
      { kind: 'separator' },
      {
        label: collapsed ? 'Expand' : 'Collapse',
        glyph: 'chevron',
        action: () => onToggle?.(key),
      },
      {
        label: `Hide ${title.toLowerCase()}`,
        glyph: 'eye-off',
        action: () => (settings.current[panel].enabled = false),
      },
    ]);
  }
</script>

<section
  class="card"
  class:docked={config.placement !== 'inline'}
  class:dragging={drag.kind === 'panel' && drag.key === panel}
  oncontextmenu={openMenu}
  role="group"
  aria-label={title}
>
  <button
    class="head"
    type="button"
    aria-expanded={!collapsed}
    draggable="true"
    title="Drag to a side to dock, or right-click for options"
    ondragstart={(event) => {
      drag.startPanel(panel);
      event.dataTransfer?.setData('text/plain', panel);
    }}
    ondragend={() => drag.clear()}
    onclick={() => onToggle?.(key)}
  >
    <span class="eyebrow">{title}</span>
    <span class="rule" aria-hidden="true"></span>
    {#if actions}{@render actions()}{/if}
    <span class="count">{count}</span>
    <span class="chevron" class:up={collapsed} aria-hidden="true">
      <Glyph name="chevron" size={14} />
    </span>
  </button>

  <div class="body" class:collapsed>
    <div class="clip" inert={collapsed}>{@render children()}</div>
  </div>
</section>

<style>
  .card {
    border-radius: var(--r-lg);
    padding: 12px 12px 8px;
    background: var(--card);
    border: 1px solid var(--card-line);
    transition: opacity var(--dur) var(--ease), border-color var(--dur) var(--ease);
  }

  :global(:root[data-cards='off']) .card {
    background: none;
    border-color: transparent;
    padding-inline: 0;
  }

  /* Docked panels float over the page, so they always need their own surface. */
  .card.docked,
  :global(:root[data-cards='off']) .card.docked {
    background: var(--bg-tint);
    border-color: var(--card-line);
    padding-inline: 12px;
    box-shadow: var(--shadow);
  }

  .card.dragging {
    opacity: 0.4;
  }

  .head {
    display: flex;
    align-items: center;
    gap: 9px;
    width: 100%;
    padding: 2px 4px 10px;
    cursor: grab;
  }

  .head:active {
    cursor: grabbing;
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

  .head:hover .eyebrow,
  .head:hover .count,
  .head:hover .chevron {
    color: var(--accent-text);
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
</style>
