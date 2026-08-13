<script lang="ts">
  import Glyph from './Glyph.svelte';
  import ColorInput from './controls/ColorInput.svelte';
  import { menu, type MenuAction } from '../lib/menu.svelte';
  import { GROUP_TINTS } from '../lib/defaults';
  import { settings } from '../lib/settings.svelte';

  let element = $state<HTMLDivElement | null>(null);
  let width = $state(0);
  let height = $state(0);
  let pending = $state(-1);

  const duration = $derived(settings.current.appearance.animations ? 110 : 0);

  const left = $derived(Math.min(menu.x, Math.max(8, window.innerWidth - width - 8)));
  const top = $derived(Math.min(menu.y, Math.max(8, window.innerHeight - height - 8)));

  $effect(() => {
    if (menu.open) {
      pending = -1;
      queueMicrotask(() => element?.focus());
    }
  });

  function run(entry: MenuAction, index: number) {
    if (entry.disabled) return;
    if (entry.confirm && pending !== index) {
      pending = index;
      return;
    }
    menu.close();
    entry.action();
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.stopPropagation();
      menu.close();
      return;
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    const buttons = [...(element?.querySelectorAll<HTMLButtonElement>('.entry') ?? [])];
    if (!buttons.length) return;
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const next =
      event.key === 'ArrowDown'
        ? (current + 1) % buttons.length
        : (current - 1 + buttons.length) % buttons.length;
    buttons[next].focus();
  }
</script>

<svelte:window
  onpointerdown={(event) => {
    if (menu.open && !element?.contains(event.target as Node)) menu.close();
  }}
  onresize={() => menu.close()}
/>

{#if menu.open}
  <div
    bind:this={element}
    bind:clientWidth={width}
    bind:clientHeight={height}
    class="menu"
    role="menu"
    tabindex="-1"
    style="left: {left}px; top: {top}px; --menu-duration: {duration}ms"
    onkeydown={onKeydown}
    oncontextmenu={(event) => event.preventDefault()}
  >
    {#each menu.entries as entry, index (index)}
      {#if entry.kind === 'separator'}
        <div class="rule" role="separator"></div>
      {:else if entry.kind === 'colors'}
        <div class="colors" role="group" aria-label="Group colour">
          <button
            class="swatch none"
            type="button"
            aria-label="No colour"
            aria-pressed={!entry.value}
            onclick={() => {
              entry.onpick(null);
              menu.close();
            }}
          ></button>
          {#each GROUP_TINTS as tint (tint)}
            <button
              class="swatch"
              type="button"
              aria-label="Colour {tint}"
              aria-pressed={entry.value === tint}
              style="--tint: {tint}"
              onclick={() => {
                entry.onpick(tint);
                menu.close();
              }}
            ></button>
          {/each}
        </div>
        <div class="custom">
          <ColorInput
            value={entry.value ?? GROUP_TINTS[0]}
            label="Custom group colour"
            onchange={entry.onpick}
          />
        </div>
      {:else}
        <button
          class="entry"
          class:danger={entry.danger}
          type="button"
          role="menuitem"
          disabled={entry.disabled}
          onclick={() => run(entry, index)}
        >
          {#if entry.glyph}
            <span class="glyph"><Glyph name={entry.glyph} size={14} /></span>
          {:else}
            <span class="glyph"></span>
          {/if}
          <span class="label">
            {pending === index ? 'Click again to confirm' : entry.label}
          </span>
        </button>
      {/if}
    {/each}
  </div>
{/if}

<style>
  .menu {
    position: fixed;
    z-index: 60;
    min-width: 190px;
    padding: 5px;
    border-radius: var(--r-md);
    background: var(--bg-tint);
    border: 1px solid var(--line);
    box-shadow: var(--shadow);
    outline: none;
    animation: pop var(--menu-duration) var(--ease);
  }

  @keyframes pop {
    from {
      opacity: 0;
      transform: translateY(-3px) scale(0.985);
    }
  }

  .entry {
    display: flex;
    align-items: center;
    gap: 9px;
    width: 100%;
    padding: 6px 9px;
    border-radius: var(--r-sm);
    font-size: 12.5px;
    text-align: left;
    color: var(--text);
    transition: background var(--dur) var(--ease), color var(--dur) var(--ease);
  }

  .entry:hover:not(:disabled),
  .entry:focus-visible {
    background: var(--accent-soft);
  }

  .entry:disabled {
    color: var(--text-faint);
    cursor: not-allowed;
  }

  .entry.danger:hover:not(:disabled) {
    color: #c9503f;
  }

  .glyph {
    display: flex;
    width: 14px;
    color: var(--text-faint);
  }

  .entry:hover .glyph {
    color: inherit;
  }

  .label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .rule {
    height: 1px;
    margin: 4px 6px;
    background: var(--line);
  }

  .colors {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 9px 4px;
  }

  .custom {
    padding: 2px 9px 7px;
  }

  .swatch {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: var(--tint);
    border: 1px solid rgba(0, 0, 0, 0.14);
    transition: transform var(--dur) var(--ease), box-shadow var(--dur) var(--ease);
  }

  .swatch.none {
    background: none;
    border-style: dashed;
    border-color: var(--text-faint);
  }

  .swatch:hover {
    transform: scale(1.15);
  }

  .swatch[aria-pressed='true'] {
    box-shadow: 0 0 0 2px var(--bg-tint), 0 0 0 3.5px var(--text-faint);
  }
</style>
