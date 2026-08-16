export type ThemeMode = 'auto' | 'light' | 'dark';
export type TileSize = 'sm' | 'md' | 'lg';
export type IconShape = 'squircle' | 'rounded' | 'circle' | 'square';
export type IconSource = 'local' | 'online';
export type ShortcutMode = 'custom' | 'bookmarks';
export type BookmarkLayout = 'folders' | 'flat';
export type ContentWidth = 'narrow' | 'regular' | 'wide' | 'full';
export type SectionColumns = 'auto' | 'one' | 'two';
export type PanelPlacement = 'inline' | 'left' | 'right';
export type BackgroundKind = 'paper' | 'color' | 'image';
export type BackgroundFit = 'cover' | 'contain' | 'tile';

export interface BackgroundSettings {
  kind: BackgroundKind;
  color: string;
  /** An http(s) address, or `@stored` for an uploaded file. */
  image: string;
  /** Percentage of the theme colour laid over the image for legibility. */
  dim: number;
  blur: number;
  fit: BackgroundFit;
}
export type PanelKey = 'todos' | 'notes';
export type ClockFace = 'sans' | 'mono';
export type DateFormat = 'long' | 'medium' | 'short' | 'iso';
export type TempUnit = 'celsius' | 'fahrenheit';
/** Per-shortcut icon override. `auto` falls back to the favicon pipeline. */
export interface IconOverride {
  type: 'auto' | 'url' | 'emoji' | 'text';
  value: string;
}

export interface Shortcut {
  id: string;
  title: string;
  url: string;
  icon: IconOverride;
}

export interface ShortcutGroup {
  id: string;
  title: string;
  shortcuts: Shortcut[];
}

export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
}

export interface TimeZoneEntry {
  id: string;
  label: string;
  timeZone: string;
}

export interface CurrencyEntry {
  id: string;
  /** ISO 4217 code, e.g. "USD". */
  code: string;
}

export interface WeatherLocation {
  name: string;
  latitude: number;
  longitude: number;
}

export interface Settings {
  version: number;
  greeting: {
    enabled: boolean;
    name: string;
  };
  clock: {
    enabled: boolean;
    seconds: boolean;
    hour12: boolean;
    face: ClockFace;
    scale: number;
    showZones: boolean;
    zones: TimeZoneEntry[];
  };
  date: {
    enabled: boolean;
    format: DateFormat;
  };
  currencies: {
    enabled: boolean;
    /** Home currency — rates show how much 1 unit of each tracked code is worth here. */
    base: string;
    quotes: CurrencyEntry[];
  };
  weather: {
    enabled: boolean;
    unit: TempUnit;
    showCondition: boolean;
    location: WeatherLocation | null;
  };
  search: {
    enabled: boolean;
    newTab: boolean;
    /** Offer matching shortcuts while typing. */
    quickSwitch: boolean;
  };
  todos: {
    enabled: boolean;
    placement: PanelPlacement;
    items: TodoItem[];
  };
  notes: {
    enabled: boolean;
    placement: PanelPlacement;
    text: string;
  };
  appearance: {
    theme: ThemeMode;
    accent: string;
    grayscale: number;
    colorOnHover: boolean;
    iconShape: IconShape;
    iconSource: IconSource;
    cards: boolean;
    grain: boolean;
    animations: boolean;
    background: BackgroundSettings;
  };
  layout: {
    width: ContentWidth;
    tileSize: TileSize;
    columns: SectionColumns;
    showLabels: boolean;
    showGroupTitles: boolean;
    showAddButtons: boolean;
    verticalAlign: 'top' | 'center';
    /** Scales date, weather, world clocks, greeting and rates under the clock. */
    detailScale: number;
  };
  shortcuts: {
    mode: ShortcutMode;
    groups: ShortcutGroup[];
  };
  /** Keys of groups the user has folded away, across both sources. */
  collapsed: string[];
  /** Optional background tint per group key, across both sources. */
  groupColors: Record<string, string>;
  bookmarks: {
    /** Bookmark node id to read from. `''` means the bookmarks bar. */
    rootId: string;
    layout: BookmarkLayout;
    /** In `folders` layout, pull links out of nested subfolders too. */
    deep: boolean;
    /** Show links that sit directly in the root, above the folders. */
    showLoose: boolean;
    looseTitle: string;
    maxPerGroup: number;
    hidden: string[];
    icons: Record<string, IconOverride>;
  };
}

export interface DialogRequest {
  heading: string;
  title: string;
  url: string;
  icon: IconOverride;
  sectionKey: string;
  lockSection?: boolean;
  onSubmit: (data: {
    title: string;
    url: string;
    icon: IconOverride;
    sectionKey: string;
  }) => void;
}

export interface ResolvedTile {
  /** Stable key: bookmark id or shortcut id. */
  key: string;
  title: string;
  url: string;
  icon: IconOverride;
}

export interface ResolvedSection {
  key: string;
  title: string;
  tiles: ResolvedTile[];
  /** Bookmark folder that new items are written into. `null` for custom sets. */
  parentId: string | null;
  /** Items can be added to, renamed within, or removed from this group. */
  editable: boolean;
  /** Items can be dragged into or reordered inside this group. */
  reorderable: boolean;
  /** A group Minima invents (loose bookmarks), so it cannot be renamed. */
  synthetic: boolean;
}
