/** Accepts `#abc`, `abc`, `#aabbcc` or `aabbcc`; returns `#aabbcc` or null. */
export function normalizeHex(input: string): string | null {
  let value = input.trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(value)) {
    value = value
      .split('')
      .map((char) => char + char)
      .join('');
  }
  if (!/^[0-9a-f]{6}$/i.test(value)) return null;
  return `#${value.toLowerCase()}`;
}

function channels(hex: string) {
  const clean = normalizeHex(hex) ?? '#000000';
  return [
    parseInt(clean.slice(1, 3), 16),
    parseInt(clean.slice(3, 5), 16),
    parseInt(clean.slice(5, 7), 16),
  ] as const;
}

function toHex(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)))
    .toString(16)
    .padStart(2, '0');
}

/** WCAG relative luminance, 0 (black) to 1 (white). */
export function relativeLuminance(hex: string) {
  const [r, g, b] = channels(hex).map((channel) => {
    const srgb = channel / 255;
    return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function isLightColor(hex: string) {
  return relativeLuminance(hex) > 0.4;
}

/** Blends `weight` of `other` into `base`. */
export function mixHex(base: string, other: string, weight: number) {
  const a = channels(base);
  const b = channels(other);
  const t = Math.max(0, Math.min(1, weight));
  return `#${a.map((channel, index) => toHex(channel + (b[index] - channel) * t)).join('')}`;
}
