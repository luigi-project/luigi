<script>
  import { beforeUpdate, createEventDispatcher, onMount, getContext } from 'svelte';
  import { LuigiConfig, LuigiI18N } from '../core-api';
  import { NavigationHelpers, RoutingHelpers, StateHelpers, GenericHelpers } from '../utilities/helpers';

  const dispatch = createEventDispatcher();

  export let pathData;
  let previousPathData;
  export let pathParams;
  export let children;
  export let selectedNode;

  let store = getContext('store');
  let getTranslation = getContext('getTranslation');

  export let showGlobalNav;
  export let hideNavComponent;
  export let responsiveNavSetting;
  let addNavHrefForAnchor = LuigiConfig.getConfigBooleanValue('navigation.addNavHrefs');

  const setTopNavData = async () => {
    if (pathData && 0 < pathData.length) {
      const tnd = await NavigationHelpers.generateTopNavNodes(pathData);
      children = tnd.children;
      selectedNode = tnd.selectedNode;
      previousPathData = pathData;
    }
  };

  onMount(() => {
    StateHelpers.doOnStoreChange(store, () => {
      hideNavComponent = LuigiConfig.getConfigBooleanValue('settings.hideNavigation');
      responsiveNavSetting = LuigiConfig.getConfigValue('settings.responsiveNavigation');
      showGlobalNav =
        LuigiConfig.getConfigValue('settings.sideNav.style') !== 'vega' &&
        !(
          LuigiConfig.getConfigValue('settings.btpToolLayout') &&
          GenericHelpers.requestExperimentalFeature('btpToolLayout', false)
        ) &&
        LuigiConfig.getConfigBooleanValue('settings.globalSideNavigation') &&
        GenericHelpers.requestExperimentalFeature('globalNav', true);
      document.body.classList.toggle('lui-global-nav-visible', showGlobalNav);
    }, ['navigation']);
  });

  beforeUpdate(() => {
    if (!previousPathData || previousPathData != pathData) {
      setTopNavData();
    }
    addNavHrefForAnchor = LuigiConfig.getConfigBooleanValue('navigation.addNavHrefs');
  });

  function getSapIconStr(iconString) {
    return NavigationHelpers.renderIconClassName(iconString);
  }

  function hasOpenUIicon(node) {
    return NavigationHelpers.isOpenUIiconName(node.icon);
  }

  function getNodeLabel(node) {
    return LuigiI18N.getTranslation(node.label);
  }

  function getRouteLink(node) {
    return RoutingHelpers.getNodeHref(node, pathParams);
  }

  export function handleClick(node) {
    dispatch('handleClick', { node });
  }

  export function handleClickExternal(event) {
    handleClick(event.detail.node);
  }

  export function closeAllDropdowns() {
    // const ddStates = dropDownStates || {};
    // const keys = Object.keys(ddStates);
    // if (keys && keys.length > 0) {
    //   keys.forEach(k => {
    //     ddStates[k] = false;
    //     dropDownStates = ddStates;
    //   });
    // }
  }
</script>

<svelte:window on:click={closeAllDropdowns} on:blur={closeAllDropdowns} />
{#if showGlobalNav}
  <div class="lui-globalnav">
    <nav class="fd-side-nav fd-side-nav--condensed">
      <div class="fd-side-nav__main-navigation">
        {#if children && pathData.length >= 0}
          <ul class="fd-nested-list">
            {#each children as node, i}
              {#if node.globalNav === true && !node.separator}
                <li
                  class="fd-nested-list__item {node === selectedNode ? 'is-selected' : ''}"
                  data-testid={NavigationHelpers.getTestId(node)}
                >
                  <a
                    href={addNavHrefForAnchor ? getRouteLink(node) : undefined}
                    title={$getTranslation(node.label)}
                    on:click={(event) => {
                      NavigationHelpers.handleNavAnchorClickedWithoutMetaKey(event) && handleClick(node);
                    }}
                    tabindex="0"
                  >
                    <div class="lui-fd-nested-list__content">
                      {#if node.icon}
                        {#if hasOpenUIicon(node)}
                          <span class="lui-text fd-top-nav__icon {getSapIconStr(node.icon)}" />
                        {:else}
                          <img
                            class="fd-top-nav__icon nav-icon"
                            src={node.icon}
                            alt={node.altText ? node.altText : ''}
                          />
                        {/if}
                        <!-- end hasOpenUIicon-->
                      {/if}
                      <!-- end node.icon -->
                      <div class="lui-text">{getNodeLabel(node)}</div>
                      <div class="lui-indicator" />
                    </div>
                  </a>
                </li>
              {/if}
            {/each}
          </ul>
        {/if}
      </div>
      <div class="fd-side-nav__utility" aria-label="Utility Menu">
        {#if children && pathData.length >= 0}
          <ul class="fd-nested-list">
            {#each children as node, i}
              {#if node.globalNav === 'bottom' && !node.separator}
                <li
                  class="fd-nested-list__item {node === selectedNode ? 'is-selected' : ''}"
                  data-testid={NavigationHelpers.getTestId(node)}
                >
                  <a href={addNavHrefForAnchor ? getRouteLink(node) : undefined} title={$getTranslation(node.label)}>
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <div
                      class="lui-fd-nested-list__content"
                      role="presentation"
                      on:click|preventDefault={() => handleClick(node)}
                    >
                      {#if node.icon}
                        {#if hasOpenUIicon(node)}
                          <span class="lui-text fd-top-nav__icon {getSapIconStr(node.icon)}" />
                        {:else}
                          <img
                            class="fd-top-nav__icon nav-icon"
                            src={node.icon}
                            alt={node.altText ? node.altText : ''}
                          />
                        {/if}
                        <!-- end hasOpenUIicon-->
                      {/if}
                      <!-- end node.icon -->
                      <div class="lui-text">{getNodeLabel(node)}</div>
                      <div class="lui-indicator" />
                    </div>
                  </a>
                </li>
              {/if}
            {/each}
          </ul>
        {/if}
      </div>
    </nav>
  </div>
{/if}

<style lang="scss">
  .lui-globalnav {
    position: fixed;
    width: $globalNavWidth;
    top: calc(#{$topNavHeight} - 2px);
    bottom: 0;
    left: 0;
    background: var(--sapShellColor, #354a5f);
    display: block;

    nav {
      bottom: 0;
      position: absolute;
      top: 1px;
      width: 100%;
      overflow: auto;
      background: var(--sapShellColor, #354a5f);
      border-right: 1px solid var(--sapList_GroupHeaderBorderColor, #d9d9d9);

      &::-webkit-scrollbar {
        width: 0; /* chrome, safari */
      }
      scrollbar-width: none; /* Firefox */

      .fd-side-nav__utility {
        margin-top: 0;
      }
      .fd-side-nav__utility:before {
        display: none;
      }
    }

    .lui-indicator {
      display: none;
      position: absolute;
      left: 0;
      width: 3px;
      border-right: 2px solid var(--sapShell_TextColor, #fff);
      top: 5px;
      bottom: 5px;
    }

    .fd-nested-list {
      border-bottom: none;
    }

    .fd-nested-list__item {
      background: var(--sapShellColor, #354a5f);
      color: var(--sapShell_TextColor, #fff);
      height: 57px;
      text-align: center;
      cursor: pointer;
      font-size: 10px;
    }
    .lui-fd-nested-list__content {
      padding-top: 0.5rem;
      position: relative;
      height: 100%;
    }
    .fd-nested-list__item.is-selected {
      background: var(--sapShell_Active_Background, #354a5f);

      .lui-indicator {
        display: block;
      }
    }
    .fd-nested-list__item:hover {
      background: var(--sapShell_Hover_Background, #354a5f);
    }

    .fd-nested-list__item .lui-text {
      color: var(--sapShell_TextColor, #fff);
    }
    .fd-nested-list__item .fd-top-nav__icon {
      font-size: 1.1rem;
    }

    .fd-toolbar__separator {
      height: 1px;
      width: 33px;
      display: block;
      margin-left: 5px;
      margin-bottom: 2px;
    }

    /*disable default red/purple outline*/
    .fd-nested-list__item a {
      text-decoration: none;
      display: block;
      height: 100%;
      &:focus {
        outline: var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--fdShellbar_Button_Outline_Color);
        outline-offset: -0.325rem;
      }
    }
  }
</style>
