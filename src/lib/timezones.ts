import type { TimeZoneEntry } from './types';

export function listTimeZones(): string[] {
  const supported = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] })
    .supportedValuesOf;
  if (typeof supported === 'function') return supported('timeZone');
  return ['UTC'];
}

export function localTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

export function isValidTimeZone(timeZone: string) {
  try {
    new Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch {
    return false;
  }
}

/** "America/New_York" → "New York"; "UTC" stays "UTC". */
export function labelFor(timeZone: string) {
  const tail = timeZone.split('/').pop() ?? timeZone;
  return tail.replace(/_/g, ' ');
}

export function makeZone(timeZone: string): TimeZoneEntry {
  return { id: crypto.randomUUID(), label: labelFor(timeZone), timeZone };
}

const timeCache = new Map<string, Intl.DateTimeFormat>();
const dayCache = new Map<string, Intl.DateTimeFormat>();

function timeFormatter(timeZone: string, hour12: boolean) {
  const key = `${timeZone}|${hour12}`;
  let formatter = timeCache.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(hour12 ? 'en-US' : 'en-GB', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12,
    });
    timeCache.set(key, formatter);
  }
  return formatter;
}

function dayFormatter(timeZone: string) {
  let formatter = dayCache.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-CA', { timeZone, dateStyle: 'short' });
    dayCache.set(timeZone, formatter);
  }
  return formatter;
}

export interface ZoneReading {
  id: string;
  label: string;
  time: string;
  /** -1 yesterday, 0 same day, 1 tomorrow, relative to the local date. */
  dayShift: number;
}

export function readZone(
  entry: TimeZoneEntry,
  now: Date,
  hour12: boolean,
): ZoneReading | null {
  if (!isValidTimeZone(entry.timeZone)) return null;
  const time = timeFormatter(entry.timeZone, hour12).format(now).toLowerCase();
  const there = dayFormatter(entry.timeZone).format(now);
  const here = dayFormatter(localTimeZone()).format(now);
  return {
    id: entry.id,
    label: entry.label || labelFor(entry.timeZone),
    time,
    dayShift: there === here ? 0 : there > here ? 1 : -1,
  };
}
