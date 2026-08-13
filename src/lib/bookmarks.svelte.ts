import type { ResolvedSection, ResolvedTile, Settings } from './types';

export interface BookmarkNode {
  id: string;
  title: string;
  url?: string;
  children?: BookmarkNode[];
}

export const ROOT_ALL = '__all__';
export const ROOT_BAR = '';

export interface FolderOption {
  id: string;
  title: string;
  depth: number;
}

async function getTreeRoot(): Promise<BookmarkNode> {
  const tree = (await browser.bookmarks.getTree()) as unknown as BookmarkNode[];
  return tree[0];
}

function findNode(node: BookmarkNode, id: string): BookmarkNode | null {
  if (node.id === id) return node;
  for (const child of node.children ?? []) {
    const hit = findNode(child, id);
    if (hit) return hit;
  }
  return null;
}

async function resolveRoot(rootId: string): Promise<BookmarkNode | null> {
  const root = await getTreeRoot();
  if (rootId === ROOT_ALL) return root;
  if (rootId) {
    const found = findNode(root, rootId);
    if (found) return found;
  }
  // Default to the bookmarks bar, which browsers expose as the first child.
  return root.children?.[0] ?? root;
}

function collectLinks(node: BookmarkNode, deep: boolean, out: BookmarkNode[] = []) {
  for (const child of node.children ?? []) {
    if (child.url) out.push(child);
    else if (deep) collectLinks(child, true, out);
  }
  return out;
}

function toTile(node: BookmarkNode, config: Settings['bookmarks']): ResolvedTile {
  return {
    key: node.id,
    title: node.title || hostname(node.url!),
    url: node.url!,
    icon: config.icons[node.id] ?? { type: 'auto', value: '' },
  };
}

export function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export async function listFolders(): Promise<FolderOption[]> {
  const root = await getTreeRoot();
  const out: FolderOption[] = [];
  const walk = (node: BookmarkNode, depth: number) => {
    for (const child of node.children ?? []) {
      if (child.url) continue;
      // The bookmarks bar is the implicit default, so it keeps the sentinel id.
      const isBar = depth === 0 && out.length === 0;
      out.push({
        id: isBar ? ROOT_BAR : child.id,
        title: child.title || 'Untitled',
        depth,
      });
      walk(child, depth + 1);
    }
  };
  walk(root, 0);
  return out;
}

export interface SectionResult {
  rootId: string;
  sections: ResolvedSection[];
}

export async function buildSections(
  config: Settings['bookmarks'],
): Promise<SectionResult> {
  const root = await resolveRoot(config.rootId);
  if (!root) return { rootId: '', sections: [] };

  const hidden = new Set(config.hidden);
  const limit = config.maxPerGroup > 0 ? config.maxPerGroup : Infinity;
  const visible = (nodes: BookmarkNode[]) =>
    nodes.filter((n) => !hidden.has(n.id)).slice(0, limit).map((n) => toTile(n, config));

  // Reordering maps a visible position back to a real bookmark position, which
  // only holds while each group mirrors exactly one folder.
  const reorderable = config.layout === 'folders' && !config.deep;

  if (config.layout === 'flat') {
    const tiles = visible(collectLinks(root, true));
    return {
      rootId: root.id,
      sections: tiles.length
        ? [
            {
              key: 'flat',
              title: root.title || 'Bookmarks',
              tiles,
              parentId: root.id,
              editable: true,
              reorderable: false,
              synthetic: true,
            },
          ]
        : [],
    };
  }

  const sections: ResolvedSection[] = [];

  if (config.showLoose) {
    const loose = visible((root.children ?? []).filter((n) => n.url));
    if (loose.length) {
      sections.push({
        key: '__loose__',
        title: config.looseTitle || 'Pinned',
        tiles: loose,
        parentId: root.id,
        editable: true,
        reorderable,
        synthetic: true,
      });
    }
  }

  for (const folder of root.children ?? []) {
    if (folder.url || hidden.has(folder.id)) continue;
    const tiles = visible(collectLinks(folder, config.deep));
    sections.push({
      key: folder.id,
      title: folder.title || 'Untitled',
      tiles,
      parentId: folder.id,
      editable: true,
      reorderable,
      synthetic: false,
    });
  }

  return { rootId: root.id, sections };
}

export interface ManageEntry {
  id: string;
  title: string;
  url: string;
}

export interface ManageGroup {
  id: string;
  title: string;
  isFolder: boolean;
  entries: ManageEntry[];
}

/** Every candidate item, hidden ones included, for the settings manager. */
export async function buildManageList(
  config: Settings['bookmarks'],
): Promise<ManageGroup[]> {
  const root = await resolveRoot(config.rootId);
  if (!root) return [];

  const entry = (n: BookmarkNode): ManageEntry => ({
    id: n.id,
    title: n.title || hostname(n.url!),
    url: n.url!,
  });

  if (config.layout === 'flat') {
    return [
      {
        id: 'flat',
        title: root.title || 'Bookmarks',
        isFolder: false,
        entries: collectLinks(root, true).map(entry),
      },
    ];
  }

  const groups: ManageGroup[] = [];
  const loose = (root.children ?? []).filter((n) => n.url);
  if (loose.length) {
    groups.push({
      id: '__loose__',
      title: config.looseTitle || 'Pinned',
      isFolder: false,
      entries: loose.map(entry),
    });
  }
  for (const folder of root.children ?? []) {
    if (folder.url) continue;
    groups.push({
      id: folder.id,
      title: folder.title || 'Untitled',
      isFolder: true,
      entries: collectLinks(folder, config.deep).map(entry),
    });
  }
  return groups;
}

class BookmarksStore {
  sections = $state<ResolvedSection[]>([]);
  rootId = $state('');
  ready = $state(false);
  denied = $state(false);

  #config: Settings['bookmarks'] | null = null;
  #timer: ReturnType<typeof setTimeout> | undefined;
  #listening = false;

  async sync(config: Settings['bookmarks']) {
    this.#config = config;
    this.#listen();
    try {
      const result = await buildSections(config);
      this.sections = result.sections;
      this.rootId = result.rootId;
      this.denied = false;
    } catch {
      this.sections = [];
      this.denied = true;
    } finally {
      this.ready = true;
    }
  }

  refresh() {
    if (this.#config) this.sync(this.#config);
  }

  #listen() {
    if (this.#listening || !browser.bookmarks?.onChanged) return;
    this.#listening = true;
    const refresh = () => {
      clearTimeout(this.#timer);
      this.#timer = setTimeout(() => this.refresh(), 120);
    };
    browser.bookmarks.onCreated.addListener(refresh);
    browser.bookmarks.onRemoved.addListener(refresh);
    browser.bookmarks.onChanged.addListener(refresh);
    browser.bookmarks.onMoved.addListener(refresh);
  }
}

export const bookmarks = new BookmarksStore();
