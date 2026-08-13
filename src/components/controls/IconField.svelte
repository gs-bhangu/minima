<script lang="ts">
  import { untrack } from 'svelte';
  import Segmented from './Segmented.svelte';
  import TextInput from './TextInput.svelte';
  import type { IconOverride } from '../../lib/types';

  interface Props {
    icon: IconOverride;
    onupdate: (icon: IconOverride) => void;
  }

  let { icon, onupdate }: Props = $props();

  const initial = untrack(() => icon);
  let type = $state<IconOverride['type']>(initial.type);
  let value = $state(initial.value);

  $effect(() => {
    onupdate({ type, value });
  });

  const options = [
    { value: 'auto' as const, label: 'Auto' },
    { value: 'emoji' as const, label: 'Emoji' },
    { value: 'text' as const, label: 'Letters' },
    { value: 'url' as const, label: 'Image' },
  ];

  const placeholder = $derived(
    type === 'emoji'
      ? 'Paste an emoji'
      : type === 'text'
        ? 'Up to 2 characters'
        : 'https://…/icon.png',
  );
</script>

<div class="icon-field">
  <Segmented
    bind:value={type}
    {options}
    label="Icon source"
    full
    onchange={() => (value = '')}
  />
  {#if type !== 'auto'}
    <TextInput bind:value label="Icon value" {placeholder} compact />
  {/if}
</div>

<style>
  .icon-field {
    display: flex;
    flex-direction: column;
    gap: 7px;
    padding: 9px 10px;
    border-radius: var(--r-sm);
    background: var(--surface);
  }
</style>
