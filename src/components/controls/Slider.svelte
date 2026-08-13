<script lang="ts">
  interface Props {
    value: number;
    min?: number;
    max?: number;
    step?: number;
    label: string;
    display?: string;
  }

  let {
    value = $bindable(),
    min = 0,
    max = 100,
    step = 1,
    label,
    display,
  }: Props = $props();

  const percent = $derived(((value - min) / (max - min)) * 100);
</script>

<div class="slider">
  <input
    type="range"
    aria-label={label}
    {min}
    {max}
    {step}
    bind:value
    style="--percent: {percent}%"
  />
  <span class="value">{display ?? value}</span>
</div>

<style>
  .slider {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
  }

  input {
    flex: 1;
    min-width: 90px;
    appearance: none;
    height: 18px;
    background: none;
    cursor: pointer;
  }

  input::-webkit-slider-runnable-track {
    height: 3px;
    border-radius: 999px;
    background: linear-gradient(
      to right,
      var(--accent) var(--percent),
      var(--line) var(--percent)
    );
  }

  input::-webkit-slider-thumb {
    appearance: none;
    width: 13px;
    height: 13px;
    margin-top: -5px;
    border-radius: 50%;
    background: var(--bg-tint);
    border: 1px solid var(--line);
    box-shadow: var(--shadow);
    transition: transform var(--dur) var(--ease);
  }

  input:active::-webkit-slider-thumb {
    transform: scale(1.15);
  }

  .value {
    flex: none;
    width: 38px;
    text-align: right;
    font-size: 11.5px;
    font-variant-numeric: tabular-nums;
    color: var(--text-faint);
  }
</style>
