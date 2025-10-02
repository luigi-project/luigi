<script>
  export let node;
</script>

{#if node && node.badgeCounter}
  {#await node.badgeCounter.count() then count}
    {#if count > 0}
      <span
        class="fd-counter fd-counter--notification fd-shellbar__counter--notification"
        aria-label={node.badgeCounter.label}
      >
        {count}
      </span>
    {/if}
  {/await}
{/if}

<style lang="scss">
  :global(.fd-shellbar__button) {
    &>.fd-shellbar__counter--notification {
      position: absolute;
      transform: translate(50%, -50%);
    }
  }
  :global(.fd-shellbar__action) {
    .fd-shellbar__counter--notification {
      top: 0;
      color: var(--sapContent_BadgeTextColor, #fff);
    }

    :global(.fd-menu .fd-top-nav__icon) {
      position: relative;
      margin-right: 8px;
      min-width: 16px;
      min-height: 16px;
      display: inline-block;
      vertical-align: middle;

      .fd-shellbar__counter--notification {
        top: -8px;
      }
    }

    :global(.fd-product-switch__body--mobile) {
      :global(.lui-product-switch__icon) {
        position: relative;

        .fd-shellbar__counter--notification {
          top: -8px;
          right: 6px;
        }
      }
    }
  }

  :global(.fd-nested-list__link),
  :global(.fd-navigation__link) {
    .fd-counter--notification {
      transform: translate(0px, 0px) !important;
      margin-left: auto;
      min-width: 1.3rem;
      margin-right: -0.3rem;
    }
  }
  :global(.fd-navigation-list__content-container) {
    .fd-counter--notification {
      transform: translate(0px, 0px) !important;
      margin-left: 0.3rem;
      min-width: 1.3rem;
      margin-right: 0;
    }
  }
</style>
