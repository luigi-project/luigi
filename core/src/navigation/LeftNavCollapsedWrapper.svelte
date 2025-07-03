<script>
  import { NavigationHelpers } from '../utilities/helpers';

  export let collapsedMode;
  export let label;
  export let icon;
  export let expanded = true;
</script>

{#if !collapsedMode}
  <slot />
{:else}
  <div
    class="fd-navigation-list__popover-body fd-popover__body fd-popover__body--after fd-popover__body--arrow-left"
    role="dialog"
    aria-hidden={!expanded}
  >
    <div class="fd-popover__wrapper">
      <div class="fd-navigation-list__item">
        <!-- svelte-ignore a11y-role-has-required-aria-props -->
        <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
        <!-- svelte-ignore a11y-missing-attribute -->
        <div class="fd-navigation-list__content" role="heading" tabindex="0">
          <div class="fd-navigation-list__content-container">
            {#if NavigationHelpers.isOpenUIiconName(icon)}
              <span class="fd-navigation-list__icon">
                <i class="{NavigationHelpers.renderIconClassName(icon)} " role="presentation"></i>
              </span>
            {:else}
              <span class="fd-navigation__icon" role="presentation" aria-hidden="true">
                <img src={icon} />
              </span>
            {/if}
            <span class="fd-navigation-list__text">{label}</span>
          </div>
        </div>
        <slot />
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  .fd-navigation-list__content {
    cursor: default;
  }

  .fd-popover__body[aria-hidden='true'] {
    display: none;
  }

  .fd-popover__body > .fd-popover__wrapper {
    max-height: calc(100vh - 1rem);
    overflow-y: auto;
  }

  .fd-popover__body::before,
  .fd-popover__body::after {
    transform: translateY(var(--lui-flyout-offset));
  }
</style>
