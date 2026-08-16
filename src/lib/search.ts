import { looksLikeUrl, normalizeUrl } from './icons';

export type ResolvedQuery =
  | { kind: 'url'; url: string }
  | { kind: 'search'; text: string };

/**
 * Addresses open directly. Everything else is handed to Chrome's Search API
 * so the query uses the browser's default search engine.
 */
export function resolveQuery(query: string): ResolvedQuery | null {
  const value = query.trim();
  if (!value) return null;
  if (looksLikeUrl(value)) return { kind: 'url', url: normalizeUrl(value) };
  return { kind: 'search', text: value };
}
