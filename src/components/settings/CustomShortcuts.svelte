<script lang="ts">
  import Glyph from '../Glyph.svelte';
  import TileIcon from '../TileIcon.svelte';
  import IconField from '../controls/IconField.svelte';
  import { makeShortcut } from '../../lib/defaults';
  import { normalizeUrl } from '../../lib/icons';
  import { settings } from '../../lib/settings.svelte';

  const groups = $derived(settings.current.shortcuts.groups);
  const iconSource = $derived(settings.current.appearance.iconSource);

  let openIcon = $state<string | null>(null);
  let dragging = $state<{ group: number; index: number } | null>(null);
  let handleArmed = $state(false);

  function addGroup() {
    groups.push({
      id: crypto.randomUUID(),
      title: 'New group',
      shortcuts: [makeShortcut()],
    });
  }

  function removeGroup(index: number) {
    groups.splice(index, 1);
  }

  function addShortcut(index: number) {
    groups[index].shortcuts.push(makeShortcut());
  }

  function removeShortcut(groupIndex: number, index: number) {
    groups[groupIndex].shortcuts.splice(index, 1);
  }

  function tidyUrl(groupIndex: number, index: number) {
    const shortcut = groups[groupIndex].shortcuts[index];
    shortcut.url = normalizeUrl(shortcut.url);
  }

  function onDragStart(group: number, index: number, event: DragEvent) {
    if (!handleArmed) {
      event.preventDefault();
      return;
    }
    dragging = { group, index };
    event.dataTransfer!.effectAllowed = 'move';
  }

  function onDragOver(group: number, index: number, event: DragEvent) {
    if (!dragging) return;
    event.preventDefault();
    if (dragging.group === group && dragging.index === index) return;
    const [moved] = groups[dragging.group].shortcuts.splice(dragging.index, 1);
    groups[group].shortcuts.splice(index, 0, moved);
    dragging = { group, index };
  }

  function endDrag() {
    dragging = null;
    handleArmed = false;
  }
</script>

<div class="editor">
  {#each groups as group, groupIndex (group.id)}
    <div class="block">
      <div class="block-head">
        <input
          class="group-title"
          bind:value={group.title}
          aria-label="Group name"
          placeholder="Group name"
          spellcheck="false"
        />
        <button
          class="icon-button"
          type="button"
          aria-label="Delete group"
          title="Delete group"
          onclick={() => removeGroup(groupIndex)}
        >
          <Glyph name="trash" size={14} />
        </button>
      </div>

      <ul class="rows">
        {#each group.shortcuts as shortcut, index (shortcut.id)}
          <li
            class="row"
            class:dragging={dragging?.group === groupIndex && dragging?.index === index}
            draggable={handleArmed}
            ondragstart={(e) => onDragStart(groupIndex, index, e)}
            ondragover={(e) => onDragOver(groupIndex, index, e)}
            ondragend={endDrag}
            ondrop={endDrag}
          >
            <span
              class="grip"
              role="presentation"
              title="Drag to reorder"
              onpointerdown={() => (handleArmed = true)}
              onpointerup={() => (handleArmed = false)}
            >
              <Glyph name="grip" size={14} />
            </span>

            <button
              class="preview"
              type="button"
              title="Change icon"
              aria-label="Change icon for {shortcut.title || 'shortcut'}"
              onclick={() => (openIcon = openIcon === shortcut.id ? null : shortcut.id)}
            >
              <TileIcon
                title={shortcut.title}
                url={shortcut.url}
                icon={shortcut.icon}
                source={iconSource}
              />
            </button>

            <div class="fields">
              <input
                bind:value={shortcut.title}
                aria-label="Shortcut name"
                placeholder="Name"
                spellcheck="false"
              />
              <input
                class="url"
                bind:value={shortcut.url}
                onblur={() => tidyUrl(groupIndex, index)}
                aria-label="Shortcut address"
                placeholder="example.com"
                spellcheck="false"
              />
            </div>

            <button
              class="icon-button"
              type="button"
              aria-label="Remove shortcut"
              title="Remove"
              onclick={() => removeShortcut(groupIndex, index)}
            >
              <Glyph name="close" size={14} />
            </button>
          </li>

          {#if openIcon === shortcut.id}
            <li class="icon-row">
              <IconField
                icon={shortcut.icon}
                onupdate={(next) => (shortcut.icon = next)}
              />
            </li>
          {/if}
        {/each}
      </ul>

      <button class="add" type="button" onclick={() => addShortcut(groupIndex)}>
        <Glyph name="plus" size={13} />
        Add shortcut
      </button>
    </div>
  {/each}

  <button class="ghost-button wide" type="button" onclick={addGroup}>
    <Glyph name="plus" size={13} />
    Add group
  </button>
</div>

<style>
  .editor {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-top: 4px;
  }

  .block {
    border: 1px solid var(--line);
    border-radius: var(--r-md);
    padding: 8px;
  }

  .block-head {
    display: flex;
    align-items: center;
    gap: 6px;
    padding-bottom: 6px;
  }

  .group-title {
    flex: 1;
    min-width: 0;
    height: 26px;
    padding: 0 6px;
    border: 1px solid transparent;
    border-radius: var(--r-sm);
    background: none;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-muted);
    outline: none;
  }

  .group-title:hover,
  .group-title:focus {
    background: var(--surface);
  }

  .rows {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .row {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 4px;
    border-radius: var(--r-sm);
    background: var(--bg-tint);
    border: 1px solid transparent;
    transition: border-color var(--dur) var(--ease), opacity var(--dur) var(--ease);
  }

  .row:hover {
    border-color: var(--line);
  }

  .row.dragging {
    opacity: 0.5;
  }

  .grip {
    display: flex;
    color: var(--text-faint);
    cursor: grab;
    touch-action: none;
  }

  .grip:active {
    cursor: grabbing;
  }

  .preview {
    --tile-icon: 26px;
    display: flex;
    flex: none;
    filter: grayscale(var(--grayscale));
    transition: filter var(--dur) var(--ease);
  }

  .preview:hover {
    filter: grayscale(0);
  }

  .fields {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    gap: 1px;
  }

  .fields input {
    width: 100%;
    height: 19px;
    padding: 0 3px;
    border: 0;
    border-radius: 3px;
    background: none;
    font-size: 12px;
    outline: none;
  }

  .fields input:hover,
  .fields input:focus {
    background: var(--surface);
  }

  .fields .url {
    font-size: 11px;
    color: var(--text-faint);
  }

  .icon-row {
    padding: 4px 0 2px;
  }

  .icon-button {
    display: flex;
    flex: none;
    padding: 4px;
    border-radius: 4px;
    color: var(--text-faint);
    opacity: 0;
    transition: opacity var(--dur) var(--ease), color var(--dur) var(--ease),
      background var(--dur) var(--ease);
  }

  .row:hover .icon-button,
  .block-head:hover .icon-button,
  .icon-button:focus-visible {
    opacity: 1;
  }

  .icon-button:hover {
    background: var(--surface);
    color: var(--text);
  }

  .add {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 6px;
    padding: 4px 6px;
    border-radius: var(--r-sm);
    font-size: 12px;
    color: var(--text-faint);
    transition: color var(--dur) var(--ease), background var(--dur) var(--ease);
  }

  .add:hover {
    background: var(--surface);
    color: var(--text);
  }

  .wide {
    width: 100%;
  }
</style>
