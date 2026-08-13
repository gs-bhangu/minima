<script lang="ts">
  import Glyph from '../Glyph.svelte';
  import TileIcon from '../TileIcon.svelte';
  import IconField from '../controls/IconField.svelte';
  import Row from '../controls/Row.svelte';
  import Segmented from '../controls/Segmented.svelte';
  import Select from '../controls/Select.svelte';
  import Slider from '../controls/Slider.svelte';
  import TextInput from '../controls/TextInput.svelte';
  import Toggle from '../controls/Toggle.svelte';
  import {
    ROOT_ALL,
    ROOT_BAR,
    buildManageList,
    listFolders,
    type ManageGroup,
  } from '../../lib/bookmarks.svelte';
  import { settings } from '../../lib/settings.svelte';
  import { unhide, unhideAll } from '../../lib/mutations';
  import type { BookmarkLayout, IconOverride } from '../../lib/types';

  const LOOSE = '__loose__';

  const config = $derived(settings.current.bookmarks);
  const iconSource = $derived(settings.current.appearance.iconSource);

  let folders = $state<{ value: string; label: string }[]>([]);
  let items = $state<ManageGroup[]>([]);
  let openIcon = $state<string | null>(null);
  let showItems = $state(false);

  $effect(() => {
    const base = [{ value: ROOT_ALL, label: 'All bookmarks' }];
    listFolders()
      .then((list) => {
        folders = [
          ...base,
          ...list.map((f) => ({
            value: f.id,
            label: `${'\u00a0\u00a0'.repeat(f.depth)}${f.title}`,
          })),
        ];
      })
      .catch(() => (folders = base));
  });

  // Track only the structural options so editing icons doesn't reload the list.
  $effect(() => {
    const shape = {
      rootId: config.rootId,
      layout: config.layout,
      deep: config.deep,
      looseTitle: config.looseTitle,
      showLoose: config.showLoose,
      maxPerGroup: 0,
      hidden: [],
      icons: {},
    };
    buildManageList(shape)
      .then((list) => (items = list))
      .catch(() => (items = []));
  });

  function isHidden(id: string) {
    return config.hidden.includes(id);
  }

  function toggleHidden(id: string) {
    const index = config.hidden.indexOf(id);
    if (index === -1) config.hidden.push(id);
    else config.hidden.splice(index, 1);
  }

  function iconFor(id: string): IconOverride {
    return config.icons[id] ?? { type: 'auto', value: '' };
  }

  function setIcon(id: string, icon: IconOverride) {
    if (icon.type === 'auto' || !icon.value.trim()) delete config.icons[id];
    else config.icons[id] = icon;
  }

  const layoutOptions: { value: BookmarkLayout; label: string }[] = [
    { value: 'folders', label: 'By folder' },
    { value: 'flat', label: 'Single grid' },
  ];

  const totalItems = $derived(items.reduce((sum, g) => sum + g.entries.length, 0));

  /** Everything currently hidden, named where the bookmark still exists. */
  const hiddenEntries = $derived.by(() => {
    const names = new Map<string, { title: string; isFolder: boolean }>();
    for (const group of items) {
      if (group.isFolder) names.set(group.id, { title: group.title, isFolder: true });
      for (const entry of group.entries) {
        names.set(entry.id, { title: entry.title, isFolder: false });
      }
    }

    const rows = config.hidden.map((id) => ({
      id,
      title: names.get(id)?.title ?? 'Deleted bookmark',
      isFolder: names.get(id)?.isFolder ?? false,
    }));

    if (!config.showLoose && config.layout === 'folders') {
      rows.unshift({
        id: LOOSE,
        title: config.looseTitle || 'Pinned',
        isFolder: true,
      });
    }
    return rows;
  });

  function restore(id: string) {
    if (id === LOOSE) {
      config.showLoose = true;
      return;
    }
    unhide(id);
  }
</script>

<Row label="Source folder" hint="Where Minima reads your bookmarks from." stacked>
  <Select bind:value={config.rootId} options={folders} label="Source folder" />
</Row>

<Row label="Arrangement">
  <Segmented bind:value={config.layout} options={layoutOptions} label="Arrangement" />
</Row>

{#if config.layout === 'folders'}
  <Row label="Include nested folders" hint="Flatten subfolders into their parent group.">
    <Toggle bind:checked={config.deep} label="Include nested folders" />
  </Row>

  <Row label="Loose bookmarks" hint="Links sitting outside any folder.">
    <Toggle bind:checked={config.showLoose} label="Show loose bookmarks" />
  </Row>

  {#if config.showLoose}
    <Row label="Loose group name" stacked>
      <TextInput
        bind:value={config.looseTitle}
        label="Loose group name"
        placeholder="Pinned"
      />
    </Row>
  {/if}
{/if}

<Row label="Items per group" stacked>
  <Slider
    bind:value={config.maxPerGroup}
    min={0}
    max={60}
    step={2}
    label="Items per group"
    display={config.maxPerGroup === 0 ? 'All' : String(config.maxPerGroup)}
  />
</Row>

{#if hiddenEntries.length}
  <Row label="Hidden" hint="Nothing here is shown on the new tab." stacked>
    <div class="hidden-list">
      {#each hiddenEntries as entry (entry.id)}
        <div class="hidden-row">
          <Glyph name={entry.isFolder ? 'folder' : 'link'} size={13} />
          <span class="hidden-name">{entry.title}</span>
          <button class="text-button" type="button" onclick={() => restore(entry.id)}>
            Show
          </button>
        </div>
      {/each}
      <button class="ghost-button" type="button" onclick={unhideAll}>Show everything</button>
    </div>
  </Row>
{/if}

<div class="manage">
  <button class="manage-head" type="button" onclick={() => (showItems = !showItems)}>
    <span>Customise items</span>
    <span class="meta">{totalItems}</span>
    <span class="chevron" class:open={showItems}><Glyph name="chevron" size={14} /></span>
  </button>

  {#if showItems}
    <div class="list">
      {#each items as group (group.id)}
        <div class="folder">
          <div class="folder-head">
            <Glyph name="folder" size={13} />
            <span class="folder-name">{group.title}</span>
            {#if group.isFolder}
              <button
                class="eye"
                type="button"
                aria-label={isHidden(group.id) ? 'Show folder' : 'Hide folder'}
                title={isHidden(group.id) ? 'Show folder' : 'Hide folder'}
                class:off={isHidden(group.id)}
                onclick={() => toggleHidden(group.id)}
              >
                <Glyph name={isHidden(group.id) ? 'eye-off' : 'eye'} size={14} />
              </button>
            {/if}
          </div>

          {#if !isHidden(group.id)}
            <ul>
              {#each group.entries as entry (entry.id)}
                <li class="entry" class:muted={isHidden(entry.id)}>
                  <button
                    class="preview"
                    type="button"
                    title="Change icon"
                    aria-label="Change icon for {entry.title}"
                    onclick={() => (openIcon = openIcon === entry.id ? null : entry.id)}
                  >
                    <TileIcon
                      title={entry.title}
                      url={entry.url}
                      icon={iconFor(entry.id)}
                      source={iconSource}
                    />
                  </button>
                  <span class="entry-name">{entry.title}</span>
                  <button
                    class="eye"
                    type="button"
                    aria-label={isHidden(entry.id) ? 'Show item' : 'Hide item'}
                    title={isHidden(entry.id) ? 'Show item' : 'Hide item'}
                    class:off={isHidden(entry.id)}
                    onclick={() => toggleHidden(entry.id)}
                  >
                    <Glyph name={isHidden(entry.id) ? 'eye-off' : 'eye'} size={14} />
                  </button>
                </li>
                {#if openIcon === entry.id}
                  <li class="icon-row">
                    <IconField
                      icon={iconFor(entry.id)}
                      onupdate={(next) => setIcon(entry.id, next)}
                    />
                  </li>
                {/if}
              {/each}
              {#if !group.entries.length}
                <li class="empty">Empty</li>
              {/if}
            </ul>
          {/if}
        </div>
      {/each}

      {#if !items.length}
        <p class="empty">No bookmarks found in this folder.</p>
      {/if}
    </div>
  {/if}
</div>

<style>
  .hidden-list {
    display: flex;
    flex-direction: column;
    gap: 3px;
    width: 100%;
  }

  .hidden-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 2px;
    border-radius: var(--r-sm);
    color: var(--text-faint);
  }

  .hidden-row:hover {
    background: var(--surface);
  }

  .hidden-name {
    flex: 1;
    min-width: 0;
    font-size: 12px;
    color: var(--text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .hidden-list .ghost-button {
    margin-top: 5px;
  }

  .manage {
    margin-top: 6px;
  }

  .manage-head {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 0;
    font-size: 13px;
    color: var(--text);
  }

  .meta {
    flex: 1;
    text-align: right;
    font-size: 11px;
    font-variant-numeric: tabular-nums;
    color: var(--text-faint);
  }

  .chevron {
    display: flex;
    color: var(--text-faint);
    transform: rotate(-90deg);
    transition: transform var(--dur) var(--ease);
  }

  .chevron.open {
    transform: none;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 4px 0 2px;
  }

  .folder {
    border: 1px solid var(--line);
    border-radius: var(--r-md);
    padding: 7px 8px;
  }

  .folder-head {
    display: flex;
    align-items: center;
    gap: 7px;
    padding-bottom: 4px;
    color: var(--text-muted);
  }

  .folder-name {
    flex: 1;
    min-width: 0;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .entry {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 3px 2px;
    border-radius: var(--r-sm);
    transition: background var(--dur) var(--ease), opacity var(--dur) var(--ease);
  }

  .entry:hover {
    background: var(--surface);
  }

  .entry.muted {
    opacity: 0.42;
  }

  .preview {
    --tile-icon: 24px;
    display: flex;
    flex: none;
    filter: grayscale(var(--grayscale));
  }

  .entry-name {
    flex: 1;
    min-width: 0;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .eye {
    display: flex;
    flex: none;
    padding: 3px;
    border-radius: 4px;
    color: var(--text-faint);
    opacity: 0;
    transition: opacity var(--dur) var(--ease), color var(--dur) var(--ease);
  }

  .entry:hover .eye,
  .folder-head:hover .eye,
  .eye.off,
  .eye:focus-visible {
    opacity: 1;
  }

  .eye:hover {
    color: var(--text);
  }

  .icon-row {
    padding: 4px 0;
  }

  .empty {
    padding: 6px 2px;
    font-size: 11.5px;
    color: var(--text-faint);
  }
</style>
