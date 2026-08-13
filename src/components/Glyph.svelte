<script lang="ts">
  import type { GlyphName } from '../lib/glyphs';

  interface Props {
    name: GlyphName;
    size?: number;
    strokeWidth?: number;
  }

  let { name, size = 16, strokeWidth = 1.5 }: Props = $props();
</script>

<svg
  class="glyph"
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width={strokeWidth}
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  {#if name === 'search'}
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4.5 4.5" />
  {:else if name === 'settings'}
    <path d="M3.5 8h8.5M17 8h3.5M3.5 16h4.5M13 16h7.5" />
    <circle cx="14.5" cy="8" r="2.4" />
    <circle cx="10.5" cy="16" r="2.4" />
  {:else if name === 'chevron'}
    <path d="M6.5 9.5L12 15l5.5-5.5" />
  {:else if name === 'plus'}
    <path d="M12 5.5v13M5.5 12h13" />
  {:else if name === 'close'}
    <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
  {:else if name === 'trash'}
    <path d="M4.5 7h15M9.5 7V4.8h5V7M6.8 7l.9 12.2h8.6L17.2 7" />
  {:else if name === 'eye'}
    <path d="M2.5 12s3.6-6 9.5-6 9.5 6 9.5 6-3.6 6-9.5 6-9.5-6-9.5-6z" />
    <circle cx="12" cy="12" r="2.6" />
  {:else if name === 'eye-off'}
    <path d="M4 4l16 16" />
    <path d="M9.6 9.7A2.6 2.6 0 0012 14.6M6.2 6.9C3.9 8.5 2.5 12 2.5 12s3.6 6 9.5 6c1.7 0 3.2-.5 4.5-1.2M18.6 15c1.9-1.6 2.9-3 2.9-3s-3.6-6-9.5-6c-.7 0-1.4.1-2 .2" />
  {:else if name === 'check'}
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  {:else if name === 'folder'}
    <path d="M3.5 6.8A1.3 1.3 0 014.8 5.5h4l1.8 2.2h7.6a1.3 1.3 0 011.3 1.3v8.7a1.3 1.3 0 01-1.3 1.3H4.8a1.3 1.3 0 01-1.3-1.3z" />
  {:else if name === 'refresh'}
    <path d="M20 12a8 8 0 11-2.6-5.9M20 4.5V10h-5.5" />
  {:else if name === 'pin'}
    <path d="M12 21v-6" />
    <path d="M8.4 4h7.2l-1 5.4 2.4 2.6v1.5H7l-.0-1.5 2.4-2.6z" />
  {:else if name === 'up'}
    <path d="M12 19V5.5M6 11l6-6 6 6" />
  {:else if name === 'down'}
    <path d="M12 5v13.5M18 13l-6 6-6-6" />
  {:else if name === 'grip'}
    <circle cx="9.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="14.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="9.5" cy="12" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="14.5" cy="12" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="9.5" cy="17.5" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="14.5" cy="17.5" r="1.1" fill="currentColor" stroke="none" />
  {:else if name === 'link'}
    <path d="M10.5 13.5a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1.2 1.2" />
    <path d="M13.5 10.5a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1.2-1.2" />
  {:else if name === 'folder-plus'}
    <path d="M3.5 6.8A1.3 1.3 0 014.8 5.5h4l1.8 2.2h7.6a1.3 1.3 0 011.3 1.3v8.7a1.3 1.3 0 01-1.3 1.3H4.8a1.3 1.3 0 01-1.3-1.3z" />
    <path d="M12 10.6v5.6M9.2 13.4h5.6" />
  {:else if name === 'left'}
    <path d="M14.5 5.5L8 12l6.5 6.5" />
  {:else if name === 'right'}
    <path d="M9.5 5.5L16 12l-6.5 6.5" />
  {:else if name === 'pencil'}
    <path d="M4.5 19.5h3.2L19 8.2a2.3 2.3 0 00-3.2-3.2L4.5 16.3z" />
    <path d="M14.4 6.4l3.2 3.2" />
  {:else if name === 'droplet'}
    <path d="M12 3.5s6 6.2 6 10.1a6 6 0 01-12 0C6 9.7 12 3.5 12 3.5z" />
  {:else if name === 'clock'}
    <circle cx="12" cy="12" r="8.2" />
    <path d="M12 7.4V12l3 2" />
  {:else if name === 'external'}
    <path d="M14 4.5h5.5V10" />
    <path d="M19.5 4.5L11 13" />
    <path d="M18 14.5v4a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 014 18.5v-11A1.5 1.5 0 015.5 6h4" />
  {/if}
</svg>

<style>
  .glyph {
    display: block;
    flex: none;
  }
</style>
