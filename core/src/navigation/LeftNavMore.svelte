<script>
  import { NavigationHelpers } from '../utilities/helpers';

  export let collapsedMode;
  export let label;
  export let icon;
  export let expanded = true;
</script>

{#if collapsedMode}
  <li class="lui-spacer" role="presentation" aria-hidden="true" />
  <li class="fd-navigation-list__item fd-popover lui-more" role="none" style="display: none">
    <a
      class="fd-navigation-list__content is-selected fd-popover__control"
      role="menuitemradio"
      aria-label="Nav Item"
      aria-checked="true"
      tabindex="0"
      aria-expanded="true"
      aria-controls="sideNavPopover2"
      aria-haspopup="menu"
      onclick="onPopoverClick('sideNavPopover2');"
    >
      <div class="fd-navigation-list__content-container">
        <span class="fd-navigation-list__icon">
          <i class=" sap-icon--overflow" role="presentation"></i>
        </span>
      </div>
    </a>
    <div
      class="fd-navigation-list__popover-body fd-popover__body fd-popover__body--after
        fd-popover__body--bottom fd-popover__body--arrow-left fd-popover__body--arrow-y-bottom"
      role="dialog"
    >
      <ul class="fd-popover__wrapper fd-navigation-list level-1" role="menu"></ul>
    </div>
  </li>
{/if}

<style lang="scss">
  .lui-spacer {
    flex-grow: 1;
  }

  .lui-more > .fd-popover__body {
    max-height: 90vh;
    overflow: auto;

    & > ul {
      overflow: visible;
    }
  }
</style>
