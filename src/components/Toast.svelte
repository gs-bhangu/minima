<script lang="ts">
  import { fly } from 'svelte/transition';
  import Glyph from './Glyph.svelte';
  import { settings } from '../lib/settings.svelte';
  import { toast } from '../lib/toast.svelte';

  const duration = $derived(settings.current.appearance.animations ? 180 : 0);
</script>

{#if toast.visible}
  <div class="toast" role="status" transition:fly={{ y: 12, duration }}>
    <span class="message">{toast.message}</span>
    {#if toast.actionLabel}
      <button class="action" type="button" onclick={() => toast.run()}>
        {toast.actionLabel}
      </button>
    {/if}
    <button
      class="close"
      type="button"
      aria-label="Dismiss"
      onclick={() => toast.dismiss()}
    >
      <Glyph name="close" size={12} />
    </button>
  </div>
{/if}

<style>
  .toast {
    position: fixed;
    left: 50%;
    bottom: 22px;
    z-index: 65;
    display: flex;
    align-items: center;
    gap: 12px;
    max-width: min(420px, calc(100vw - 32px));
    padding: 8px 10px 8px 14px;
    border-radius: 999px;
    background: var(--bg-tint);
    border: 1px solid var(--line);
    box-shadow: var(--shadow);
    transform: translateX(-50%);
  }

  .message {
    font-size: 12.5px;
    color: var(--text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .action {
    flex: none;
    padding: 3px 9px;
    border-radius: 999px;
    font-size: 11.5px;
    color: var(--accent-text);
    background: var(--accent-soft);
    transition: background var(--dur) var(--ease);
  }

  .action:hover {
    background: color-mix(in srgb, var(--accent) 22%, transparent);
  }

  .close {
    display: flex;
    flex: none;
    padding: 4px;
    border-radius: 50%;
    color: var(--text-faint);
    transition: color var(--dur) var(--ease), background var(--dur) var(--ease);
  }

  .close:hover {
    background: var(--surface);
    color: var(--text);
  }
</style>
