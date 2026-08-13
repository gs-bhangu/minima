import { bookmarks } from './bookmarks.svelte';
import { makeShortcut } from './defaults';
import { hostOf, normalizeUrl } from './icons';
import { settings } from './settings.svelte';
import { toast } from './toast.svelte';
import type { IconOverride, ResolvedSection, ResolvedTile } from './types';

function isCustom() {
  return settings.current.shortcuts.mode === 'custom';
}

function customGroups() {
  return settings.current.shortcuts.groups;
}

function findGroup(key: string) {
  return customGroups().find((group) => group.id === key);
}

function locate(tileKey: string) {
  for (const group of customGroups()) {
    const index = group.shortcuts.findIndex((s) => s.id === tileKey);
    if (index !== -1) return { group, index };
  }
  return null;
}

/**
 * Rewrites a folder to match `desired`. Every move is leftward, which keeps the
 * result identical regardless of how the browser interprets the target index.
 */
async function applyOrder(parentId: string, desired: string[]) {
  const children = await browser.bookmarks.getChildren(parentId);
  const current = children.map((child) => child.id);
  for (let i = 0; i < desired.length; i++) {
    if (current[i] === desired[i]) continue;
    const from = current.indexOf(desired[i]);
    if (from === -1) continue;
    current.splice(from, 1);
    current.splice(i, 0, desired[i]);
    await browser.bookmarks.move(desired[i], { parentId, index: i });
  }
}

/** Bookmark id that the dragged item should land in front of, or null for last. */
function anchorKey(section: ResolvedSection, index: number, movingKey?: string) {
  const tiles = section.tiles;
  let target = tiles[index];
  if (target && movingKey && target.key === movingKey) target = tiles[index + 1];
  return target?.key ?? null;
}

export async function createShortcut(
  section: ResolvedSection | null,
  data: { title: string; url: string; icon?: IconOverride },
) {
  const url = normalizeUrl(data.url);
  if (!url) return;
  const title = data.title.trim() || hostOf(url);

  if (isCustom()) {
    const groups = customGroups();
    let group = section ? findGroup(section.key) : groups[0];
    if (!group) {
      group = { id: crypto.randomUUID(), title: 'Shortcuts', shortcuts: [] };
      groups.push(group);
    }
    group.shortcuts.push(makeShortcut({ title, url, icon: data.icon }));
    return;
  }

  const parentId = section?.parentId ?? bookmarks.rootId;
  if (!parentId) return;
  const created = await browser.bookmarks.create({ parentId, title, url });
  if (data.icon && data.icon.type !== 'auto' && data.icon.value.trim()) {
    settings.current.bookmarks.icons[created.id] = data.icon;
  }
  bookmarks.refresh();
}

export async function updateShortcut(
  tile: ResolvedTile,
  data: { title: string; url: string; icon: IconOverride },
) {
  const url = normalizeUrl(data.url);
  if (!url) return;
  const title = data.title.trim() || hostOf(url);

  if (isCustom()) {
    const found = locate(tile.key);
    if (!found) return;
    const shortcut = found.group.shortcuts[found.index];
    shortcut.title = title;
    shortcut.url = url;
    shortcut.icon = data.icon;
    return;
  }

  setBookmarkIcon(tile.key, data.icon);
  await browser.bookmarks.update(tile.key, { title, url });
  bookmarks.refresh();
}

export function setBookmarkIcon(key: string, icon: IconOverride) {
  const icons = settings.current.bookmarks.icons;
  if (icon.type === 'auto' || !icon.value.trim()) delete icons[key];
  else icons[key] = icon;
}

export function setIcon(tile: ResolvedTile, icon: IconOverride) {
  if (isCustom()) {
    const found = locate(tile.key);
    if (found) found.group.shortcuts[found.index].icon = icon;
    return;
  }
  setBookmarkIcon(tile.key, icon);
  bookmarks.refresh();
}

export function hideTile(tile: ResolvedTile) {
  if (isCustom()) return;
  const hidden = settings.current.bookmarks.hidden;
  if (!hidden.includes(tile.key)) hidden.push(tile.key);
  bookmarks.refresh();
  toast.show(`${tile.title} hidden`, 'Undo', () => unhide(tile.key));
}

export function unhide(key: string) {
  const hidden = settings.current.bookmarks.hidden;
  const index = hidden.indexOf(key);
  if (index !== -1) hidden.splice(index, 1);
  bookmarks.refresh();
}

/** Brings back every hidden folder and bookmark, including loose links. */
export function unhideAll() {
  settings.current.bookmarks.hidden = [];
  settings.current.bookmarks.showLoose = true;
  bookmarks.refresh();
}

export function hiddenCount() {
  const config = settings.current.bookmarks;
  return config.hidden.length + (config.showLoose ? 0 : 1);
}

export async function deleteTile(tile: ResolvedTile) {
  if (isCustom()) {
    const found = locate(tile.key);
    if (found) found.group.shortcuts.splice(found.index, 1);
    return;
  }
  await browser.bookmarks.remove(tile.key);
  bookmarks.refresh();
}

export async function createGroup(title: string) {
  const name = title.trim() || 'New group';
  if (isCustom()) {
    const group = { id: crypto.randomUUID(), title: name, shortcuts: [] };
    customGroups().push(group);
    return group.id;
  }
  if (!bookmarks.rootId) return null;
  const created = await browser.bookmarks.create({
    parentId: bookmarks.rootId,
    title: name,
  });
  bookmarks.refresh();
  return created.id;
}

export async function renameGroup(section: ResolvedSection, title: string) {
  const name = title.trim();
  if (!name) return;
  if (isCustom()) {
    const group = findGroup(section.key);
    if (group) group.title = name;
    return;
  }
  if (section.synthetic) {
    settings.current.bookmarks.looseTitle = name;
    bookmarks.refresh();
    return;
  }
  await browser.bookmarks.update(section.key, { title: name });
  bookmarks.refresh();
}

export function hideGroup(section: ResolvedSection) {
  if (section.synthetic) {
    settings.current.bookmarks.showLoose = false;
    toast.show(`${section.title} hidden`, 'Undo', () => {
      settings.current.bookmarks.showLoose = true;
    });
    return;
  }
  if (isCustom()) return;
  const hidden = settings.current.bookmarks.hidden;
  if (!hidden.includes(section.key)) hidden.push(section.key);
  bookmarks.refresh();
  toast.show(`${section.title} hidden`, 'Undo', () => unhide(section.key));
}

export async function deleteGroup(section: ResolvedSection) {
  if (isCustom()) {
    const groups = customGroups();
    const index = groups.findIndex((group) => group.id === section.key);
    if (index !== -1) groups.splice(index, 1);
    return;
  }
  if (section.synthetic) {
    hideGroup(section);
    return;
  }
  await browser.bookmarks.removeTree(section.key);
  bookmarks.refresh();
}

export async function moveTile(
  tile: ResolvedTile,
  from: ResolvedSection,
  to: ResolvedSection,
  index: number,
) {
  if (!to.reorderable) return;

  if (isCustom()) {
    const source = findGroup(from.key);
    const target = findGroup(to.key);
    if (!source || !target) return;
    const before = anchorKey(to, index, tile.key);
    const cursor = source.shortcuts.findIndex((s) => s.id === tile.key);
    if (cursor === -1) return;
    const [moved] = source.shortcuts.splice(cursor, 1);
    const at = before
      ? target.shortcuts.findIndex((s) => s.id === before)
      : target.shortcuts.length;
    target.shortcuts.splice(at === -1 ? target.shortcuts.length : at, 0, moved);
    return;
  }

  const parentId = to.parentId;
  if (!parentId) return;
  const before = anchorKey(to, index, tile.key);

  if (from.parentId !== parentId) {
    const children = await browser.bookmarks.getChildren(parentId);
    const at = before ? children.findIndex((c) => c.id === before) : children.length;
    await browser.bookmarks.move(tile.key, {
      parentId,
      index: at === -1 ? children.length : at,
    });
    bookmarks.refresh();
    return;
  }

  const children = await browser.bookmarks.getChildren(parentId);
  const desired = children.map((c) => c.id).filter((id) => id !== tile.key);
  const at = before ? desired.indexOf(before) : desired.length;
  desired.splice(at === -1 ? desired.length : at, 0, tile.key);
  await applyOrder(parentId, desired);
  bookmarks.refresh();
}

/** `index` is an insertion point in the currently rendered `sections` array. */
export async function moveGroup(
  sections: ResolvedSection[],
  fromKey: string,
  index: number,
) {
  // Synthetic groups aren't real folders, so they can't take part in ordering.
  const keys = sections.filter((section) => !section.synthetic).map((s) => s.key);
  const cursor = keys.indexOf(fromKey);
  if (cursor === -1) return;

  const syntheticBefore = sections.slice(0, index).filter((s) => s.synthetic).length;
  let target = index - syntheticBefore;
  if (target > cursor) target -= 1;
  target = Math.max(0, Math.min(target, keys.length - 1));
  if (target === cursor) return;

  const reordered = keys.slice();
  reordered.splice(cursor, 1);
  reordered.splice(target, 0, fromKey);

  if (isCustom()) {
    const groups = customGroups();
    const moved = groups.splice(
      groups.findIndex((group) => group.id === fromKey),
      1,
    )[0];
    groups.splice(target, 0, moved);
    return;
  }

  const rootId = bookmarks.rootId;
  if (!rootId) return;
  const owned = new Set(keys);
  const children = await browser.bookmarks.getChildren(rootId);
  let take = 0;
  const desired = children.map((child) =>
    owned.has(child.id) ? reordered[take++] : child.id,
  );
  await applyOrder(rootId, desired);
  bookmarks.refresh();
}

/** Opens a whole group in background tabs, bypassing the popup blocker. */
export async function openAll(section: ResolvedSection) {
  for (const tile of section.tiles) {
    await browser.tabs.create({ url: tile.url, active: false });
  }
}

export async function copyAddress(url: string) {
  try {
    await navigator.clipboard.writeText(url);
  } catch {
    // Clipboard access can be refused when the page isn't focused.
  }
}

export function setGroupColor(key: string, color: string | null) {
  const colors = settings.current.groupColors;
  if (color) colors[key] = color;
  else delete colors[key];
}
