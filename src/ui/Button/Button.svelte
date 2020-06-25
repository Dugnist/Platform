<script>
  import Button from "svelte-atoms/Button.svelte";
</script>

<style>
  :global(.Button) {
    background: #000;
  }
</style>

<Button iconLeft="favorite-fill" class="Button">
  <slot />
</Button>
