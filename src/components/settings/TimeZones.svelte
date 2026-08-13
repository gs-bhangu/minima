<script lang="ts">
  import Glyph from '../Glyph.svelte';
  import { settings } from '../../lib/settings.svelte';
  import {
    isValidTimeZone,
    labelFor,
    listTimeZones,
    localTimeZone,
    makeZone,
    readZone,
  } from '../../lib/timezones';
  import { clock } from '../../lib/clock.svelte';

  const config = $derived(settings.current.clock);
  const all = listTimeZones();

  let query = $state('');
  let error = $state('');

  /** Accepts an exact IANA id, or a loose name like "tokyo" / "new york". */
  function resolve(input: string) {
    const value = input.trim();
    if (!value) return null;
    if (isValidTimeZone(value) && all.includes(value)) return value;
    const needle = value.toLowerCase().replace(/\s+/g, '_');
    return (
      all.find((zone) => zone.toLowerCase() === needle) ??
      all.find((zone) => zone.toLowerCase().split('/').pop() === needle) ??
      all.find((zone) => zone.toLowerCase().includes(needle)) ??
      null
    );
  }

  function add() {
    const zone = resolve(query);
    if (!zone) {
      error = 'No matching time zone.';
      return;
    }
    if (config.zones.some((entry) => entry.timeZone === zone)) {
      error = `${labelFor(zone)} is already listed.`;
      return;
    }
    config.zones.push(makeZone(zone));
    config.showZones = true;
    query = '';
    error = '';
  }

  function remove(index: number) {
    config.zones.splice(index, 1);
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= config.zones.length) return;
    const [entry] = config.zones.splice(index, 1);
    config.zones.splice(target, 0, entry);
  }
</script>

<div class="zones">
  {#if config.zones.length}
    <ul>
      {#each config.zones as zone, index (zone.id)}
        <li class="row">
          <input
            class="label"
            bind:value={zone.label}
            aria-label="Label for {zone.timeZone}"
            placeholder={labelFor(zone.timeZone)}
            spellcheck="false"
          />
          <span class="now">{readZone(zone, clock.now, config.hour12)?.time ?? '—'}</span>
          <div class="actions">
            <button
              type="button"
              aria-label="Move up"
              disabled={index === 0}
              onclick={() => move(index, -1)}
            >
              <Glyph name="up" size={13} />
            </button>
            <button
              type="button"
              aria-label="Move down"
              disabled={index === config.zones.length - 1}
              onclick={() => move(index, 1)}
            >
              <Glyph name="down" size={13} />
            </button>
            <button type="button" aria-label="Remove" onclick={() => remove(index)}>
              <Glyph name="close" size={13} />
            </button>
          </div>
          <span class="tz">{zone.timeZone}</span>
        </li>
      {/each}
    </ul>
  {/if}

  <div class="add">
    <input
      bind:value={query}
      list="minima-timezones"
      aria-label="Add a time zone"
      placeholder="Add a city or zone — try Tokyo"
      spellcheck="false"
      autocomplete="off"
      onkeydown={(event) => event.key === 'Enter' && add()}
    />
    <button class="ghost-button" type="button" onclick={add} disabled={!query.trim()}>
      <Glyph name="plus" size={13} />
    </button>
  </div>

  <datalist id="minima-timezones">
    {#each all as zone (zone)}
      <option value={zone}>{labelFor(zone)}</option>
    {/each}
  </datalist>

  {#if error}
    <p class="error">{error}</p>
  {:else}
    <p class="hint">Your own zone is {localTimeZone()}.</p>
  {/if}
</div>

<style>
  .zones {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .row {
    display: grid;
    grid-template-columns: 1fr auto auto;
    align-items: center;
    gap: 8px;
    padding: 4px 4px 4px 0;
    border-radius: var(--r-sm);
  }

  .row:hover {
    background: var(--surface);
  }

  .label {
    min-width: 0;
    height: 24px;
    padding: 0 6px;
    border: 1px solid transparent;
    border-radius: var(--r-sm);
    background: none;
    font-size: 12.5px;
    outline: none;
  }

  .label:hover,
  .label:focus {
    border-color: var(--line);
    background: var(--bg-tint);
  }

  .now {
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    color: var(--text-faint);
  }

  .actions {
    display: flex;
    gap: 1px;
  }

  .actions button {
    display: flex;
    padding: 4px;
    border-radius: 4px;
    color: var(--text-faint);
    opacity: 0;
    transition: opacity var(--dur) var(--ease), color var(--dur) var(--ease);
  }

  .row:hover .actions button,
  .actions button:focus-visible {
    opacity: 1;
  }

  .actions button:disabled {
    opacity: 0.25;
    cursor: not-allowed;
  }

  .actions button:hover:not(:disabled) {
    color: var(--text);
  }

  .tz {
    grid-column: 1 / -1;
    padding-left: 6px;
    font-size: 10px;
    letter-spacing: 0.04em;
    color: var(--text-faint);
    opacity: 0.7;
  }

  .add {
    display: flex;
    gap: 6px;
  }

  .add input {
    flex: 1;
    min-width: 0;
    height: 30px;
    padding: 0 10px;
    border-radius: var(--r-sm);
    border: 1px solid var(--line);
    background: var(--bg-tint);
    font-size: 12.5px;
    outline: none;
    transition: border-color var(--dur) var(--ease);
  }

  .add input:focus {
    border-color: color-mix(in srgb, var(--accent) 60%, var(--line));
  }

  .hint,
  .error {
    font-size: 11.5px;
    color: var(--text-faint);
  }

  .error {
    color: #c9503f;
  }
</style>
