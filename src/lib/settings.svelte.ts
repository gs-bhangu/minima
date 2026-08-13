import { DEFAULT_SETTINGS, SETTINGS_VERSION } from './defaults';
import type { Settings } from './types';

const KEY = 'minima:settings';
const SAVE_DEBOUNCE_MS = 180;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Deep-merges stored data onto the defaults so new keys appear after updates. */
function mergeDefaults<T>(base: T, patch: unknown): T {
  if (!isPlainObject(patch) || !isPlainObject(base)) {
    return (patch === undefined ? base : (patch as T));
  }
  // An empty default object is a free-form dictionary (icon and colour maps),
  // so its stored keys are unknown ahead of time and must be kept verbatim.
  if (Object.keys(base).length === 0) return { ...patch } as T;

  const out: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (!(key in out)) continue;
    out[key] = isPlainObject(out[key])
      ? mergeDefaults(out[key], value)
      : value;
  }
  return out as T;
}

function fresh(): Settings {
  return structuredClone(DEFAULT_SETTINGS);
}

class SettingsStore {
  current = $state<Settings>(fresh());
  ready = $state(false);

  #lastSerialized = '';
  #timer: ReturnType<typeof setTimeout> | undefined;

  async init() {
    try {
      const raw = (await browser.storage.local.get(KEY))[KEY];
      if (raw) this.current = mergeDefaults(fresh(), raw);
    } catch {
      // First run, or storage unavailable — defaults are already in place.
    }
    this.current.version = SETTINGS_VERSION;
    this.#lastSerialized = JSON.stringify(this.current);
    this.ready = true;

    this.#watchExternalChanges();
    this.#autosave();
  }

  #watchExternalChanges() {
    browser.storage.onChanged.addListener((changes, area) => {
      if (area !== 'local') return;
      const change = changes[KEY];
      if (!change) return;
      const incoming = JSON.stringify(change.newValue ?? null);
      if (incoming === this.#lastSerialized) return;
      this.#lastSerialized = incoming;
      this.current = mergeDefaults(fresh(), change.newValue);
    });
  }

  #autosave() {
    $effect.root(() => {
      $effect(() => {
        const json = JSON.stringify(this.current);
        if (json === this.#lastSerialized) return;
        this.#lastSerialized = json;
        clearTimeout(this.#timer);
        this.#timer = setTimeout(() => {
          browser.storage.local.set({ [KEY]: JSON.parse(json) });
        }, SAVE_DEBOUNCE_MS);
      });
    });
  }

  reset() {
    this.current = fresh();
  }

  toJSON() {
    return JSON.stringify(this.current, null, 2);
  }

  fromJSON(text: string) {
    const parsed = JSON.parse(text);
    if (!isPlainObject(parsed)) throw new Error('Not a Minima backup file.');
    this.current = mergeDefaults(fresh(), parsed);
  }
}

export const settings = new SettingsStore();
