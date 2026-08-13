import type { TempUnit, WeatherLocation } from './types';

const CACHE_KEY = 'minima:weather';
const TTL_MS = 20 * 60 * 1000;

export type WeatherGlyph =
  | 'clear'
  | 'partly'
  | 'cloud'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'storm';

export interface WeatherReading {
  temperature: number;
  unit: TempUnit;
  code: number;
  isDay: boolean;
  label: string;
  glyph: WeatherGlyph;
  place: string;
  fetchedAt: number;
}

interface CacheEntry extends WeatherReading {
  signature: string;
}

/** WMO weather interpretation codes, condensed to the few shapes we draw. */
const WMO: Record<number, [string, WeatherGlyph]> = {
  0: ['Clear', 'clear'],
  1: ['Mostly clear', 'partly'],
  2: ['Partly cloudy', 'partly'],
  3: ['Overcast', 'cloud'],
  45: ['Fog', 'fog'],
  48: ['Rime fog', 'fog'],
  51: ['Light drizzle', 'drizzle'],
  53: ['Drizzle', 'drizzle'],
  55: ['Heavy drizzle', 'drizzle'],
  56: ['Freezing drizzle', 'drizzle'],
  57: ['Freezing drizzle', 'drizzle'],
  61: ['Light rain', 'rain'],
  63: ['Rain', 'rain'],
  65: ['Heavy rain', 'rain'],
  66: ['Freezing rain', 'rain'],
  67: ['Freezing rain', 'rain'],
  71: ['Light snow', 'snow'],
  73: ['Snow', 'snow'],
  75: ['Heavy snow', 'snow'],
  77: ['Snow grains', 'snow'],
  80: ['Showers', 'rain'],
  81: ['Showers', 'rain'],
  82: ['Heavy showers', 'rain'],
  85: ['Snow showers', 'snow'],
  86: ['Snow showers', 'snow'],
  95: ['Thunderstorm', 'storm'],
  96: ['Thunderstorm', 'storm'],
  99: ['Thunderstorm', 'storm'],
};

function describe(code: number): [string, WeatherGlyph] {
  return WMO[code] ?? ['—', 'cloud'];
}

function signatureOf(location: WeatherLocation, unit: TempUnit) {
  return `${location.latitude.toFixed(2)},${location.longitude.toFixed(2)},${unit}`;
}

export interface GeoResult extends WeatherLocation {
  detail: string;
}

export async function searchPlaces(query: string): Promise<GeoResult[]> {
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.searchParams.set('name', query);
  url.searchParams.set('count', '6');
  url.searchParams.set('language', 'en');
  url.searchParams.set('format', 'json');

  const res = await fetch(url);
  if (!res.ok) throw new Error('Place lookup failed');
  const data = await res.json();
  return (data.results ?? []).map((r: any) => ({
    name: r.name,
    latitude: r.latitude,
    longitude: r.longitude,
    detail: [r.admin1, r.country].filter(Boolean).join(', '),
  }));
}

/** Approximate location from the IP address — no permission prompt needed. */
export async function detectLocation(): Promise<WeatherLocation> {
  const res = await fetch('https://ipapi.co/json/');
  if (!res.ok) throw new Error('Could not detect location');
  const data = await res.json();
  if (typeof data.latitude !== 'number') throw new Error('Could not detect location');
  return {
    name: data.city || data.region || data.country_name || 'Here',
    latitude: data.latitude,
    longitude: data.longitude,
  };
}

async function readCache(signature: string): Promise<WeatherReading | null> {
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

async function fetchReading(
  location: WeatherLocation,
  unit: TempUnit,
): Promise<WeatherReading> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(location.latitude));
  url.searchParams.set('longitude', String(location.longitude));
  url.searchParams.set('current', 'temperature_2m,weather_code,is_day');
  url.searchParams.set('temperature_unit', unit);
  url.searchParams.set('timezone', 'auto');

  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather unavailable');
  const data = await res.json();
  const current = data.current;
  if (!current) throw new Error('Weather unavailable');

  const [label, glyph] = describe(current.weather_code);
  return {
    temperature: Math.round(current.temperature_2m),
    unit,
    code: current.weather_code,
    isDay: current.is_day === 1,
    label,
    glyph,
    place: location.name,
    fetchedAt: Date.now(),
  };
}

class WeatherStore {
  reading = $state<WeatherReading | null>(null);
  error = $state<string | null>(null);
  loading = $state(false);

  #inflight = '';

  async load(location: WeatherLocation | null, unit: TempUnit, force = false) {
    if (!location) {
      this.reading = null;
      this.error = null;
      return;
    }
    const signature = signatureOf(location, unit);
    if (this.#inflight === signature && !force) return;
    this.#inflight = signature;

    if (!force) {
      const cached = await readCache(signature);
      if (cached) {
        this.reading = { ...cached, place: location.name };
        this.error = null;
        return;
      }
    }

    this.loading = true;
    try {
      const reading = await fetchReading(location, unit);
      this.reading = reading;
      this.error = null;
      await browser.storage.local.set({
        [CACHE_KEY]: { ...reading, signature } satisfies CacheEntry,
      });
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Weather unavailable';
    } finally {
      this.loading = false;
    }
  }
}

export const weather = new WeatherStore();
