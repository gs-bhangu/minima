import { bookmarks } from './bookmarks.svelte';
import { hostOf, normalizeUrl } from './icons';
import { settings } from './settings.svelte';
import type { ResolvedSection } from './types';

class SectionsStore {
  readonly all = $derived.by<ResolvedSection[]>(() => {
    const config = settings.current;
    if (config.shortcuts.mode !== 'custom') return bookmarks.sections;

    return config.shortcuts.groups.map((group) => ({
      key: group.id,
      title: group.title || 'Shortcuts',
      parentId: null,
      editable: true,
      reorderable: true,
      synthetic: false,
      tiles: group.shortcuts
        .filter((shortcut) => shortcut.url.trim())
        .map((shortcut) => ({
          key: shortcut.id,
          title: shortcut.title || hostOf(shortcut.url),
          url: normalizeUrl(shortcut.url),
          icon: shortcut.icon,
        })),
    }));
  });

  find(key: string) {
    return this.all.find((section) => section.key === key) ?? null;
  }
}

export const sections = new SectionsStore();
