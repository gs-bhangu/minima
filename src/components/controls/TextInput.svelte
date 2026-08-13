<script lang="ts">
  interface Props {
    value: string;
    label: string;
    placeholder?: string;
    compact?: boolean;
    type?: 'text' | 'url';
    onEnter?: () => void;
  }

  let {
    value = $bindable(),
    label,
    placeholder = '',
    compact = false,
    type = 'text',
    onEnter,
  }: Props = $props();
</script>

<input
  class="input"
  class:compact
  {type}
  {placeholder}
  aria-label={label}
  spellcheck="false"
  autocomplete="off"
  bind:value
  onkeydown={(e) => e.key === 'Enter' && onEnter?.()}
/>

<style>
  .input {
    width: 100%;
    height: 30px;
    padding: 0 10px;
    border-radius: var(--r-sm);
    border: 1px solid var(--line);
    background: var(--bg-tint);
    font-size: 12.5px;
    outline: none;
    transition: border-color var(--dur) var(--ease), background var(--dur) var(--ease);
  }

  .input.compact {
    height: 27px;
    font-size: 12px;
  }

  .input::placeholder {
    color: var(--text-faint);
  }

  .input:focus {
    border-color: color-mix(in srgb, var(--accent) 60%, var(--line));
  }
</style>
