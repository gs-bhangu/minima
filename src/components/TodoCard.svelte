<script lang="ts">
  import Glyph from './Glyph.svelte';
  import PanelShell from './PanelShell.svelte';
  import { settings } from '../lib/settings.svelte';

  interface Props {
    collapsed?: boolean;
    onToggle?: (key: string) => void;
  }

  let { collapsed = false, onToggle }: Props = $props();

  const items = $derived(settings.current.todos.items);
  const open = $derived(items.filter((item) => !item.done).length);
  const done = $derived(items.length - open);

  let draft = $state('');
  let draftField = $state<HTMLInputElement | null>(null);
  let rows = $state<HTMLInputElement[]>([]);

  function add() {
    const text = draft.trim();
    if (!text) return;
    items.push({ id: crypto.randomUUID(), text, done: false });
    draft = '';
  }

  function remove(index: number) {
    items.splice(index, 1);
  }

  function clearDone() {
    settings.current.todos.items = items.filter((item) => !item.done);
  }

  /** Empty a row and press backspace to delete it, like a text editor. */
  function onRowKeydown(event: KeyboardEvent, index: number) {
    if (event.key === 'Enter') {
      event.preventDefault();
      draftField?.focus();
      return;
    }
    if (event.key === 'Backspace' && !items[index].text) {
      event.preventDefault();
      remove(index);
      queueMicrotask(() => (index > 0 ? rows[index - 1] : draftField)?.focus());
    }
  }
</script>

<PanelShell panel="todos" title="To-do" count={open} {collapsed} {onToggle}>
  {#snippet actions()}
    {#if done > 0}
      <span
        class="clear"
        role="button"
        tabindex="0"
        title="Clear {done} completed"
        onclick={(event) => {
          event.stopPropagation();
          clearDone();
        }}
        onkeydown={(event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          event.stopPropagation();
          clearDone();
        }}
      >
        Clear done
      </span>
    {/if}
  {/snippet}

  <ul>
    {#each items as item, index (item.id)}
      <li class="item" class:done={item.done}>
        <button
          class="box"
          type="button"
          role="checkbox"
          aria-checked={item.done}
          aria-label="Mark “{item.text}” {item.done ? 'not done' : 'done'}"
          onclick={() => (item.done = !item.done)}
        >
          {#if item.done}<Glyph name="check" size={11} strokeWidth={2.2} />{/if}
        </button>
        <input
          bind:this={rows[index]}
          bind:value={item.text}
          aria-label="Task"
          spellcheck="false"
          onkeydown={(event) => onRowKeydown(event, index)}
        />
        <button
          class="remove"
          type="button"
          aria-label="Remove task"
          onclick={() => remove(index)}
        >
          <Glyph name="close" size={12} />
        </button>
      </li>
    {/each}

    <li class="item draft">
      <span class="box ghost" aria-hidden="true"></span>
      <input
        bind:this={draftField}
        bind:value={draft}
        placeholder="Add a task"
        aria-label="Add a task"
        spellcheck="false"
        onkeydown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            add();
          }
        }}
        onblur={add}
      />
    </li>
  </ul>
</PanelShell>

<style>
  .clear {
    flex: none;
    font-size: 10px;
    color: var(--text-faint);
    cursor: pointer;
    opacity: 0;
    transition: opacity var(--dur) var(--ease), color var(--dur) var(--ease);
  }

  :global(.card:hover) .clear,
  .clear:focus-visible {
    opacity: 1;
  }

  .clear:hover {
    color: var(--accent-text);
  }

  .item {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 1px 4px;
    border-radius: var(--r-sm);
  }

  .item:hover {
    background: var(--surface);
  }

  .box {
    display: grid;
    place-items: center;
    flex: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 1px solid var(--line);
    color: #fff;
    transition: border-color var(--dur) var(--ease), background var(--dur) var(--ease);
  }

  .box:hover {
    border-color: var(--accent-line);
  }

  .item.done .box {
    background: var(--accent);
    border-color: transparent;
  }

  .box.ghost {
    border-style: dashed;
    opacity: 0.5;
  }

  input {
    flex: 1;
    min-width: 0;
    height: 26px;
    border: 0;
    outline: none;
    background: none;
    font-size: 12.5px;
    color: var(--text);
  }

  input::placeholder {
    color: var(--text-faint);
  }

  .item.done input {
    color: var(--text-faint);
    text-decoration: line-through;
    text-decoration-thickness: 1px;
  }

  .remove {
    display: flex;
    flex: none;
    padding: 3px;
    border-radius: 4px;
    color: var(--text-faint);
    opacity: 0;
    transition: opacity var(--dur) var(--ease), color var(--dur) var(--ease);
  }

  .item:hover .remove,
  .remove:focus-visible {
    opacity: 1;
  }

  .remove:hover {
    color: var(--accent-text);
  }
</style>
