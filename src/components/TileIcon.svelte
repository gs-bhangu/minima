<script lang="ts">
  import type { IconOverride, IconSource } from '../lib/types';
  import { hueOf, hostOf, localFaviconUrl, monogramOf, remoteFaviconUrl } from '../lib/icons';

  interface Props {
    title: string;
    url: string;
    icon: IconOverride;
    source: IconSource;
  }

  let { title, url, icon, source }: Props = $props();

  const sources = $derived.by(() => {
    if (icon.type === 'url' && icon.value.trim()) return [icon.value.trim()];
    if (icon.type === 'emoji' || icon.type === 'text') return [];
    return source === 'online'
      ? [remoteFaviconUrl(url, 64), localFaviconUrl(url, 64)]
      : [localFaviconUrl(url, 64)];
  });

  let failed = $state(0);
  // Restart the fallback chain whenever the icon configuration changes.
  $effect(() => {
    void sources;
    failed = 0;
  });

  const current = $derived(sources[failed]);
  const glyphText = $derived(
    icon.type === 'emoji' && icon.value
      ? icon.value
      : icon.type === 'text' && icon.value
        ? icon.value.slice(0, 2)
        : monogramOf(title, url),
  );
  const hue = $derived(hueOf(hostOf(url) || title));
</script>

<span class="icon" style="--hue: {hue}">
  {#if current}
    <img
      src={current}
      alt=""
      loading="lazy"
      draggable="false"
      onerror={() => (failed += 1)}
    />
  {:else}
    <span class="glyph" class:emoji={icon.type === 'emoji'}>{glyphText}</span>
  {/if}
</span>

<style>
  .icon {
    position: relative;
    display: grid;
    place-items: center;
    width: var(--tile-icon);
    height: var(--tile-icon);
    border-radius: var(--icon-radius);
    background: var(--surface);
    border: 1px solid var(--card-line);
    overflow: hidden;
    transition: background var(--dur) var(--ease), border-color var(--dur) var(--ease),
      transform var(--dur) var(--ease);
  }

  img {
    width: 56%;
    height: 56%;
    object-fit: contain;
  }

  .glyph {
    font-size: calc(var(--tile-icon) * 0.4);
    font-weight: 500;
    line-height: 1;
    letter-spacing: -0.02em;
    color: hsl(var(--hue) 22% 45%);
  }

  :global(:root[data-theme='dark']) .glyph {
    color: hsl(var(--hue) 18% 68%);
  }

  .glyph.emoji {
    font-size: calc(var(--tile-icon) * 0.46);
    color: inherit;
  }
</style>
