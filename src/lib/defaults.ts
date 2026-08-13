import type { Settings, Shortcut } from './types';

export const SETTINGS_VERSION = 1;

export const ACCENTS = [
  { id: 'graphite', value: '#8a8a8f' },
  { id: 'ink', value: '#3d5afe' },
  { id: 'moss', value: '#4f8a5b' },
  { id: 'clay', value: '#b4674a' },
  { id: 'plum', value: '#7b5ea7' },
  { id: 'amber', value: '#c08a2e' },
] as const;

export function makeShortcut(partial: Partial<Shortcut> = {}): Shortcut {
  return {
    id: crypto.randomUUID(),
    title: '',
    url: '',
    icon: { type: 'auto', value: '' },
    ...partial,
  };
}

export const DEFAULT_SETTINGS: Settings = {
  version: SETTINGS_VERSION,
  greeting: { enabled: true, name: '' },
  clock: {
    enabled: true,
    seconds: false,
    hour12: false,
    face: 'sans',
    scale: 1,
    showZones: false,
    zones: [],
  },
  date: { enabled: true, format: 'long' },
  currencies: {
    enabled: false,
    base: 'INR',
    quotes: [],
  },
  weather: {
    enabled: true,
    unit: 'celsius',
    showCondition: true,
    location: null,
  },
  search: {
    enabled: true,
    engine: 'google',
    customUrl: '',
    newTab: false,
    quickSwitch: true,
  },
  todos: { enabled: false, placement: 'inline', items: [] },
  notes: { enabled: false, placement: 'inline', text: '' },
  appearance: {
    theme: 'auto',
    accent: '#8a8a8f',
    grayscale: 100,
    colorOnHover: true,
    iconShape: 'squircle',
    iconSource: 'local',
    cards: true,
    grain: false,
    animations: true,
    background: {
      kind: 'paper',
      color: '#f2f1ee',
      image: '',
      dim: 30,
      blur: 0,
      fit: 'cover',
    },
  },
  layout: {
    width: 'regular',
    tileSize: 'md',
    columns: 'auto',
    showLabels: true,
    showGroupTitles: true,
    showAddButtons: true,
    verticalAlign: 'center',
    detailScale: 1,
  },
  shortcuts: {
    mode: 'bookmarks',
    groups: [
      {
        id: 'default',
        title: 'Shortcuts',
        shortcuts: [
          makeShortcut({ title: 'Gmail', url: 'https://mail.google.com' }),
          makeShortcut({ title: 'GitHub', url: 'https://github.com' }),
          makeShortcut({ title: 'YouTube', url: 'https://youtube.com' }),
          makeShortcut({ title: 'Notion', url: 'https://notion.so' }),
        ],
      },
    ],
  },
  bookmarks: {
    rootId: '',
    layout: 'folders',
    deep: false,
    showLoose: true,
    looseTitle: 'Pinned',
    maxPerGroup: 24,
    hidden: [],
    icons: {},
  },
  collapsed: [],
  groupColors: {},
};

/** Background presets — Minima flips its text colours to suit whichever you pick. */
export const BACKGROUND_PRESETS = [
  { id: 'paper', value: '#f2f1ee' },
  { id: 'sand', value: '#ede7dc' },
  { id: 'mist', value: '#e9edf1' },
  { id: 'sage', value: '#e6ece6' },
  { id: 'blush', value: '#f1e8e8' },
  { id: 'lilac', value: '#ece9f2' },
  { id: 'slate', value: '#3a4048' },
  { id: 'forest', value: '#18241d' },
  { id: 'navy', value: '#111722' },
  { id: 'plum', value: '#1b1420' },
  { id: 'coal', value: '#141414' },
  { id: 'ink', value: '#08080a' },
] as const;

/** Muted tints that stay quiet in both themes. */
export const GROUP_TINTS = [
  '#8a8a8f',
  '#5b7fa8',
  '#5f8f6b',
  '#b08048',
  '#a8635c',
  '#7f6aa3',
  '#4f8a8a',
  '#9a8f5a',
] as const;
