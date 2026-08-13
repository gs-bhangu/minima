<script lang="ts">
  import Glyph from '../Glyph.svelte';
  import Row from '../controls/Row.svelte';
  import Segmented from '../controls/Segmented.svelte';
  import Slider from '../controls/Slider.svelte';
  import Swatches from '../controls/Swatches.svelte';
  import TextInput from '../controls/TextInput.svelte';
  import { BACKGROUND_PRESETS } from '../../lib/defaults';
  import { background, STORED } from '../../lib/background.svelte';
  import { settings } from '../../lib/settings.svelte';
  import type { BackgroundFit, BackgroundKind } from '../../lib/types';

  const config = $derived(settings.current.appearance.background);

  let fileInput = $state<HTMLInputElement | null>(null);
  let urlDraft = $state('');

  $effect(() => {
    background.load();
  });

  $effect(() => {
    if (config.image !== STORED) urlDraft = config.image;
  });

  const kindOptions: { value: BackgroundKind; label: string }[] = [
    { value: 'paper', label: 'Paper' },
    { value: 'color', label: 'Colour' },
    { value: 'image', label: 'Image' },
  ];

  const fitOptions: { value: BackgroundFit; label: string }[] = [
    { value: 'cover', label: 'Fill' },
    { value: 'contain', label: 'Fit' },
    { value: 'tile', label: 'Tile' },
  ];

  const preview = $derived(
    config.image === STORED ? background.dataUrl : config.image.trim() || null,
  );

  async function pickFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (fileInput) fileInput.value = '';
    if (!file) return;
    if (await background.save(file)) {
      config.image = STORED;
      config.kind = 'image';
    }
  }

  function useUrl() {
    const value = urlDraft.trim();
    if (!value) return;
    config.image = value;
    config.kind = 'image';
  }

  async function removeImage() {
    await background.clear();
    config.image = '';
    urlDraft = '';
  }
</script>

<Row label="Background">
  <Segmented bind:value={config.kind} options={kindOptions} label="Background" />
</Row>

{#if config.kind === 'color'}
  <Row label="Colour" hint="Minima flips its text to suit light or dark choices." stacked>
    <Swatches bind:value={config.color} options={BACKGROUND_PRESETS} label="Background colour" />
  </Row>
{:else if config.kind === 'image'}
  <Row label="Picture" stacked>
    <div class="image">
      {#if preview}
        <div class="preview" style="background-image: url('{preview}')">
          <button
            class="drop"
            type="button"
            aria-label="Remove picture"
            title="Remove picture"
            onclick={removeImage}
          >
            <Glyph name="close" size={13} />
          </button>
        </div>
      {/if}

      <div class="actions">
        <button
          class="ghost-button"
          type="button"
          disabled={background.busy}
          onclick={() => fileInput?.click()}
        >
          {background.busy ? 'Working…' : 'Choose file'}
        </button>
        {#if preview}
          <button class="ghost-button" type="button" onclick={removeImage}>Remove</button>
        {/if}
      </div>

      <div class="url">
        <TextInput
          bind:value={urlDraft}
          label="Image address"
          placeholder="…or paste an image address"
          compact
          onEnter={useUrl}
        />
        <button
          class="ghost-button"
          type="button"
          onclick={useUrl}
          disabled={!urlDraft.trim() || urlDraft.trim() === config.image}
        >
          Use
        </button>
      </div>

      <input
        bind:this={fileInput}
        class="sr-only"
        type="file"
        accept="image/*"
        tabindex="-1"
        aria-hidden="true"
        onchange={pickFile}
      />

      {#if background.error}
        <p class="error">{background.error}</p>
      {:else}
        <p class="hint">
          Uploads are resized and kept on this device. They aren't included in exported
          settings.
        </p>
      {/if}
    </div>
  </Row>

  {#if preview}
    <Row label="Fit">
      <Segmented bind:value={config.fit} options={fitOptions} label="Fit" />
    </Row>
    <Row label="Dim" hint="Lays the page colour over the picture." stacked>
      <Slider
        bind:value={config.dim}
        min={0}
        max={90}
        label="Dim"
        display="{config.dim}%"
      />
    </Row>
    <Row label="Blur" stacked>
      <Slider
        bind:value={config.blur}
        min={0}
        max={24}
        label="Blur"
        display="{config.blur}px"
      />
    </Row>
  {/if}
{/if}

<style>
  .image {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  .preview {
    position: relative;
    height: 92px;
    border-radius: var(--r-sm);
    border: 1px solid var(--line);
    background-size: cover;
    background-position: center;
  }

  .drop {
    position: absolute;
    top: 6px;
    right: 6px;
    display: flex;
    padding: 4px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--bg) 70%, transparent);
    backdrop-filter: blur(6px);
    color: var(--text);
    transition: background var(--dur) var(--ease);
  }

  .drop:hover {
    background: var(--bg);
  }

  .actions,
  .url {
    display: flex;
    gap: 6px;
  }

  .actions .ghost-button {
    flex: 1;
  }

  .url :global(.input) {
    flex: 1;
  }

  .hint,
  .error {
    font-size: 11.5px;
    line-height: 1.45;
    color: var(--text-faint);
  }

  .error {
    color: #c9503f;
  }
</style>
