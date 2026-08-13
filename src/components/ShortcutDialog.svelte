<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import IconField from './controls/IconField.svelte';
  import TileIcon from './TileIcon.svelte';
  import { settings } from '../lib/settings.svelte';
  import { hostOf, normalizeUrl } from '../lib/icons';
  import type { DialogRequest, IconOverride } from '../lib/types';

  interface Props {
    request: DialogRequest | null;
    groups: { key: string; title: string }[];
    onClose: () => void;
  }

  let { request, groups, onClose }: Props = $props();

  let title = $state('');
  let url = $state('');
  let icon = $state<IconOverride>({ type: 'auto', value: '' });
  let sectionKey = $state('');
  let showIcon = $state(false);
  let urlField = $state<HTMLInputElement | null>(null);

  const duration = $derived(settings.current.appearance.animations ? 140 : 0);
  const valid = $derived(!!normalizeUrl(url));

  $effect(() => {
    if (!request) return;
    title = request.title;
    url = request.url;
    icon = request.icon;
    sectionKey = request.sectionKey;
    showIcon = request.icon.type !== 'auto';
    queueMicrotask(() => urlField?.focus());
  });

  function submit(event?: Event) {
    event?.preventDefault();
    if (!request || !valid) return;
    const address = normalizeUrl(url);
    request.onSubmit({
      title: title.trim() || hostOf(address),
      url: address,
      icon,
      sectionKey,
    });
    onClose();
  }
</script>

{#if request}
  <div class="scrim" role="presentation" onclick={onClose} transition:fade={{ duration }}></div>

  <div class="wrap">
    <form
      class="dialog"
      aria-label={request.heading}
      onsubmit={submit}
      transition:scale={{ duration, start: 0.97, opacity: 0 }}
    >
      <header>
        <span class="eyebrow">{request.heading}</span>
      </header>

      <div class="body">
        <label class="field">
          <span>Address</span>
          <input
            bind:this={urlField}
            bind:value={url}
            type="text"
            placeholder="example.com"
            spellcheck="false"
            autocomplete="off"
          />
        </label>

        <label class="field">
          <span>Name</span>
          <input
            bind:value={title}
            type="text"
            placeholder={url ? hostOf(normalizeUrl(url)) : 'Optional'}
            spellcheck="false"
            autocomplete="off"
          />
        </label>

        {#if groups.length > 1 && !request.lockSection}
          <label class="field">
            <span>Group</span>
            <select bind:value={sectionKey}>
              {#each groups as group (group.key)}
                <option value={group.key}>{group.title}</option>
              {/each}
            </select>
          </label>
        {/if}

        <div class="icon-row">
          <span class="preview">
            <TileIcon
              title={title}
              url={normalizeUrl(url) || 'https://example.com'}
              {icon}
              source={settings.current.appearance.iconSource}
            />
          </span>
          <button class="text-button" type="button" onclick={() => (showIcon = !showIcon)}>
            {showIcon ? 'Hide icon options' : 'Change icon'}
          </button>
        </div>

        {#if showIcon}
          <IconField {icon} onupdate={(next) => (icon = next)} />
        {/if}
      </div>

      <footer>
        <button class="ghost-button" type="button" onclick={onClose}>Cancel</button>
        <button class="ghost-button primary" type="submit" disabled={!valid}>Save</button>
      </footer>
    </form>
  </div>
{/if}

<style>
  .scrim {
    position: fixed;
    inset: 0;
    z-index: 70;
    background: color-mix(in srgb, var(--bg) 58%, transparent);
    backdrop-filter: blur(2px);
  }

  .wrap {
    position: fixed;
    inset: 0;
    z-index: 71;
    display: grid;
    place-items: center;
    padding: 20px;
    pointer-events: none;
  }

  .dialog {
    pointer-events: auto;
    width: min(360px, 100%);
    border-radius: var(--r-lg);
    background: var(--bg-tint);
    border: 1px solid var(--line);
    box-shadow: var(--shadow);
    overflow: hidden;
  }

  header {
    padding: 14px 16px 0;
  }

  .body {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px 16px 16px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .field span {
    font-size: 11.5px;
    color: var(--text-faint);
  }

  .field input,
  .field select {
    height: 32px;
    padding: 0 10px;
    border-radius: var(--r-sm);
    border: 1px solid var(--line);
    background: var(--bg);
    font-size: 13px;
    outline: none;
    transition: border-color var(--dur) var(--ease);
  }

  .field input:focus,
  .field select:focus {
    border-color: color-mix(in srgb, var(--accent) 60%, var(--line));
  }

  .icon-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-top: 2px;
  }

  .preview {
    --tile-icon: 30px;
    display: flex;
  }

  footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 16px;
    border-top: 1px solid var(--line);
    background: var(--bg);
  }

  .primary {
    color: var(--text);
    border-color: color-mix(in srgb, var(--accent) 45%, var(--line));
  }

  .primary:hover:not(:disabled) {
    background: color-mix(in srgb, var(--accent) 14%, transparent);
  }
</style>
