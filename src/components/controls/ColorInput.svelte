<script lang="ts">
  import { normalizeHex } from '../../lib/color';

  interface Props {
    value: string;
    label: string;
    onchange?: (value: string) => void;
  }

  let { value = $bindable(), label, onchange }: Props = $props();

  let draft = $state(value);

  // Follow the value when a preset swatch changes it from outside.
  $effect(() => {
    draft = value;
  });

  function set(next: string) {
    value = next;
    onchange?.(next);
  }

  function commit() {
    const parsed = normalizeHex(draft);
    if (parsed) set(parsed);
    else draft = value;
  }
</script>

<div class="picker">
  <label class="swatch" style="--current: {value}">
    <span class="sr-only">{label}</span>
    <input
      type="color"
      {value}
      oninput={(event) => set(event.currentTarget.value)}
    />
  </label>
  <input
    class="hex"
    bind:value={draft}
    aria-label="{label} hex code"
    placeholder="#000000"
    spellcheck="false"
    autocomplete="off"
    maxlength="7"
    onblur={commit}
    onkeydown={(event) => event.key === 'Enter' && commit()}
  />
</div>

<style>
  .picker {
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .swatch {
    position: relative;
    flex: none;
    width: 26px;
    height: 26px;
    border-radius: var(--r-sm);
    background: var(--current);
    border: 1px solid var(--line);
    cursor: pointer;
    overflow: hidden;
    transition: border-color var(--dur) var(--ease);
  }

  .swatch:hover {
    border-color: var(--accent-line);
  }

  .swatch input {
    position: absolute;
    inset: -4px;
    width: 200%;
    height: 200%;
    padding: 0;
    border: 0;
    background: none;
    cursor: pointer;
    opacity: 0;
  }

  .hex {
    width: 88px;
    height: 26px;
    padding: 0 8px;
    border-radius: var(--r-sm);
    border: 1px solid var(--line);
    background: var(--bg-tint);
    font-family: var(--font-mono);
    font-size: 11.5px;
    outline: none;
    transition: border-color var(--dur) var(--ease);
  }

  .hex:focus {
    border-color: var(--accent-line);
  }
</style>
