<script lang="ts">
  interface Props {
    checked: boolean;
    label: string;
  }

  let { checked = $bindable(), label }: Props = $props();
</script>

<button
  class="toggle"
  type="button"
  role="switch"
  aria-checked={checked}
  aria-label={label}
  onclick={() => (checked = !checked)}
>
  <span class="knob"></span>
</button>

<style>
  .toggle {
    position: relative;
    width: 36px;
    height: 21px;
    border-radius: 999px;
    background: var(--surface);
    border: 1px solid var(--line);
    transition: background var(--dur) var(--ease), border-color var(--dur) var(--ease);
  }

  .toggle[aria-checked='true'] {
    background: var(--accent);
    border-color: transparent;
  }

  .knob {
    position: absolute;
    top: 50%;
    left: 3px;
    width: 13px;
    height: 13px;
    border-radius: 50%;
    background: var(--text-muted);
    transform: translateY(-50%);
    transition: transform var(--dur) var(--ease), background var(--dur) var(--ease);
  }

  .toggle[aria-checked='true'] .knob {
    background: #fff;
    transform: translate(15px, -50%);
  }
</style>
