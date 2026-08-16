<script lang="ts">
  import Glyph from './Glyph.svelte';
  import TileIcon from './TileIcon.svelte';
  import { settings } from '../lib/settings.svelte';
  import { sections } from '../lib/sections.svelte';
  import { resolveQuery } from '../lib/search';
  import { hostOf, looksLikeUrl } from '../lib/icons';
  import type { ResolvedTile } from '../lib/types';

  const config = $derived(settings.current.search);

  let value = $state('');
  let focused = $state(false);
  let highlight = $state(-1);
  let input = $state<HTMLInputElement | null>(null);

  export function focus() {
    input?.focus();
  }

  const isAddress = $derived(looksLikeUrl(value));

  const matches = $derived.by<ResolvedTile[]>(() => {
    const needle = value.trim().toLowerCase();
    if (!config.quickSwitch || needle.length < 1 || isAddress) return [];
    const found: ResolvedTile[] = [];
    for (const section of sections.all) {
      for (const tile of section.tiles) {
        if (
          tile.title.toLowerCase().includes(needle) ||
          hostOf(tile.url).toLowerCase().includes(needle)
        ) {
          found.push(tile);
        }
        if (found.length >= 5) return found;
      }
    }
    return found;
  });

  const showMatches = $derived(focused && matches.length > 0);

  // Keep the highlight inside the current result list.
  $effect(() => {
    if (highlight >= matches.length) highlight = -1;
  });

  function go(url: string) {
    if (!url) return;
    if (config.newTab) window.open(url, '_blank', 'noopener');
    else window.location.href = url;
  }

  async function submit(event?: Event) {
    event?.preventDefault();
    if (highlight >= 0 && matches[highlight]) {
      go(matches[highlight].url);
      return;
    }
    const resolved = resolveQuery(value);
    if (!resolved) return;
    if (resolved.kind === 'url') {
      go(resolved.url);
      return;
    }
    await browser.search.query({
      text: resolved.text,
      disposition: config.newTab ? 'NEW_TAB' : 'CURRENT_TAB',
    });
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.stopPropagation();
      if (highlight >= 0) highlight = -1;
      else if (value) value = '';
      else input?.blur();
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (!matches.length) return;
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      highlight = Math.max(-1, Math.min(matches.length - 1, highlight + step));
    }
  }
</script>

<div class="search-wrap" class:focused>
  <form class="search" onsubmit={submit} role="search">
    <span class="icon"><Glyph name="search" size={15} /></span>
    <input
      bind:this={input}
      bind:value
      type="text"
      spellcheck="false"
      autocomplete="off"
      aria-label="Search the web or enter an address"
      placeholder="Search or enter address"
      onfocus={() => (focused = true)}
      onblur={() => setTimeout(() => (focused = false), 120)}
      onkeydown={onKeydown}
    />

    {#if isAddress}
      <span class="chip">Go</span>
    {/if}
  </form>

  {#if showMatches}
    <div class="panel">
      {#each matches as match, index (match.key)}
        <button
          class="option match"
          class:active={highlight === index}
          type="button"
          onmouseenter={() => (highlight = index)}
          onclick={() => go(match.url)}
        >
          <span class="match-icon">
            <TileIcon
              title={match.title}
              url={match.url}
              icon={match.icon}
              source={settings.current.appearance.iconSource}
            />
          </span>
          <span class="option-label">{match.title}</span>
          <span class="host">{hostOf(match.url)}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .search-wrap {
    position: relative;
    width: 100%;
    max-width: 440px;
    margin: 0 auto;
    transition: max-width var(--dur) var(--ease);
  }

  .search-wrap.focused {
    max-width: 520px;
  }

  .search {
    display: flex;
    align-items: center;
    gap: 9px;
    width: 100%;
    height: 38px;
    padding: 0 6px 0 13px;
    border-radius: 999px;
    border: 1px solid transparent;
    background: var(--surface);
    color: var(--text-muted);
    transition: background var(--dur) var(--ease), border-color var(--dur) var(--ease),
      box-shadow var(--dur) var(--ease);
  }

  .search:hover {
    background: var(--surface-hover);
  }

  .search-wrap.focused .search {
    background: var(--bg-tint);
    border-color: var(--accent-line);
    box-shadow: var(--shadow), 0 0 0 3px var(--accent-soft);
  }

  .icon {
    display: flex;
    color: var(--text-faint);
    transition: color var(--dur) var(--ease);
  }

  .search-wrap.focused .icon {
    color: var(--text-muted);
  }

  input {
    flex: 1;
    min-width: 0;
    height: 100%;
    border: 0;
    outline: none;
    background: none;
    font-size: 13.5px;
    color: var(--text);
  }

  input::placeholder {
    color: var(--text-faint);
  }

  .chip {
    display: inline-flex;
    align-items: center;
    flex: none;
    height: 26px;
    padding: 0 10px;
    border-radius: 999px;
    font-size: 10.5px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-faint);
    background: var(--surface);
  }

  .panel {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    z-index: 20;
    padding: 5px;
    border-radius: var(--r-md);
    background: var(--bg-tint);
    border: 1px solid var(--line);
    box-shadow: var(--shadow);
    max-height: min(480px, 66vh);
    overflow-y: auto;
  }

  .option {
    display: flex;
    align-items: center;
    gap: 9px;
    width: 100%;
    padding: 7px 10px;
    border-radius: var(--r-sm);
    font-size: 12.5px;
    text-align: left;
    color: var(--text);
    transition: background var(--dur) var(--ease);
  }

  .option:hover,
  .option.active {
    background: var(--accent-soft);
  }

  .option-label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .match-icon {
    --tile-icon: 22px;
    display: flex;
    flex: none;
    filter: grayscale(var(--grayscale));
  }

  .host {
    flex: none;
    font-size: 10.5px;
    color: var(--text-faint);
  }
</style>
