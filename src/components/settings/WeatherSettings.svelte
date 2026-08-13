<script lang="ts">
  import Glyph from '../Glyph.svelte';
  import Row from '../controls/Row.svelte';
  import Segmented from '../controls/Segmented.svelte';
  import TextInput from '../controls/TextInput.svelte';
  import Toggle from '../controls/Toggle.svelte';
  import { settings } from '../../lib/settings.svelte';
  import {
    detectLocation,
    searchPlaces,
    weather,
    type GeoResult,
  } from '../../lib/weather.svelte';
  import type { TempUnit, WeatherLocation } from '../../lib/types';

  const config = $derived(settings.current.weather);

  let query = $state('');
  let results = $state<GeoResult[]>([]);
  let busy = $state(false);
  let error = $state('');

  const unitOptions: { value: TempUnit; label: string }[] = [
    { value: 'celsius', label: '°C' },
    { value: 'fahrenheit', label: '°F' },
  ];

  async function runSearch() {
    if (!query.trim()) return;
    busy = true;
    error = '';
    try {
      results = await searchPlaces(query.trim());
      if (!results.length) error = 'No matching place.';
    } catch {
      error = 'Search failed. Check your connection.';
    } finally {
      busy = false;
    }
  }

  async function detect() {
    busy = true;
    error = '';
    try {
      choose(await detectLocation());
    } catch {
      error = 'Could not detect your location.';
    } finally {
      busy = false;
    }
  }

  function choose(location: WeatherLocation) {
    config.location = {
      name: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
    };
    results = [];
    query = '';
    weather.load(config.location, config.unit, true);
  }
</script>

<Row label="Units">
  <Segmented bind:value={config.unit} options={unitOptions} label="Temperature units" />
</Row>

<Row label="Show condition" hint="Adds a short label next to the temperature.">
  <Toggle bind:checked={config.showCondition} label="Show condition" />
</Row>

<Row label="Location" stacked>
  <div class="location">
    {#if config.location}
      <div class="current">
        <Glyph name="pin" size={14} />
        <span>{config.location.name}</span>
        <button
          class="text-button"
          type="button"
          onclick={() => weather.load(config.location, config.unit, true)}
        >
          Refresh
        </button>
      </div>
    {/if}

    <div class="finder">
      <TextInput
        bind:value={query}
        label="Search for a city"
        placeholder="Search a city…"
        onEnter={runSearch}
      />
      <button
        class="ghost-button"
        type="button"
        onclick={runSearch}
        disabled={busy || !query.trim()}
      >
        <Glyph name="search" size={13} />
      </button>
      <button
        class="ghost-button"
        type="button"
        onclick={detect}
        disabled={busy}
        title="Detect approximate location from your IP address"
      >
        <Glyph name="pin" size={13} />
      </button>
    </div>

    {#if results.length}
      <ul class="results">
        {#each results as place (`${place.latitude},${place.longitude}`)}
          <li>
            <button type="button" onclick={() => choose(place)}>
              <span class="name">{place.name}</span>
              <span class="detail">{place.detail}</span>
            </button>
          </li>
        {/each}
      </ul>
    {/if}

    {#if error}<p class="error">{error}</p>{/if}
    {#if weather.error && !error}<p class="error">{weather.error}</p>{/if}
  </div>
</Row>

<style>
  .location {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  .current {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 12.5px;
    color: var(--text-muted);
  }

  .current span {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .finder {
    display: flex;
    gap: 6px;
  }

  .finder :global(.input) {
    flex: 1;
  }

  .results {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--line);
    border-radius: var(--r-sm);
    overflow: hidden;
  }

  .results button {
    display: flex;
    align-items: baseline;
    gap: 8px;
    width: 100%;
    padding: 7px 9px;
    text-align: left;
    transition: background var(--dur) var(--ease);
  }

  .results button:hover {
    background: var(--surface);
  }

  .name {
    font-size: 12.5px;
  }

  .detail {
    flex: 1;
    min-width: 0;
    font-size: 11px;
    color: var(--text-faint);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .error {
    font-size: 11.5px;
    color: #c9503f;
  }
</style>
