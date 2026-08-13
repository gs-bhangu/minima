<script lang="ts">
  import ContextMenu from '../../components/ContextMenu.svelte';
  import Glyph from '../../components/Glyph.svelte';
  import Header from '../../components/Header.svelte';
  import NotesCard from '../../components/NotesCard.svelte';
  import SearchBar from '../../components/SearchBar.svelte';
  import Section from '../../components/Section.svelte';
  import Toast from '../../components/Toast.svelte';
  import TodoCard from '../../components/TodoCard.svelte';
  import ShortcutDialog from '../../components/ShortcutDialog.svelte';
  import SettingsPanel from '../../components/settings/SettingsPanel.svelte';
  import { bookmarks } from '../../lib/bookmarks.svelte';
  import { clock } from '../../lib/clock.svelte';
  import { dialog } from '../../lib/dialog.svelte';
  import { drag } from '../../lib/dnd.svelte';
  import { menu } from '../../lib/menu.svelte';
  import {
    createGroup,
    createShortcut,
    hiddenCount,
    unhideAll,
  } from '../../lib/mutations';
  import { sections as sectionStore } from '../../lib/sections.svelte';
  import { settings } from '../../lib/settings.svelte';
  import { ui } from '../../lib/ui.svelte';
  import { currency } from '../../lib/currency.svelte';
  import { weather } from '../../lib/weather.svelte';
  import { background, STORED } from '../../lib/background.svelte';
  import { isLightColor, mixHex } from '../../lib/color';
  import type { PanelKey, PanelPlacement } from '../../lib/types';

  const config = $derived(settings.current);

  let panelOpen = $state(false);
  let searchBar = $state<SearchBar | null>(null);
  let prefersDark = $state(false);
  let mounted = $state(false);
  let viewport = $state(0);

  const CONTENT_PX = { narrow: 560, regular: 760, wide: 1000, full: 1440 };
  const DOCK_PX = 250;
  const DOCK_GAP = 24;

  clock.start();
  settings.init();

  $effect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    prefersDark = query.matches;
    const onChange = (event: MediaQueryListEvent) => (prefersDark = event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  });

  const requestedTheme = $derived(
    config.appearance.theme === 'auto'
      ? prefersDark
        ? 'dark'
        : 'light'
      : config.appearance.theme,
  );

  const backdrop = $derived(config.appearance.background);

  // A flat colour decides its own text palette; an image keeps the chosen theme
  // because only the user knows whether their picture is light or dark.
  const theme = $derived(
    backdrop.kind === 'color'
      ? isLightColor(backdrop.color)
        ? 'light'
        : 'dark'
      : requestedTheme,
  );

  const backdropImage = $derived(
    backdrop.kind === 'image'
      ? backdrop.image === STORED
        ? background.dataUrl
        : backdrop.image.trim() || null
      : null,
  );

  $effect(() => {
    if (backdrop.kind === 'image' && backdrop.image === STORED) background.load();
  });

  $effect(() => {
    const root = document.documentElement;
    if (backdrop.kind === 'color') {
      const light = isLightColor(backdrop.color);
      root.style.setProperty('--bg', backdrop.color);
      root.style.setProperty(
        '--bg-tint',
        mixHex(backdrop.color, '#ffffff', light ? 0.55 : 0.07),
      );
    } else {
      root.style.removeProperty('--bg');
      root.style.removeProperty('--bg-tint');
    }
  });

  $effect(() => {
    const root = document.documentElement;
    const { appearance, layout } = config;
    root.dataset.theme = theme;
    root.dataset.bg = backdropImage ? 'image' : appearance.background.kind;
    root.dataset.width = layout.width;
    root.dataset.tile = layout.tileSize;
    root.dataset.columns = layout.columns;
    root.dataset.shape = appearance.iconShape;
    root.dataset.cards = appearance.cards ? 'on' : 'off';
    root.dataset.grain = appearance.grain ? 'on' : 'off';
    root.dataset.motion = appearance.animations ? 'on' : 'off';
    root.style.setProperty('--accent', appearance.accent);
    root.style.setProperty('--grayscale', String(appearance.grayscale / 100));
    root.style.setProperty(
      '--grayscale-hover',
      appearance.colorOnHover ? '0' : String(appearance.grayscale / 100),
    );
  });

  $effect(() => {
    if (config.shortcuts.mode !== 'bookmarks') return;
    bookmarks.sync($state.snapshot(config.bookmarks));
  });

  $effect(() => {
    if (!config.weather.enabled) return;
    weather.load(
      config.weather.location ? $state.snapshot(config.weather.location) : null,
      config.weather.unit,
    );
  });

  $effect(() => {
    if (!config.currencies.enabled) return;
    currency.load(
      config.currencies.base,
      config.currencies.quotes.map((entry) => entry.code),
    );
  });

  $effect(() => {
    mounted = true;
  });

  const sections = $derived(sectionStore.all);
  const targets = $derived(
    sections
      .filter((section) => section.editable)
      .map((section) => ({ key: section.key, title: section.title })),
  );
  const isEmpty = $derived(
    settings.ready &&
      sections.length === 0 &&
      (config.shortcuts.mode === 'custom' || bookmarks.ready),
  );

  // A side dock may only float next to the column when it fits beside it.
  const canDock = $derived(
    viewport >= CONTENT_PX[config.layout.width] + 2 * (DOCK_PX + DOCK_GAP),
  );

  function placementOf(panel: PanelKey) {
    if (!config[panel].enabled) return null;
    return canDock ? config[panel].placement : 'inline';
  }

  const panelsAt = $derived.by(() => {
    const groups: Record<PanelPlacement, PanelKey[]> = { inline: [], left: [], right: [] };
    for (const panel of ['todos', 'notes'] as PanelKey[]) {
      const placement = placementOf(panel);
      if (placement) groups[placement].push(panel);
    }
    return groups;
  });

  function dock(placement: PanelPlacement) {
    if (drag.kind !== 'panel') return;
    settings.current[drag.key as PanelKey].placement = placement;
    drag.clear();
  }

  function toggleSection(key: string) {
    const index = config.collapsed.indexOf(key);
    if (index === -1) config.collapsed.push(key);
    else config.collapsed.splice(index, 1);
  }

  function addShortcut() {
    dialog.show({
      heading: 'New shortcut',
      title: '',
      url: '',
      icon: { type: 'auto', value: '' },
      sectionKey: targets[0]?.key ?? '',
      onSubmit: (data) => createShortcut(sectionStore.find(data.sectionKey), data),
    });
  }

  async function addGroup() {
    const key = await createGroup('New group');
    if (key) ui.renameKey = key;
  }

  const hidden = $derived(
    config.shortcuts.mode === 'bookmarks' ? hiddenCount() : 0,
  );

  function openPageMenu(event: MouseEvent) {
    // Leave the native menu alone in text fields so paste stays available.
    const target = event.target as HTMLElement | null;
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target?.isContentEditable
    ) {
      return;
    }
    menu.show(event, [
      { label: 'New shortcut…', glyph: 'plus', action: addShortcut },
      { label: 'New group', glyph: 'folder-plus', action: addGroup },
      ...(hidden > 0
        ? [
            { kind: 'separator' as const },
            {
              label: `Show ${hidden} hidden item${hidden === 1 ? '' : 's'}`,
              glyph: 'eye' as const,
              action: unhideAll,
            },
          ]
        : []),
      { kind: 'separator' },
      {
        label: config.layout.showAddButtons ? 'Hide add buttons' : 'Show add buttons',
        glyph: 'eye-off',
        action: () => (config.layout.showAddButtons = !config.layout.showAddButtons),
      },
      { label: 'Settings…', glyph: 'settings', action: () => (panelOpen = true) },
    ]);
  }

  function onKeydown(event: KeyboardEvent) {
    const target = event.target as HTMLElement | null;
    const typing =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      target?.isContentEditable;

    if (event.key === 'Escape') {
      if (menu.open) menu.close();
      else if (dialog.request) dialog.close();
      else panelOpen = false;
      return;
    }
    if (typing || event.metaKey || event.altKey) return;

    if (event.key === '/' && config.search.enabled) {
      event.preventDefault();
      searchBar?.focus();
    } else if (event.key === 'k' && event.ctrlKey && config.search.enabled) {
      event.preventDefault();
      searchBar?.focus();
    } else if (event.key === ',' && event.ctrlKey) {
      event.preventDefault();
      panelOpen = true;
    }
  }
</script>

{#snippet panelCard(panel: PanelKey)}
  {#if panel === 'todos'}
    <TodoCard collapsed={config.collapsed.includes('__todos__')} onToggle={toggleSection} />
  {:else}
    <NotesCard collapsed={config.collapsed.includes('__notes__')} onToggle={toggleSection} />
  {/if}
{/snippet}

<svelte:window onkeydown={onKeydown} bind:innerWidth={viewport} />

{#if backdropImage}
  <div
    class="backdrop"
    style="--bg-image: url('{backdropImage}'); --bg-blur: {backdrop.blur}px; --bg-dim: {backdrop.dim /
      100}; --bg-scale: {backdrop.blur > 0 ? 1 + backdrop.blur / 260 : 1}"
    data-fit={backdrop.fit}
  ></div>
{/if}

<main
  class="page"
  class:top={config.layout.verticalAlign === 'top'}
  class:ready={mounted}
  oncontextmenu={openPageMenu}
  ondragover={(event) => drag.kind === 'panel' && event.preventDefault()}
  ondrop={() => dock('inline')}
>
  <div class="stack">
    <Header onOpenSettings={() => (panelOpen = true)} />

    {#if config.search.enabled}
      <SearchBar bind:this={searchBar} />
    {/if}

    {#if sections.length}
      <div class="sections" ondragend={() => drag.clear()} role="presentation">
        {#each sections as section, index (section.key)}
          <Section
            {section}
            {index}
            total={sections.length}
            showTitle={config.layout.showGroupTitles}
            collapsed={config.collapsed.includes(section.key)}
            onToggle={toggleSection}
          />
        {/each}
      </div>
    {:else if isEmpty}
      <div class="empty">
        <p>
          {config.shortcuts.mode === 'bookmarks'
            ? 'No bookmarks in this folder yet.'
            : 'Nothing here yet.'}
        </p>
        <div class="empty-actions">
          <button class="ghost-button" type="button" onclick={addShortcut}>
            Add a shortcut
          </button>
          <button class="ghost-button" type="button" onclick={addGroup}>Add a group</button>
        </div>
      </div>
    {/if}

    {#if panelsAt.inline.length}
      <div class="extras">
        {#each panelsAt.inline as panel (panel)}
          {@render panelCard(panel)}
        {/each}
      </div>
    {/if}

    {#if sections.length && config.layout.showAddButtons}
      <button class="add-group" type="button" onclick={addGroup}>
        <Glyph name="plus" size={13} />
        New group
      </button>
    {/if}
  </div>
</main>

{#each ['left', 'right'] as const as side (side)}
  {#if panelsAt[side].length}
    <aside class="dock {side}" aria-label="Docked panels">
      {#each panelsAt[side] as panel (panel)}
        {@render panelCard(panel)}
      {/each}
    </aside>
  {/if}
{/each}

{#if drag.kind === 'panel'}
  {#each ['left', 'right'] as const as side (side)}
    <div
      class="dock-zone {side}"
      role="presentation"
      ondragover={(event) => event.preventDefault()}
      ondrop={() => dock(side)}
    >
      <span>Dock {side}</span>
    </div>
  {/each}
{/if}

<button
  class="settings-button"
  type="button"
  aria-label="Open settings"
  title="Settings"
  onclick={() => (panelOpen = true)}
>
  <Glyph name="settings" size={16} />
</button>

<ContextMenu />
<Toast />
<ShortcutDialog request={dialog.request} groups={targets} onClose={() => dialog.close()} />
<SettingsPanel open={panelOpen} onClose={() => (panelOpen = false)} />

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 0;
    background-image: var(--bg-image);
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    /* Scaled up so the blur doesn't reveal soft edges at the viewport border. */
    transform: scale(var(--bg-scale));
    filter: blur(var(--bg-blur));
  }

  .backdrop[data-fit='contain'] {
    background-size: contain;
  }

  .backdrop[data-fit='tile'] {
    background-size: auto;
    background-repeat: repeat;
  }

  .backdrop::after {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--bg);
    opacity: var(--bg-dim);
  }

  .page {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
    padding: clamp(24px, 6vh, 64px) clamp(16px, 4vw, 40px) 84px;
    opacity: 0;
    transition: opacity 260ms var(--ease);
  }

  .page.ready {
    opacity: 1;
  }

  .stack {
    display: flex;
    flex-direction: column;
    gap: clamp(20px, 4vh, 34px);
    width: 100%;
    max-width: var(--content);
    margin-inline: auto;
    /* Keeps the column optically centred without ever clipping overflow. */
    margin-block: auto;
  }

  .page.top .stack {
    margin-block: 0 auto;
  }

  .sections,
  .extras {
    display: grid;
    gap: 14px;
    align-items: start;
  }

  .extras {
    margin-top: -6px;
  }

  :global(:root[data-columns='auto']) .sections,
  :global(:root[data-columns='auto']) .extras {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  }

  :global(:root[data-columns='two']) .sections,
  :global(:root[data-columns='two']) .extras {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 700px) {
    :global(:root[data-columns='two']) .sections,
    :global(:root[data-columns='auto']) .sections,
    :global(:root[data-columns='two']) .extras,
    :global(:root[data-columns='auto']) .extras {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 28px 0;
    color: var(--text-faint);
    font-size: 13px;
  }

  .empty-actions {
    display: flex;
    gap: 8px;
  }

  .add-group {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin: -10px auto 0;
    padding: 6px 12px;
    border-radius: var(--r-sm);
    font-size: 12px;
    color: var(--text-faint);
    opacity: 0;
    transition: opacity var(--dur) var(--ease), background var(--dur) var(--ease),
      color var(--dur) var(--ease);
  }

  .stack:hover .add-group,
  .add-group:focus-visible {
    opacity: 0.6;
  }

  .add-group:hover {
    opacity: 1;
    background: var(--accent-soft);
    color: var(--accent-text);
  }

  .dock {
    position: fixed;
    top: 50%;
    z-index: 25;
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 250px;
    max-height: calc(100dvh - 120px);
    overflow-y: auto;
    padding: 4px;
    transform: translateY(-50%);
    scrollbar-width: thin;
  }

  .dock.left {
    left: 16px;
  }

  .dock.right {
    right: 16px;
  }

  .dock-zone {
    position: fixed;
    top: 12px;
    bottom: 12px;
    z-index: 55;
    display: grid;
    place-items: center;
    width: 262px;
    border-radius: var(--r-lg);
    border: 1px dashed var(--accent-line);
    background: var(--accent-soft);
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--accent-text);
  }

  .dock-zone span {
    writing-mode: vertical-rl;
  }

  .dock-zone.left {
    left: 12px;
  }

  .dock-zone.right {
    right: 12px;
  }

  .settings-button {
    position: fixed;
    right: 16px;
    bottom: 16px;
    z-index: 30;
    display: flex;
    padding: 9px;
    border-radius: 50%;
    color: var(--text-faint);
    opacity: 0.4;
    transition: opacity var(--dur) var(--ease), background var(--dur) var(--ease),
      color var(--dur) var(--ease), transform var(--dur) var(--ease);
  }

  .settings-button:hover,
  .settings-button:focus-visible {
    opacity: 1;
    background: var(--accent-soft);
    color: var(--accent-text);
    transform: rotate(30deg);
  }
</style>
