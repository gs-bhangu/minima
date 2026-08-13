<script lang="ts">
  import PanelShell from './PanelShell.svelte';
  import { settings } from '../lib/settings.svelte';

  interface Props {
    collapsed?: boolean;
    onToggle?: (key: string) => void;
  }

  let { collapsed = false, onToggle }: Props = $props();

  const notes = $derived(settings.current.notes);
  const words = $derived(notes.text.trim() ? notes.text.trim().split(/\s+/).length : 0);

  let field = $state<HTMLTextAreaElement | null>(null);

  // Grow with the content instead of showing an inner scrollbar.
  $effect(() => {
    if (!field) return;
    void notes.text;
    void collapsed;
    field.style.height = 'auto';
    field.style.height = `${Math.max(field.scrollHeight, 84)}px`;
  });
</script>

<PanelShell panel="notes" title="Notes" count={words} {collapsed} {onToggle}>
  <textarea
    bind:this={field}
    bind:value={notes.text}
    aria-label="Quick notes"
    placeholder="Write something down…"
    spellcheck="false"
  ></textarea>
</PanelShell>

<style>
  textarea {
    display: block;
    width: 100%;
    min-height: 84px;
    padding: 0 4px 4px;
    border: 0;
    outline: none;
    resize: none;
    overflow: hidden;
    background: none;
    font: inherit;
    font-size: 12.5px;
    line-height: 1.65;
    color: var(--text-muted);
  }

  textarea::placeholder {
    color: var(--text-faint);
  }
</style>
