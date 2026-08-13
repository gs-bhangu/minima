import type { DateFormat } from './types';

/**
 * A single shared ticker aligned to real second boundaries. It pauses while the
 * tab is hidden so a pinned new tab costs nothing in the background.
 */
class Clock {
  now = $state(new Date());
  #timer: ReturnType<typeof setTimeout> | undefined;
  #started = false;

  start() {
    if (this.#started) return;
    this.#started = true;
    this.#tick();
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clearTimeout(this.#timer);
      } else {
        this.#tick();
      }
    });
  }

  #tick = () => {
    clearTimeout(this.#timer);
    this.now = new Date();
    const drift = 1000 - (Date.now() % 1000);
    this.#timer = setTimeout(this.#tick, drift + 5);
  };
}

export const clock = new Clock();

export function formatTime(date: Date, hour12: boolean, seconds: boolean) {
  const h = hour12 ? date.getHours() % 12 || 12 : date.getHours();
  const parts = [
    hour12 ? String(h) : String(h).padStart(2, '0'),
    String(date.getMinutes()).padStart(2, '0'),
  ];
  if (seconds) parts.push(String(date.getSeconds()).padStart(2, '0'));
  return {
    text: parts.join(':'),
    suffix: hour12 ? (date.getHours() < 12 ? 'am' : 'pm') : '',
  };
}

const DATE_OPTIONS: Record<DateFormat, Intl.DateTimeFormatOptions | null> = {
  long: { weekday: 'long', day: 'numeric', month: 'long' },
  medium: { weekday: 'short', day: 'numeric', month: 'short' },
  short: { day: 'numeric', month: 'numeric', year: 'numeric' },
  iso: null,
};

export function formatDate(date: Date, format: DateFormat) {
  if (format === 'iso') {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }
  return new Intl.DateTimeFormat(undefined, DATE_OPTIONS[format]!).format(date);
}

export function greetingFor(date: Date) {
  const h = date.getHours();
  if (h < 5) return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 22) return 'Good evening';
  return 'Good night';
}
