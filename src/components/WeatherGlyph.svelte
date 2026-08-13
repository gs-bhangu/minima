<script lang="ts">
  import type { WeatherGlyph } from '../lib/weather.svelte';

  interface Props {
    glyph: WeatherGlyph;
    isDay?: boolean;
    size?: number;
  }

  let { glyph, isDay = true, size = 15 }: Props = $props();

  const CLOUD = 'M7.2 18.5h9.3a3.4 3.4 0 00.3-6.8 5 5 0 00-9.5-1.1 3.9 3.9 0 00-.1 7.9z';
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.4"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  {#if glyph === 'clear' && isDay}
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.5 1.5M16.9 16.9l1.5 1.5M18.4 5.6l-1.5 1.5M7.1 16.9l-1.5 1.5" />
  {:else if glyph === 'clear'}
    <path d="M20 14.6A8.2 8.2 0 019.4 4a8.4 8.4 0 1010.6 10.6z" />
  {:else if glyph === 'partly'}
    <circle cx="8.5" cy="8" r="3" />
    <path d="M8.5 2.6v1.6M3.1 8h1.6M4.7 4.2l1.1 1.1M12.3 4.2l-1.1 1.1" />
    <path d="M10 19.5h7.4a3.1 3.1 0 00.3-6.2 4.6 4.6 0 00-8.8-.8 3.5 3.5 0 001.1 7z" />
  {:else if glyph === 'cloud'}
    <path d={CLOUD} />
  {:else if glyph === 'fog'}
    <path d="M4 15.5a3.8 3.8 0 013.1-6.2 5 5 0 019.5 1.1 3.4 3.4 0 011.4 5" />
    <path d="M4 18.2h9M16 18.2h4M7 21h10" />
  {:else if glyph === 'drizzle'}
    <path d="M6.9 15.6a3.7 3.7 0 01.2-7.4 4.9 4.9 0 019.3 1.1 3.3 3.3 0 01.4 6.4" />
    <path d="M9.5 18.4v1.2M13 17.8v1.2M16.4 18.4v1.2" />
  {:else if glyph === 'rain'}
    <path d="M6.9 14.6a3.7 3.7 0 01.2-7.4 4.9 4.9 0 019.3 1.1 3.3 3.3 0 01.4 6.4" />
    <path d="M9.2 17l-1.1 3.2M13 17l-1.1 3.2M16.8 17l-1.1 3.2" />
  {:else if glyph === 'snow'}
    <path d="M6.9 14.6a3.7 3.7 0 01.2-7.4 4.9 4.9 0 019.3 1.1 3.3 3.3 0 01.4 6.4" />
    <path d="M9 18.4h.01M12.4 20h.01M15.8 18.4h.01M12.4 17h.01" />
  {:else if glyph === 'storm'}
    <path d="M6.9 14.6a3.7 3.7 0 01.2-7.4 4.9 4.9 0 019.3 1.1 3.3 3.3 0 01.4 6.4" />
    <path d="M13.4 16.2l-3 3.6h3.2l-1.4 3.2" />
  {/if}
</svg>
