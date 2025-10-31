<script>
  import MobileTopNav from './MobileTopNavDropDown.svelte';
  import { createEventDispatcher, onMount, getContext } from 'svelte';
  import { LuigiConfig, LuigiI18N } from '../core-api';
  import { Routing } from '../services/routing';
  import { StateHelpers, NavigationHelpers, RoutingHelpers } from '../utilities/helpers';

  const dispatch = createEventDispatcher();

  export let productSwitcherItems;
  export let isMobile;
  export let config;
  export let dropDownStates;

  let store = getContext('store');
  let getUnsavedChangesModalPromise = getContext('getUnsavedChangesModalPromise');
  let columnsClass;
  export let addNavHrefForAnchor;

  onMount(async () => {
    StateHelpers.doOnStoreChange(store, async () => {
      config = NavigationHelpers.getProductSwitcherConfig();
      if (config) {
        productSwitcherItems = await LuigiConfig.getConfigValueAsync('navigation.productSwitcher.items');
        setColumnsClass();
      }
      setViewportHeightVariable();
    }, ['navigation.productSwitcher']);
  });

  // [svelte-upgrade suggestion]
  // review these functions and remove unnecessary 'export' keywords
  export function onActionClick(productSwitcherItem) {
    getUnsavedChangesModalPromise().then(
      () => {
        Routing.navigateToLink(productSwitcherItem);
      },
      () => {}
    );
    toggleDropdownState();
  }

  export function onActionClickExternal(event) {
    onActionClick(event.detail);
  }

  export function toggleDropdownState() {
    dispatch('toggleDropdownState');
  }

  export function setViewportHeightVariable() {
    // get the viewport height and multiple it by 1% to get a value for a vh unit
    let vh = window.innerHeight * 0.01;
    // set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  function getSapIconStr(iconString) {
    return NavigationHelpers.renderIconClassName(iconString);
  }

  function hasOpenUIicon(node) {
    return NavigationHelpers.isOpenUIiconName(node.icon);
  }

  function getNodeLabel(node) {
    return LuigiI18N.getTranslation(node.label);
  }

  function getNodeSubtitle(node) {
    return LuigiI18N.getTranslation(node.subTitle);
  }

  function setColumnsClass() {
    const columns = NavigationHelpers.getProductSwitcherColumnsNumber();
    if (columns === 3) {
      columnsClass = 'fd-product-switch__body fd-product-switch__body--col-3';
    } else {
      columnsClass = 'fd-product-switch__body';
    }
  }

  function getTestId(node) {
    return node.testId ? node.testId : NavigationHelpers.prepareForTests(node.label);
  }

  function getRouteLink(node) {
    return RoutingHelpers.getNodeHref(node);
  }
</script>

<svelte:window on:resize={setViewportHeightVariable} />
{#if productSwitcherItems && productSwitcherItems.length && Object.keys(productSwitcherItems[0]).length}
  <!-- DESKTOP VERSION (popover): -->
  {#if !isMobile}
    <div class="fd-shellbar__action fd-shellbar__action--desktop">
      <div class="fd-product-switch">
        <div class="fd-popover fd-popover--right">
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div class="fd-popover__control" role="presentation" on:click|stopPropagation={() => {}}>
            <button
              class="fd-button fd-button--transparent fd-shellbar__button fd-product-switch__control"
              aria-expanded={dropDownStates.productSwitcherPopover || false}
              aria-haspopup="true"
              on:click|stopPropagation={toggleDropdownState}
              title={config.label}
              data-testid={getTestId(config)}
            >
              {#if hasOpenUIicon(config)}
                <!-- default: sap-icon--grid -->
                <i class="sap-icon {getSapIconStr(config.icon)}" />
              {:else}
                <img src={config.icon} alt={config.altText ? config.altText : ''} />
              {/if}
            </button>
          </div>
          <div
            class="fd-popover__body fd-popover__body--right"
            aria-hidden={!(dropDownStates.productSwitcherPopover || false)}
            id="productSwitcherPopover"
          >
            <div class={columnsClass}>
              <ul class="fd-product-switch__list">
                {#each productSwitcherItems as productSwitcherItem}
                  {#if productSwitcherItem.label}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <li
                      class="fd-product-switch__item {productSwitcherItem.selected ? 'selected' : ''}"
                      role="presentation"
                      on:click={() => onActionClick(productSwitcherItem)}
                      data-testid={getTestId(productSwitcherItem)}
                    >
                      {#if addNavHrefForAnchor}
                        <a
                          href={getRouteLink(productSwitcherItem)}
                          on:click={(event) => {
                            NavigationHelpers.handleNavAnchorClickedWithoutMetaKey(event);
                          }}
                          class="fd-menu__link"
                        >
                          <div class="lui-product-switch__icon fd-product-switch__icon sap-icon">
                            {#if hasOpenUIicon(productSwitcherItem)}
                              <i
                                class="sap-icon {productSwitcherItem.icon && hasOpenUIicon(productSwitcherItem)
                                  ? getSapIconStr(productSwitcherItem.icon)
                                  : ''}"
                              />
                            {:else}
                              <img
                                src={productSwitcherItem.icon}
                                alt={productSwitcherItem.altText ? productSwitcherItem.altText : ''}
                              />
                            {/if}
                          </div>
                          <div class="fd-product-switch__text">
                            <div class="fd-product-switch__title">{getNodeLabel(productSwitcherItem)}</div>
                            {#if getNodeSubtitle(productSwitcherItem)}
                              <div class="fd-product-switch__subtitle">{getNodeSubtitle(productSwitcherItem)}</div>
                            {/if}
                          </div>
                        </a>
                      {:else}
                        <div class="lui-product-switch__icon fd-product-switch__icon sap-icon">
                          {#if hasOpenUIicon(productSwitcherItem)}
                            <i
                              class="sap-icon {productSwitcherItem.icon && hasOpenUIicon(productSwitcherItem)
                                ? getSapIconStr(productSwitcherItem.icon)
                                : ''}"
                            />
                          {:else}
                            <img
                              src={productSwitcherItem.icon}
                              alt={productSwitcherItem.altText ? productSwitcherItem.altText : ''}
                            />
                          {/if}
                        </div>
                        <div class="fd-product-switch__text">
                          <div class="fd-product-switch__title">{getNodeLabel(productSwitcherItem)}</div>
                          {#if getNodeSubtitle(productSwitcherItem)}
                            <div class="fd-product-switch__subtitle">{getNodeSubtitle(productSwitcherItem)}</div>
                          {/if}
                        </div>
                      {/if}
                    </li>
                  {/if}
                {/each}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
  <!-- MOBILE VERSION (fullscreen modal): -->
  {#if isMobile && dropDownStates.productSwitcherPopover}
    <MobileTopNav
      on:click={toggleDropdownState}
      on:listClick={onActionClickExternal}
      nodes={productSwitcherItems}
      label={config.label}
      {hasOpenUIicon}
      {getNodeLabel}
      {getNodeSubtitle}
    />
  {/if}
{/if}

<style lang="scss">
  .lui-product-switch__icon {
    img {
      max-height: 24px;
    }
    [class*='sap-icon'] {
      color: var(--sapShell_InteractiveTextColor, #d1e8ff);
    }
  }

  .fd-product-switch__item .fd-menu__link {
    display: block;
  }
</style>
