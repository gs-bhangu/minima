<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    children: Snippet;
  }

  let { title, children }: Props = $props();
</script>

<section class="group">
  <h3 class="eyebrow">{title}</h3>
  <div class="body">{@render children()}</div>
</section>

<style>
  .group {
    padding: 18px 0;
    border-top: 1px solid var(--line);
  }

  .group:first-child {
    border-top: 0;
    padding-top: 4px;
  }

  .eyebrow {
    margin-bottom: 4px;
  }

  .body {
    display: flex;
    flex-direction: column;
  }
</style>
