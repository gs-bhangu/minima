import { currencyInfo, formatRate, normalizeCode } from './currencies';

const CACHE_KEY = 'minima:rates';
const TTL_MS = 60 * 60 * 1000;
const API = 'https://api.frankfurter.dev/v2';

export interface RateReading {
  code: string;
  /** How much 1 unit of `code` is worth in the base currency. */
  rate: number;
  display: string;
  symbol: string;
}

export interface RatesSnapshot {
  base: string;
  date: string;
  rates: RateReading[];
  fetchedAt: number;
}

interface CacheEntry extends RatesSnapshot {
  signature: string;
}

function signatureOf(base: string, quotes: string[]) {
  return `${normalizeCode(base)}|${quotes.map(normalizeCode).sort().join(',')}`;
}

async function readCache(signature: string): Promise<RatesSnapshot | null> {
  try {
    const entry = (await browser.storage.local.get(CACHE_KEY))[CACHE_KEY] as
      | CacheEntry
      | undefined;
    if (!entry || entry.signature !== signature) return null;
    if (Date.now() - entry.fetchedAt > TTL_MS) return null;
    return entry;
  } catch {
    return null;
  }
}

interface FrankfurterRate {
  date: string;
  base: string;
  quote: string;
  rate: number;
}

/** Fetch how much 1 unit of each quote is worth in the home/base currency. */
async function fetchRates(base: string, quotes: string[]): Promise<RatesSnapshot> {
  const home = normalizeCode(base);
  const wanted = [...new Set(quotes.map(normalizeCode).filter((code) => code !== home))];
  if (!wanted.length) {
    return { base: home, date: '', rates: [], fetchedAt: Date.now() };
  }

  const symbol = currencyInfo(home).symbol;
  const rows = await Promise.all(
    wanted.map(async (code) => {
      const res = await fetch(`${API}/rate/${code}/${home}`);
      if (!res.ok) throw new Error('Rates unavailable');
      return (await res.json()) as FrankfurterRate;
    }),
  );

  const rates: RateReading[] = rows.map((row, index) => ({
    code: wanted[index],
    rate: row.rate,
    display: formatRate(row.rate),
    symbol,
  }));

  return {
    base: home,
    date: rows[0]?.date ?? '',
    rates,
    fetchedAt: Date.now(),
  };
}

class CurrencyStore {
  snapshot = $state<RatesSnapshot | null>(null);
  error = $state<string | null>(null);
  loading = $state(false);

  #inflight = '';

  async load(base: string, quotes: string[], force = false) {
    const cleaned = quotes.map(normalizeCode).filter(Boolean);
    if (!cleaned.length) {
      this.snapshot = null;
      this.error = null;
      return;
    }

    const signature = signatureOf(base, cleaned);
    if (this.#inflight === signature && !force) return;
    this.#inflight = signature;

    if (!force) {
      const cached = await readCache(signature);
      if (cached) {
        // Keep the user's quote order rather than the cache's sorted signature order.
        const byCode = new Map(cached.rates.map((rate) => [rate.code, rate]));
        this.snapshot = {
          ...cached,
          rates: cleaned
            .filter((code) => code !== normalizeCode(base))
            .map((code) => byCode.get(code))
            .filter((rate): rate is RateReading => !!rate),
        };
        this.error = null;
        return;
      }
    }

    this.loading = true;
    try {
      const snapshot = await fetchRates(base, cleaned);
      // Preserve settings order.
      const byCode = new Map(snapshot.rates.map((rate) => [rate.code, rate]));
      const ordered: RatesSnapshot = {
        ...snapshot,
        rates: cleaned
          .filter((code) => code !== normalizeCode(base))
          .map((code) => byCode.get(code))
          .filter((rate): rate is RateReading => !!rate),
      };
      this.snapshot = ordered;
      this.error = null;
      await browser.storage.local.set({
        [CACHE_KEY]: { ...ordered, signature } satisfies CacheEntry,
      });
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Rates unavailable';
    } finally {
      this.loading = false;
    }
  }
}

export const currency = new CurrencyStore();
