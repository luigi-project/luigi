<script>
  import { NavigationHelpers } from '../utilities/helpers';

  export let collapsedMode;
  export let label;
  export let icon;
  export let expanded = true;
</script>

{#if collapsedMode}
  <li class="lui-spacer" role="presentation" aria-hidden="true" />
  <li class="fd-navigation-list__item fd-popover lui-more" role="none">
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
      id="sideNavPopover2"
      class="fd-navigation-list__popover-body fd-popover__body fd-popover__body--after
                          fd-popover__body--bottom fd-popover__body--arrow-left fd-popover__body--arrow-y-bottom"
      role="dialog"
    >
      <ul class="fd-popover__wrapper fd-navigation-list level-1" role="menu">
        <li class="fd-navigation-list__item">
          <a class="fd-navigation-list__content" role="menuitemradio" id="side-nav-item-4" tabindex="0">
            <div class="fd-navigation-list__content-container">
              <span class="fd-navigation-list__icon">
                <i class=" sap-icon--picture" role="presentation"></i>
              </span>
              <span class="fd-navigation-list__text">Nav Item</span>
            </div>
            <div class="fd-navigation-list__navigation-indicator" role="presentation" aria-hidden="true">
              <i class="sap-icon--navigation-down-arrow" role="presentation"></i>
            </div>
          </a>

          <ul class="fd-navigation-list level-2" role="menu" aria-labelledby="side-nav-item-4">
            <li class="fd-navigation-list__item" role="none">
              <a
                class="fd-navigation-list__content"
                role="menuitemradio"
                aria-label="Nav Item"
                aria-checked="false"
                tabindex="0"
              >
                <div class="fd-navigation-list__content-container">
                  <span class="fd-navigation-list__text">Child Item</span>
                </div>
              </a>
            </li>
            <li class="fd-navigation-list__item" role="none">
              <a
                class="fd-navigation-list__content is-selected"
                role="menuitemradio"
                aria-label="Nav Item"
                aria-checked="true"
                tabindex="0"
              >
                <div class="fd-navigation-list__content-container">
                  <span class="fd-navigation-list__text">Child Item</span>
                </div>
              </a>
            </li>
          </ul>
        </li>
        <li class="fd-navigation-list__item">
          <a class="fd-navigation-list__content" role="menuitemradio" tabindex="0">
            <div class="fd-navigation-list__content-container">
              <span class="fd-navigation-list__icon">
                <i class=" sap-icon--pie-chart" role="presentation"></i>
              </span>
              <span class="fd-navigation-list__text">Nav Item</span>
            </div>
          </a>
        </li>

        <li class="fd-navigation-list__item">
          <a class="fd-navigation-list__content" role="menuitemradio" tabindex="0">
            <div class="fd-navigation-list__content-container">
              <span class="fd-navigation-list__icon">
                <i class=" sap-icon--survey" role="presentation"></i>
              </span>
              <span class="fd-navigation-list__text">Nav Item</span>
            </div>
          </a>
        </li>
        <li class="fd-navigation-list__item">
          <a class="fd-navigation-list__content" role="menuitemradio" tabindex="0">
            <div class="fd-navigation-list__content-container">
              <span class="fd-navigation-list__icon">
                <i class=" sap-icon--task" role="presentation"></i>
              </span>
              <span class="fd-navigation-list__text">Nav Item</span>
            </div>
          </a>
        </li>
        <li class="fd-navigation-list__item">
          <a class="fd-navigation-list__content" role="menuitemradio" tabindex="0">
            <div class="fd-navigation-list__content-container">
              <span class="fd-navigation-list__icon">
                <i class=" sap-icon--account" role="presentation"></i>
              </span>
              <span class="fd-navigation-list__text">Nav Item</span>
            </div>
          </a>
        </li>
      </ul>
    </div>
  </li>
{/if}

<style lang="scss">
  .lui-spacer {
    flex-grow: 1;
  }
</style>
