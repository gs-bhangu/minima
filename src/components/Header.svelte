<script lang="ts">
  import { clock, formatDate, formatTime, greetingFor } from '../lib/clock.svelte';
  import { currencyInfo } from '../lib/currencies';
  import { currency } from '../lib/currency.svelte';
  import { settings } from '../lib/settings.svelte';
  import { weather } from '../lib/weather.svelte';
  import { readZone } from '../lib/timezones';
  import WeatherGlyph from './WeatherGlyph.svelte';

  interface Props {
    onOpenSettings: () => void;
  }

  let { onOpenSettings }: Props = $props();

  const config = $derived(settings.current);
  const now = $derived(clock.now);
  const time = $derived(formatTime(now, config.clock.hour12, config.clock.seconds));
  const greeting = $derived(
    config.greeting.name.trim()
      ? `${greetingFor(now)}, ${config.greeting.name.trim()}`
      : greetingFor(now),
  );
  const reading = $derived(weather.reading);
  const showMeta = $derived(config.date.enabled || config.weather.enabled);
  const unitMark = $derived(config.weather.unit === 'celsius' ? 'C' : 'F');
  const zones = $derived(
    config.clock.showZones
      ? config.clock.zones
          .map((zone) => readZone(zone, now, config.clock.hour12))
          .filter((zone) => zone !== null)
      : [],
  );
  const rates = $derived(
    config.currencies.enabled && currency.snapshot?.base === config.currencies.base
      ? currency.snapshot.rates
      : [],
  );
  const baseSymbol = $derived(currencyInfo(config.currencies.base).symbol);
</script>

<header
  class="header"
  style="--clock-scale: {config.clock.scale}; --detail-scale: {config.layout.detailScale}"
>
  {#if config.greeting.enabled}
    <p class="greeting">{greeting}</p>
  {/if}

  {#if config.clock.enabled}
    <div class="time" class:mono={config.clock.face === 'mono'}>
      <span>{time.text}</span>
      {#if time.suffix}<span class="suffix">{time.suffix}</span>{/if}
    </div>
  {/if}

  {#if showMeta}
    <div class="meta">
      {#if config.date.enabled}
        <span>{formatDate(now, config.date.format)}</span>
      {/if}

      {#if config.weather.enabled}
        {#if reading}
          {#if config.date.enabled}<span class="sep" aria-hidden="true"></span>{/if}
          <button
            class="weather"
            type="button"
            title="{reading.label} in {reading.place} — click to refresh"
            onclick={() => weather.load(config.weather.location, config.weather.unit, true)}
          >
            <WeatherGlyph
              glyph={reading.glyph}
              isDay={reading.isDay}
              size={Math.round(15 * config.layout.detailScale)}
            />
            <span>{reading.temperature}°{unitMark}</span>
            {#if config.weather.showCondition}
              <span class="condition">{reading.label}</span>
            {/if}
          </button>
        {:else if !config.weather.location}
          {#if config.date.enabled}<span class="sep" aria-hidden="true"></span>{/if}
          <button class="weather subtle" type="button" onclick={onOpenSettings}>
            Set location
          </button>
        {/if}
      {/if}
    </div>
  {/if}

  {#if zones.length}
    <div class="zones">
      {#each zones as zone (zone.id)}
        <span class="zone">
          <span class="zone-label">{zone.label}</span>
          <span class="zone-time">{zone.time}</span>
          {#if zone.dayShift !== 0}
            <span class="shift" title={zone.dayShift > 0 ? 'Tomorrow' : 'Yesterday'}>
              {zone.dayShift > 0 ? '+1' : '−1'}
            </span>
          {/if}
        </span>
      {/each}
    </div>
  {/if}

  {#if rates.length}
    <div class="rates" title="1 unit in {config.currencies.base}">
      {#each rates as rate (rate.code)}
        <span class="rate">
          <span class="rate-label">{rate.code}</span>
          <span class="rate-value">{baseSymbol}{rate.display}</span>
        </span>
      {/each}
    </div>
  {:else if config.currencies.enabled && !config.currencies.quotes.length}
    <button class="rates-empty" type="button" onclick={onOpenSettings}>Add currencies</button>
  {/if}
</header>

<style>
  .header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    text-align: center;
  }

  .greeting {
    font-size: calc(13px * var(--detail-scale));
    font-weight: 400;
    letter-spacing: 0.01em;
    color: var(--text-muted);
  }

  .time {
    display: flex;
    align-items: baseline;
    gap: 0.18em;
    font-family: var(--font-display);
    font-size: calc(clamp(3.1rem, 9.5vw, 6.4rem) * var(--clock-scale));
    font-weight: 250;
    line-height: 1;
    letter-spacing: -0.035em;
    font-variant-numeric: tabular-nums;
    font-feature-settings: 'tnum' 1, 'ss01' 1;
    color: var(--text);
  }

  .time.mono {
    font-family: var(--font-mono);
    font-weight: 300;
    letter-spacing: -0.06em;
  }

  .suffix {
    font-size: 0.24em;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-faint);
  }

  .meta {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: calc(9px * var(--detail-scale));
    font-size: calc(12.5px * var(--detail-scale));
    color: var(--text-muted);
  }

  .sep {
    width: calc(3px * var(--detail-scale));
    height: calc(3px * var(--detail-scale));
    border-radius: 50%;
    background: var(--text-faint);
    opacity: 0.6;
  }

  .weather {
    display: inline-flex;
    align-items: center;
    gap: calc(6px * var(--detail-scale));
    color: var(--text-muted);
    border-radius: var(--r-sm);
    padding: 2px 4px;
    margin: -2px -4px;
    transition: color var(--dur) var(--ease);
  }

  .weather:hover {
    color: var(--text);
  }

  .condition {
    color: var(--text-faint);
  }

  .subtle {
    color: var(--text-faint);
    border-bottom: 1px dashed var(--line);
    border-radius: 0;
  }

  .zones {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: calc(4px * var(--detail-scale)) calc(16px * var(--detail-scale));
    margin-top: calc(4px * var(--detail-scale));
    font-size: calc(11px * var(--detail-scale));
  }

  .zone {
    display: inline-flex;
    align-items: baseline;
    gap: calc(6px * var(--detail-scale));
  }

  .zone-label {
    font-size: calc(9.5px * var(--detail-scale));
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-faint);
  }

  .zone-time {
    font-variant-numeric: tabular-nums;
    color: var(--text-muted);
  }

  .shift {
    font-size: calc(9px * var(--detail-scale));
    font-variant-numeric: tabular-nums;
    color: var(--text-faint);
    opacity: 0.75;
  }

  .rates {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: calc(4px * var(--detail-scale)) calc(16px * var(--detail-scale));
    margin-top: calc(2px * var(--detail-scale));
    font-size: calc(11px * var(--detail-scale));
  }

  .rate {
    display: inline-flex;
    align-items: baseline;
    gap: calc(6px * var(--detail-scale));
  }

  .rate-label {
    font-size: calc(9.5px * var(--detail-scale));
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-faint);
  }

  .rate-value {
    font-variant-numeric: tabular-nums;
    color: var(--text-muted);
  }

  .rates-empty {
    margin-top: calc(2px * var(--detail-scale));
    font-size: calc(11px * var(--detail-scale));
    color: var(--text-faint);
    border-bottom: 1px dashed var(--line);
  }

  .rates-empty:hover {
    color: var(--text);
  }

  @media (max-width: 460px) {
    .condition {
      display: none;
    }

    .zones,
    .rates {
      gap: calc(3px * var(--detail-scale)) calc(12px * var(--detail-scale));
    }
  }
</style>
