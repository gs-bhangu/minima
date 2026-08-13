<script lang="ts">
  interface Option {
    value: string;
    label: string;
  }

  interface Props {
    value: string;
    options: Option[];
    label: string;
  }

  let { value = $bindable(), options, label }: Props = $props();
</script>

<select class="select" aria-label={label} bind:value>
  {#each options as option (option.value)}
    <option value={option.value}>{option.label}</option>
  {/each}
</select>

<style>
  .select {
    max-width: 100%;
    height: 30px;
    padding: 0 8px;
    border-radius: var(--r-sm);
    border: 1px solid var(--line);
    background: var(--bg-tint);
    font-size: 12.5px;
    cursor: pointer;
    outline: none;
    transition: border-color var(--dur) var(--ease);
  }

  .select:focus {
    border-color: color-mix(in srgb, var(--accent) 60%, var(--line));
  }
</style>
