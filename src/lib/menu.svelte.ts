import type { GlyphName } from './glyphs';

export interface MenuAction {
  kind?: 'action';
  label: string;
  glyph?: GlyphName;
  danger?: boolean;
  disabled?: boolean;
  /** Requires a second click before the action fires. */
  confirm?: boolean;
  action: () => void;
}

export interface MenuSeparator {
  kind: 'separator';
}

export interface MenuColors {
  kind: 'colors';
  value: string | null;
  onpick: (color: string | null) => void;
}

export type MenuEntry = MenuAction | MenuSeparator | MenuColors;

class MenuStore {
  open = $state(false);
  x = $state(0);
  y = $state(0);
  entries = $state<MenuEntry[]>([]);

  show(event: MouseEvent, entries: MenuEntry[]) {
    event.preventDefault();
    event.stopPropagation();
    if (!entries.length) return;
    this.x = event.clientX;
    this.y = event.clientY;
    this.entries = entries;
    this.open = true;
  }

  close() {
    this.open = false;
    this.entries = [];
  }
}

export const menu = new MenuStore();
