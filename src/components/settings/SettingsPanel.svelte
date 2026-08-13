<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import Glyph from '../Glyph.svelte';
  import Group from '../controls/Group.svelte';
  import Row from '../controls/Row.svelte';
  import Segmented from '../controls/Segmented.svelte';
  import Select from '../controls/Select.svelte';
  import Slider from '../controls/Slider.svelte';
  import Swatches from '../controls/Swatches.svelte';
  import TextInput from '../controls/TextInput.svelte';
  import Toggle from '../controls/Toggle.svelte';
  import About from './About.svelte';
  import BackgroundSettings from './BackgroundSettings.svelte';
  import BookmarkSettings from './BookmarkSettings.svelte';
  import CustomShortcuts from './CustomShortcuts.svelte';
  import Currencies from './Currencies.svelte';
  import TimeZones from './TimeZones.svelte';
  import WeatherSettings from './WeatherSettings.svelte';
  import { settings } from '../../lib/settings.svelte';
  import { ACCENTS } from '../../lib/defaults';
  import { SEARCH_ENGINES } from '../../lib/search';
  import type {
    ClockFace,
    PanelPlacement,
    ShortcutMode,
    TileSize,
    SectionColumns,
    ThemeMode,
  } from '../../lib/types';

  interface Props {
    open: boolean;
    onClose: () => void;
  }

  let { open, onClose }: Props = $props();

  const config = $derived(settings.current);
  const duration = $derived(config.appearance.animations ? 220 : 0);

  let confirmingReset = $state(false);
  let fileInput = $state<HTMLInputElement | null>(null);

  const themeOptions: { value: ThemeMode; label: string }[] = [
    { value: 'auto', label: 'Auto' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ];

  const tileOptions: { value: TileSize; label: string }[] = [
    { value: 'sm', label: 'S' },
    { value: 'md', label: 'M' },
    { value: 'lg', label: 'L' },
  ];

  const columnOptions: { value: SectionColumns; label: string }[] = [
    { value: 'auto', label: 'Auto' },
    { value: 'one', label: '1' },
    { value: 'two', label: '2' },
  ];

  const placementOptions: { value: PanelPlacement; label: string }[] = [
    { value: 'inline', label: 'Column' },
    { value: 'left', label: 'Left' },
    { value: 'right', label: 'Right' },
  ];

  const faceOptions: { value: ClockFace; label: string }[] = [
    { value: 'sans', label: 'Sans' },
    { value: 'mono', label: 'Mono' },
  ];

  const modeOptions: { value: ShortcutMode; label: string }[] = [
    { value: 'bookmarks', label: 'Browser bookmarks' },
    { value: 'custom', label: 'Custom set' },
  ];

  const shapeOptions = [
    { value: 'squircle', label: 'Squircle' },
    { value: 'rounded', label: 'Rounded' },
    { value: 'circle', label: 'Circle' },
    { value: 'square', label: 'Square' },
  ];

  const widthOptions = [
    { value: 'narrow', label: 'Narrow' },
    { value: 'regular', label: 'Regular' },
    { value: 'wide', label: 'Wide' },
    { value: 'full', label: 'Full width' },
  ];

  const dateOptions = [
    { value: 'long', label: 'Sunday, 26 July' },
    { value: 'medium', label: 'Sun, 26 Jul' },
    { value: 'short', label: '26/7/2026' },
    { value: 'iso', label: '2026-07-26' },
  ];

  const engineOptions = [
    ...SEARCH_ENGINES.map((engine) => ({
      value: engine.id,
      label:
        engine.kind === 'ai' && !engine.label.includes('AI')
          ? `${engine.label} (AI)`
          : engine.label,
    })),
    { value: 'custom', label: 'Custom…' },
  ];

  function exportSettings() {
    const blob = new Blob([settings.toJSON()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'minima-settings.json';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function importSettings(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      settings.fromJSON(await file.text());
    } catch {
      // Ignore malformed files — the current configuration stays untouched.
    }
    if (fileInput) fileInput.value = '';
  }

  function reset() {
    if (!confirmingReset) {
      confirmingReset = true;
      setTimeout(() => (confirmingReset = false), 4000);
      return;
    }
    settings.reset();
    confirmingReset = false;
  }
</script>

{#if open}
  <div
    class="scrim"
    role="presentation"
    onclick={onClose}
    transition:fade={{ duration }}
  ></div>

  <aside
    class="panel"
    aria-label="Minima settings"
    transition:fly={{ x: 24, duration, opacity: 0 }}
  >
    <header class="panel-head">
      <h2>Settings</h2>
      <button class="close" type="button" aria-label="Close settings" onclick={onClose}>
        <Glyph name="close" size={16} />
      </button>
    </header>

    <div class="scroll">
      <Group title="Appearance">
        <Row label="Theme">
          <Segmented bind:value={config.appearance.theme} options={themeOptions} label="Theme" />
        </Row>
        <Row label="Accent" stacked>
          <Swatches
            bind:value={config.appearance.accent}
            options={ACCENTS}
            label="Accent colour"
          />
        </Row>

        <BackgroundSettings />

        <Row label="Icon greyscale" stacked>
          <Slider
            bind:value={config.appearance.grayscale}
            min={0}
            max={100}
            label="Icon greyscale"
            display="{config.appearance.grayscale}%"
          />
        </Row>
        <Row label="Colour on hover" hint="Icons regain their colour when pointed at.">
          <Toggle bind:checked={config.appearance.colorOnHover} label="Colour on hover" />
        </Row>
        <Row label="Icon shape">
          <Select
            bind:value={config.appearance.iconShape}
            options={shapeOptions}
            label="Icon shape"
          />
        </Row>
        <Row
          label="Icon source"
          hint={config.appearance.iconSource === 'local'
            ? 'Uses the browser icon cache. No requests leave your machine.'
            : 'Fetches icons from Google when the local cache has none.'}
        >
          <Segmented
            bind:value={config.appearance.iconSource}
            options={[
              { value: 'local', label: 'Local' },
              { value: 'online', label: 'Online' },
            ]}
            label="Icon source"
          />
        </Row>
        <Row label="Group cards" hint="Draw a soft panel behind each group.">
          <Toggle bind:checked={config.appearance.cards} label="Group cards" />
        </Row>
        <Row label="Paper grain">
          <Toggle bind:checked={config.appearance.grain} label="Paper grain" />
        </Row>
        <Row label="Animations">
          <Toggle bind:checked={config.appearance.animations} label="Animations" />
        </Row>
      </Group>

      <Group title="Layout">
        <Row label="Content width">
          <Select bind:value={config.layout.width} options={widthOptions} label="Content width" />
        </Row>
        <Row label="Tile size">
          <Segmented bind:value={config.layout.tileSize} options={tileOptions} label="Tile size" />
        </Row>
        <Row label="Group columns">
          <Segmented bind:value={config.layout.columns} options={columnOptions} label="Group columns" />
        </Row>
        <Row label="Vertical position">
          <Segmented
            bind:value={config.layout.verticalAlign}
            options={[
              { value: 'center', label: 'Centre' },
              { value: 'top', label: 'Top' },
            ]}
            label="Vertical position"
          />
        </Row>
        <Row label="Tile labels">
          <Toggle bind:checked={config.layout.showLabels} label="Tile labels" />
        </Row>
        <Row label="Group titles">
          <Toggle bind:checked={config.layout.showGroupTitles} label="Group titles" />
        </Row>
        <Row label="Add buttons" hint="Ghost tiles for adding shortcuts and groups.">
          <Toggle bind:checked={config.layout.showAddButtons} label="Add buttons" />
        </Row>
      </Group>

      <Group title="Time & date">
        <Row label="Clock">
          <Toggle bind:checked={config.clock.enabled} label="Clock" />
        </Row>
        {#if config.clock.enabled}
          <Row label="12-hour time">
            <Toggle bind:checked={config.clock.hour12} label="12-hour time" />
          </Row>
          <Row label="Seconds">
            <Toggle bind:checked={config.clock.seconds} label="Seconds" />
          </Row>
          <Row label="Numerals">
            <Segmented bind:value={config.clock.face} options={faceOptions} label="Numerals" />
          </Row>
          <Row label="Clock size" stacked>
            <Slider
              bind:value={config.clock.scale}
              min={0.5}
              max={1.6}
              step={0.05}
              label="Clock size"
              display="{Math.round(config.clock.scale * 100)}%"
            />
          </Row>
        {/if}
        <Row
          label="Details size"
          hint="Date, weather, world clocks, greeting and rates."
          stacked
        >
          <Slider
            bind:value={config.layout.detailScale}
            min={0.75}
            max={1.8}
            step={0.05}
            label="Details size"
            display="{Math.round(config.layout.detailScale * 100)}%"
          />
        </Row>
        <Row label="Date">
          <Toggle bind:checked={config.date.enabled} label="Date" />
        </Row>
        {#if config.date.enabled}
          <Row label="Date format" stacked>
            <Select bind:value={config.date.format} options={dateOptions} label="Date format" />
          </Row>
        {/if}
        <Row label="World clocks" hint="Extra time zones under the date.">
          <Toggle bind:checked={config.clock.showZones} label="World clocks" />
        </Row>
        <Row label="Time zones" stacked>
          <TimeZones />
        </Row>

        <Row label="Greeting">
          <Toggle bind:checked={config.greeting.enabled} label="Greeting" />
        </Row>
        {#if config.greeting.enabled}
          <Row label="Your name" stacked>
            <TextInput
              bind:value={config.greeting.name}
              label="Your name"
              placeholder="Optional"
            />
          </Row>
        {/if}
      </Group>

      <Group title="Currencies">
        <Row label="Show rates" hint="Exchange rates under the world clocks.">
          <Toggle bind:checked={config.currencies.enabled} label="Show rates" />
        </Row>
        <Row label="Currencies" stacked>
          <Currencies />
        </Row>
      </Group>

      <Group title="Weather">
        <Row label="Show weather">
          <Toggle bind:checked={config.weather.enabled} label="Show weather" />
        </Row>
        {#if config.weather.enabled}
          <WeatherSettings />
        {/if}
      </Group>

      <Group title="Search">
        <Row label="Search field">
          <Toggle bind:checked={config.search.enabled} label="Search field" />
        </Row>
        {#if config.search.enabled}
          <Row label="Engine">
            <Select bind:value={config.search.engine} options={engineOptions} label="Engine" />
          </Row>
          {#if config.search.engine === 'custom'}
            <Row label="Query URL" hint="Use {'{q}'} where the search terms go." stacked>
              <TextInput
                bind:value={config.search.customUrl}
                label="Query URL"
                placeholder="https://example.com/search?q={'{q}'}"
              />
            </Row>
          {/if}
          <Row
            label="Match shortcuts"
            hint="Suggest your own shortcuts as you type. Arrow keys pick one."
          >
            <Toggle bind:checked={config.search.quickSwitch} label="Match shortcuts" />
          </Row>
          <Row label="Open in a new tab">
            <Toggle bind:checked={config.search.newTab} label="Open in a new tab" />
          </Row>
        {/if}
      </Group>

      <Group title="Panels">
        <Row label="To-do list" hint="A short checklist you can type straight into.">
          <Toggle bind:checked={config.todos.enabled} label="To-do list" />
        </Row>
        {#if config.todos.enabled}
          <Row label="Place to-do">
            <Segmented
              bind:value={config.todos.placement}
              options={placementOptions}
              label="Place to-do"
            />
          </Row>
        {/if}
        <Row label="Quick notes" hint="A scratchpad that saves as you type.">
          <Toggle bind:checked={config.notes.enabled} label="Quick notes" />
        </Row>
        {#if config.notes.enabled}
          <Row label="Place notes">
            <Segmented
              bind:value={config.notes.placement}
              options={placementOptions}
              label="Place notes"
            />
          </Row>
        {/if}
        {#if config.todos.enabled || config.notes.enabled}
          <p class="hint">
            Drag a panel by its title to dock it to either side, or right-click it for the
            same options. Docked panels drop back into the column on narrow windows.
          </p>
        {/if}
      </Group>

      <Group title="Shortcuts">
        <Row label="Source" stacked>
          <Segmented
            bind:value={config.shortcuts.mode}
            options={modeOptions}
            label="Shortcut source"
            full
          />
        </Row>
        {#if config.shortcuts.mode === 'bookmarks'}
          <BookmarkSettings />
        {:else}
          <CustomShortcuts />
        {/if}
      </Group>

      <Group title="Data">
        <div class="data-actions">
          <button class="ghost-button" type="button" onclick={exportSettings}>Export</button>
          <button class="ghost-button" type="button" onclick={() => fileInput?.click()}>
            Import
          </button>
          <button class="ghost-button danger" type="button" onclick={reset}>
            {confirmingReset ? 'Tap again to confirm' : 'Reset'}
          </button>
        </div>
        <input
          bind:this={fileInput}
          class="sr-only"
          type="file"
          accept="application/json"
          tabindex="-1"
          aria-hidden="true"
          onchange={importSettings}
        />
        <p class="note">
          Right-click the page, a group or a tile to edit shortcuts without opening this
          panel. Press <kbd>/</kbd> to search and <kbd>Esc</kbd> to close.
        </p>
      </Group>

      <Group title="About">
        <About />
      </Group>
    </div>
  </aside>
{/if}

<style>
  .scrim {
    position: fixed;
    inset: 0;
    z-index: 40;
    background: color-mix(in srgb, var(--bg) 55%, transparent);
    backdrop-filter: blur(2px);
  }

  .panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 50;
    display: flex;
    flex-direction: column;
    width: min(392px, 100%);
    background: var(--bg-tint);
    border-left: 1px solid var(--line);
    box-shadow: -24px 0 60px rgba(0, 0, 0, 0.09);
  }

  :global(:root[data-theme='dark']) .panel {
    box-shadow: -24px 0 60px rgba(0, 0, 0, 0.5);
  }

  .panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 18px 12px;
    border-bottom: 1px solid var(--line);
  }

  h2 {
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.02em;
  }

  .close {
    display: flex;
    padding: 5px;
    margin: -5px;
    border-radius: var(--r-sm);
    color: var(--text-faint);
    transition: color var(--dur) var(--ease), background var(--dur) var(--ease);
  }

  .close:hover {
    background: var(--surface);
    color: var(--text);
  }

  .scroll {
    flex: 1;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 4px 18px 32px;
    scrollbar-width: thin;
  }

  .scroll::-webkit-scrollbar {
    width: 9px;
  }

  .scroll::-webkit-scrollbar-thumb {
    background: var(--line);
    border-radius: 999px;
    border: 3px solid var(--bg-tint);
  }

  .data-actions {
    display: flex;
    gap: 7px;
    padding: 4px 0 2px;
  }

  .data-actions .ghost-button {
    flex: 1;
  }

  .ghost-button.danger:hover {
    color: #c9503f;
    border-color: color-mix(in srgb, #c9503f 40%, var(--line));
  }

  .hint {
    padding: 2px 0 6px;
    font-size: 11.5px;
    line-height: 1.5;
    color: var(--text-faint);
  }

  .note {
    padding-top: 12px;
    font-size: 11.5px;
    line-height: 1.55;
    color: var(--text-faint);
  }

  kbd {
    font-family: var(--font-mono);
    font-size: 10.5px;
    padding: 1px 4px;
    border-radius: 4px;
    background: var(--surface);
  }
</style>
