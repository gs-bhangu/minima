<script lang="ts">
  import Glyph from '../Glyph.svelte';
  import { settings } from '../../lib/settings.svelte';
  import {
    CURRENCIES,
    currencyInfo,
    formatRate,
    labelFor,
    makeQuote,
    resolveCurrency,
  } from '../../lib/currencies';
  import { currency } from '../../lib/currency.svelte';

  const config = $derived(settings.current.currencies);

  let query = $state('');
  let error = $state('');

  const baseOptions = CURRENCIES.map((entry) => ({
    value: entry.code,
    label: `${entry.code} — ${entry.name}`,
  }));

  const preview = $derived.by(() => {
    const snap = currency.snapshot;
    if (!snap || snap.base !== config.base) return new Map<string, string>();
    return new Map(snap.rates.map((rate) => [rate.code, `${rate.symbol}${rate.display}`]));
  });

  function add() {
    const code = resolveCurrency(query);
    if (!code) {
      error = 'No matching currency.';
      return;
    }
    if (code === config.base) {
      error = `${code} is already your base currency.`;
      return;
    }
    if (config.quotes.some((entry) => entry.code === code)) {
      error = `${code} is already listed.`;
      return;
    }
    config.quotes.push(makeQuote(code));
    config.enabled = true;
    query = '';
    error = '';
  }

  function remove(index: number) {
    config.quotes.splice(index, 1);
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= config.quotes.length) return;
    const [entry] = config.quotes.splice(index, 1);
    config.quotes.splice(target, 0, entry);
  }

  function setBase(event: Event) {
    const value = (event.currentTarget as HTMLSelectElement).value;
    config.base = value;
    config.quotes = config.quotes.filter((entry) => entry.code !== value);
  }
</script>

<div class="currencies">
  <div class="base">
    <select class="select" aria-label="Base currency" value={config.base} onchange={setBase}>
      {#each baseOptions as option (option.value)}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>
    <p class="hint">
      Rates show how much 1 unit of each currency below is worth in {config.base}.
    </p>
  </div>

  {#if config.quotes.length}
    <ul>
      {#each config.quotes as quote, index (quote.id)}
        {@const info = currencyInfo(quote.code)}
        <li class="row">
          <span class="code">{info.code}</span>
          <span class="name">{info.name}</span>
          <span class="now">{preview.get(quote.code) ?? (currency.loading ? '…' : '—')}</span>
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
              disabled={index === config.quotes.length - 1}
              onclick={() => move(index, 1)}
            >
              <Glyph name="down" size={13} />
            </button>
            <button type="button" aria-label="Remove" onclick={() => remove(index)}>
              <Glyph name="close" size={13} />
            </button>
          </div>
        </li>
      {/each}
    </ul>
  {/if}

  <div class="add">
    <input
      bind:value={query}
      list="minima-currencies"
      aria-label="Add a currency"
      placeholder="Add a currency — try USD"
      spellcheck="false"
      autocomplete="off"
      onkeydown={(event) => event.key === 'Enter' && add()}
    />
    <button class="ghost-button" type="button" onclick={add} disabled={!query.trim()}>
      <Glyph name="plus" size={13} />
    </button>
  </div>

  <datalist id="minima-currencies">
    {#each CURRENCIES as entry (entry.code)}
      <option value={entry.code}>{labelFor(entry.code)}</option>
    {/each}
  </datalist>

  {#if error}
    <p class="error">{error}</p>
  {:else if currency.error}
    <p class="error">{currency.error}</p>
  {:else if currency.snapshot?.date}
    <p class="hint">
      1 {config.quotes[0]?.code ?? 'USD'} ≈ {currencyInfo(config.base).symbol}{formatRate(
        currency.snapshot.rates[0]?.rate ?? 0,
      )}
      · updated {currency.snapshot.date}
    </p>
  {:else}
    <p class="hint">Powered by Frankfurter — free open exchange rates.</p>
  {/if}
</div>

<style>
  .currencies {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  .base {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .select {
    max-width: 100%;
    height: 30px;
    padding: 0 8px;
    border-radius: var(--r-sm);
    border: 1px solid var(--line);
    background: var(--bg-tint);
    font-size: 12.5px;
    cursor: pointer;
    outline: none;
    transition: border-color var(--dur) var(--ease);
  }

  .select:focus {
    border-color: color-mix(in srgb, var(--accent) 60%, var(--line));
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .row {
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    align-items: center;
    gap: 8px;
    padding: 4px 4px 4px 0;
    border-radius: var(--r-sm);
  }

  .row:hover {
    background: var(--surface);
  }

  .code {
    min-width: 2.4em;
    padding-left: 6px;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.04em;
    font-variant-numeric: tabular-nums;
  }

  .name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 12px;
    color: var(--text-faint);
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
