<script>
  export let node;
  const STATUS = ['negative', 'positive', 'critical', 'informative'];
  const statusType = node && node.statusBadge && node.statusBadge.type;
  const type = STATUS.includes(statusType) ? statusType : 'none';
</script>

{#if node.statusBadge && node.statusBadge.label}
  <span class="fd-object-status fd-object-status--{type} fd-object-status--inverted">
    <span class="fd-object-status__text">{node.statusBadge.label}</span>
    <span class="fd-object-status__sr-only">Object Status</span>
  </span>
{/if}

<style lang="scss">
  .fd-object-status {
    word-break: keep-all;
  }
</style>
