import type { SearchEngineId, Settings } from './types';
import { looksLikeUrl, normalizeUrl } from './icons';

export interface SearchEngine {
  id: SearchEngineId;
  label: string;
  template: string;
  kind: 'web' | 'ai';
}

/**
 * The AI entries open a fresh chat with the query already sent. Those query
 * parameters are undocumented but stable, and are what browsers' own custom
 * search-engine entries use.
 */
export const SEARCH_ENGINES: SearchEngine[] = [
  { id: 'google', label: 'Google', template: 'https://www.google.com/search?q={q}', kind: 'web' },
  {
    id: 'google-web',
    label: 'Google Web only',
    // udm=14 drops AI overviews, carousels and rich snippets.
    template: 'https://www.google.com/search?q={q}&udm=14',
    kind: 'web',
  },
  { id: 'duckduckgo', label: 'DuckDuckGo', template: 'https://duckduckgo.com/?q={q}', kind: 'web' },
  { id: 'bing', label: 'Bing', template: 'https://www.bing.com/search?q={q}', kind: 'web' },
  { id: 'brave', label: 'Brave', template: 'https://search.brave.com/search?q={q}', kind: 'web' },
  { id: 'ecosia', label: 'Ecosia', template: 'https://www.ecosia.org/search?q={q}', kind: 'web' },
  {
    id: 'startpage',
    label: 'Startpage',
    template: 'https://www.startpage.com/sp/search?query={q}',
    kind: 'web',
  },
  {
    id: 'google-ai',
    label: 'Google AI Mode',
    // udm=50 opens Google's AI answer interface directly.
    template: 'https://www.google.com/search?q={q}&udm=50',
    kind: 'ai',
  },
  {
    id: 'chatgpt',
    label: 'ChatGPT',
    template: 'https://chatgpt.com/?q={q}&hints=search',
    kind: 'ai',
  },
  { id: 'claude', label: 'Claude', template: 'https://claude.ai/new?q={q}', kind: 'ai' },
  {
    id: 'perplexity',
    label: 'Perplexity',
    template: 'https://www.perplexity.ai/search?q={q}',
    kind: 'ai',
  },
  { id: 'grok', label: 'Grok', template: 'https://grok.com/?q={q}', kind: 'ai' },
];

const CUSTOM: SearchEngine = {
  id: 'custom',
  label: 'Custom',
  template: '',
  kind: 'web',
};

export function engineById(id: SearchEngineId, config: Settings['search']): SearchEngine {
  if (id === 'custom') {
    return { ...CUSTOM, template: config.customUrl || SEARCH_ENGINES[0].template };
  }
  return SEARCH_ENGINES.find((engine) => engine.id === id) ?? SEARCH_ENGINES[0];
}

export function buildUrl(query: string, engine: SearchEngine) {
  const value = query.trim();
  if (!value) return '';
  const encoded = encodeURIComponent(value);
  return engine.template.includes('{q}')
    ? engine.template.replaceAll('{q}', encoded)
    : `${engine.template}${encoded}`;
}

/** Addresses go straight through; everything else goes to the chosen engine. */
export function resolveQuery(query: string, engine: SearchEngine) {
  const value = query.trim();
  if (!value) return '';
  if (looksLikeUrl(value)) return normalizeUrl(value);
  return buildUrl(value, engine);
}
