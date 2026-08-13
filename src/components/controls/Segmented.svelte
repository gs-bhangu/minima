<script lang="ts" generics="T extends string">
  interface Option {
    value: T;
    label: string;
  }

  interface Props {
    value: T;
    options: Option[];
    label: string;
    full?: boolean;
    onchange?: (value: T) => void;
  }

  let { value = $bindable(), options, label, full = false, onchange }: Props = $props();

  function select(next: T) {
    value = next;
    onchange?.(next);
  }
</script>

<div class="segmented" class:full role="radiogroup" aria-label={label}>
  {#each options as option (option.value)}
    <button
      type="button"
      role="radio"
      aria-checked={value === option.value}
      class:active={value === option.value}
      onclick={() => select(option.value)}
    >
      {option.label}
    </button>
  {/each}
</div>

<style>
  .segmented {
    display: inline-flex;
    padding: 2px;
    gap: 2px;
    border-radius: var(--r-sm);
    background: var(--surface);
    border: 1px solid transparent;
  }

  .segmented.full {
    display: flex;
    width: 100%;
  }

  button {
    flex: 1;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    color: var(--text-faint);
    transition: background var(--dur) var(--ease), color var(--dur) var(--ease);
  }

  button:hover {
    color: var(--text-muted);
  }

  button.active {
    background: var(--bg-tint);
    color: var(--text);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  }

  :global(:root[data-theme='dark']) button.active {
    box-shadow: none;
    background: var(--surface-hover);
  }
</style>
