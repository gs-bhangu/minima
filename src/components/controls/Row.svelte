<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    label: string;
    hint?: string;
    stacked?: boolean;
    children: Snippet;
  }

  let { label, hint = '', stacked = false, children }: Props = $props();
</script>

<div class="row" class:stacked>
  <div class="text">
    <span class="label">{label}</span>
    {#if hint}<span class="hint">{hint}</span>{/if}
  </div>
  <div class="control">{@render children()}</div>
</div>

<style>
  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 9px 0;
  }

  .row.stacked {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .label {
    font-size: 13px;
    color: var(--text);
  }

  .hint {
    font-size: 11.5px;
    line-height: 1.35;
    color: var(--text-faint);
  }

  .control {
    flex: none;
    display: flex;
    justify-content: flex-end;
    min-width: 0;
  }

  .row.stacked .control {
    flex: 1;
    justify-content: stretch;
  }
</style>
