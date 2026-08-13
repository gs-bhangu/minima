/** Chrome's built-in favicon cache — local, no network request. */
export function localFaviconUrl(pageUrl: string, size = 64) {
  const url = new URL(`${location.origin}/_favicon/`);
  url.searchParams.set('pageUrl', pageUrl);
  url.searchParams.set('size', String(size));
  return url.toString();
}

export function remoteFaviconUrl(pageUrl: string, size = 64) {
  return `https://www.google.com/s2/favicons?sz=${size}&domain_url=${encodeURIComponent(pageUrl)}`;
}

export function monogramOf(title: string, url: string) {
  const source = title.trim() || hostOf(url);
  const letter = source.replace(/^(https?:\/\/)?(www\.)?/i, '').trim().charAt(0);
  return (letter || '?').toUpperCase();
}

export function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** Stable hue per domain so monogram tiles stay recognisable between reloads. */
export function hueOf(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 360;
}

export function normalizeUrl(input: string) {
  const value = input.trim();
  if (!value) return '';
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return value;
  return `https://${value}`;
}

export function looksLikeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed || /\s/.test(trimmed)) return false;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) return true;
  return /^[^\s.]+\.[^\s.]{2,}(\/|$|\?|#)/.test(trimmed);
}
