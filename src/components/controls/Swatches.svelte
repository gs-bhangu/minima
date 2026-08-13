<script lang="ts">
  import ColorInput from './ColorInput.svelte';

  interface Props {
    value: string;
    options: readonly { id: string; value: string }[];
    label: string;
  }

  let { value = $bindable(), options, label }: Props = $props();
</script>

<div class="choice">
  <div class="swatches" role="radiogroup" aria-label={label}>
    {#each options as option (option.id)}
      <button
        type="button"
        role="radio"
        aria-checked={value === option.value}
        aria-label={option.id}
        title={option.id}
        class:active={value === option.value}
        style="--swatch: {option.value}"
        onclick={() => (value = option.value)}
      ></button>
    {/each}
  </div>

  <ColorInput bind:value label="Custom colour" />
</div>

<style>
  .choice {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
  }

  .swatches {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }

  button {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--swatch);
    border: 1px solid rgba(128, 128, 128, 0.35);
    transition: transform var(--dur) var(--ease), box-shadow var(--dur) var(--ease);
  }

  button:hover {
    transform: scale(1.12);
  }

  button.active {
    box-shadow: 0 0 0 2px var(--bg-tint), 0 0 0 3.5px var(--swatch);
  }
</style>
