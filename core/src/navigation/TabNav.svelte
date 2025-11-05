<script>
  import { afterUpdate, beforeUpdate, createEventDispatcher, getContext, onDestroy, onMount } from 'svelte';
  import { LuigiConfig } from '../core-api';
  import { GenericHelpers, NavigationHelpers, RoutingHelpers, StateHelpers } from '../utilities/helpers';
  import StatusBadge from './StatusBadge.svelte';
  import TabHeader from './TabHeader.svelte';
  import { Navigation } from './services/navigation';

  export let children;
  export let pathData;
  export let pathParams;
  export let hideNavComponent;
  export let virtualGroupPrefix = NavigationHelpers.virtualGroupPrefix;
  export let selectedNodeForTabNav;
  export let dropDownStates = {};
  export let isMoreBtnExpanded = false;
  export let resizeTabNavToggle;

  let selectedNode;
  let previousPathData;
  let previousResizeTabNavToggle;
  let getTranslation = getContext('getTranslation');
  let store = getContext('store');
  let resizeObserver;
  let tabsContainer;
  let tabsContainerHeader;
  let moreButton;
  let moreLink;
  let isBtpToolLayoutActive;
  let unSubscribeFn;

  //TODO refactor
  const __this = {
    get: () => ({
      children,
      pathData,
      hideNavComponent,
      virtualGroupPrefix,
      selectedNode,
      selectedNodeForTabNav,
      dropDownStates,
      isMoreBtnExpanded
    }),
    set: (obj) => {
      if (obj) {
        Object.getOwnPropertyNames(obj).forEach((prop) => {
          if (prop === 'pathData') {
            pathData = obj.pathData;
          } else if (prop === 'context') {
            context = obj.context;
          } else if (prop === 'children') {
            children = obj.children;
          } else if (prop === 'selectedNode') {
            selectedNode = obj.selectedNode;
          } else if (prop === 'selectedNodeForTabNav') {
            selectedNodeForTabNav = obj.selectedNodeForTabNav;
          }
        });
      }
    }
  };

  const dispatch = createEventDispatcher();

  function getNodeLabel(node) {
    return NavigationHelpers.getNodeLabel(node);
  }

  const setTabNavData = async () => {
    const componentData = __this.get();
    const tabNavData = await Navigation.getTabNavData({ ...componentData }, componentData);
    if (!tabNavData) {
      return;
    }
    __this.set({ ...tabNavData });
    previousPathData = pathData;
    window['LEFTNAVDATA'] = tabNavData.groupedChildren;
    setTimeout(calcTabsContainer);
  };

  /**
   * Adjusts the visibility of tab elements based on available space in the tabs container.
   * Hides overflowing tabs and shows a 'more' button if necessary.
   */
  const calcTabsContainer = () => {
    // Clear the tab navigation
    clearTabNav();

    // Check if necessary elements exist
    if (tabsContainerHeader && moreButton && moreLink) {
      // Reset 'more' link to inactive state
      moreLink.classList.remove('is-active');

      // Calculate available space for tab items
      const tabsContainerHeaderStyles = getComputedStyle(tabsContainerHeader);
      const availableSpaceForTabItems =
        tabsContainerHeader.offsetWidth -
        moreButton.offsetWidth -
        parseFloat(tabsContainerHeaderStyles.paddingLeft) -
        parseFloat(tabsContainerHeaderStyles.paddingRight);

      // Initialize variables
      let totalTabsSize = 0;
      let hasMoreBtnElements = false;

      // Iterate through tab elements
      [...tabsContainerHeader.children].forEach((tabElement) => {
        // Get unique identifier for the tab
        const uid = tabElement.getAttribute('uid');
        if (!uid) {
          return; // Skip if no UID
        }

        // Calculate total width of tab including margins
        const style = getComputedStyle(tabElement);
        const margin = parseFloat(style.marginLeft) + parseFloat(style.marginRight);
        totalTabsSize += tabElement.offsetWidth + margin;

        // Check if tab overflows available space
        if (totalTabsSize >= availableSpaceForTabItems) {
          tabElement.classList.add('hide_element');
          // Check if hidden tab is selected, show 'more' link
          if (tabElement.getAttribute('isSelected') === 'true') {
            moreLink.classList.add('is-active');
          }
          // Show tab in 'more' dropdown
          document.querySelector('li[uid="' + uid + '"]').classList.remove('hide_element');
          hasMoreBtnElements = true;
        } else {
          // Hide tab from 'more' dropdown
          document.querySelector('li[uid="' + uid + '"]')?.classList.add('hide_element');
        }
      });

      // Show/hide 'more' button based on presence of overflow tabs
      hasMoreBtnElements ? moreButton.classList.remove('hide_element') : moreButton.classList.add('hide_element');
    }
  };

  /**
   * Clears the tab navigation by removing the 'hide_element' class from all tab elements.
   */
  const clearTabNav = () => {
    // Check if tabs container header exists
    if (tabsContainerHeader) {
      // Get all tab elements
      const tabs = [...tabsContainerHeader.children];

      // Remove 'hide_element' class from each tab element
      tabs.forEach((element) => {
        element.classList.remove('hide_element');
      });
    }
  };

  /**
   * This function attaches on Svelte's ResizeObserver to detect the height of the component so that the 'top' distance property
   * is changed according to the variable horizontal tabnav web component height.
   */
  const handleHorizontalNavHeightChange = () => {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        document.documentElement.style.setProperty(
          '--luigi__horizontal-nav--live-height',
          entry.contentRect.height + 'px'
        );
      }
      if (isBtpToolLayoutActive) renderPopoverRightSide();
    });
    setTimeout(() => {
      if (tabsContainer) {
        resizeObserver.observe(tabsContainer);
      }
    });
  };

  /**
   * This function resets ResizeObserver's affected property to 0 and it is used to reset the state upon destroying of the TabNav component.
   */
  const resetResizeObserver = () => {
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
  };

  onMount(() => {
    hideNavComponent = LuigiConfig.getConfigBooleanValue('settings.hideNavigation');
    isBtpToolLayoutActive =
      LuigiConfig.getConfigBooleanValue('settings.btpToolLayout') &&
      LuigiConfig.getConfigBooleanValue('settings.experimental.btpToolLayout');
    handleHorizontalNavHeightChange();
    unSubscribeFn = StateHelpers.doOnStoreChange(store, () => {
      setTabNavData();
    }, ['navigation.viewgroupdata']);
  });

  onDestroy(() => {
    resetResizeObserver();
    document.documentElement.style.removeProperty('--luigi__horizontal-nav--live-height');
    unSubscribeFn();
  });

  // [svelte-upgrade warning]
  // beforeUpdate and afterUpdate handlers behave
  // differently to their v2 counterparts
  beforeUpdate(() => {
    if (!previousPathData || previousPathData != pathData) {
      setTabNavData();
    }
    if (previousResizeTabNavToggle === undefined || previousResizeTabNavToggle !== resizeTabNavToggle) {
      previousResizeTabNavToggle = resizeTabNavToggle;
      setTabNavData();
    }
  });

  afterUpdate(() => {
    resetResizeObserver();
    if (!resizeObserver) {
      handleHorizontalNavHeightChange();
    } else {
      setTimeout(() => {
        if (tabsContainer) {
          resizeObserver.observe(tabsContainer);
        }
      });
    }
  });

  function isOpenUIiconName(name) {
    return NavigationHelpers.isOpenUIiconName(name);
  }

  function isExpanded(nodes, expandedList) {
    return expandedList && expandedList.indexOf(nodes.metaInfo.categoryUid) >= 0;
  }

  function isSelectedCat(key, selectedNodeForTabNav) {
    return (
      selectedNodeForTabNav &&
      selectedNodeForTabNav.category &&
      (selectedNodeForTabNav.category === key || selectedNodeForTabNav.category.label === key)
    );
  }

  function getRouteLink(node) {
    return RoutingHelpers.getNodeHref(node, pathParams);
  }

  // [svelte-upgrade suggestion]
  // review these functions and remove unnecessary 'export' keywords
  export function handleClick(node) {
    closeAllDropdowns();
    dispatch('handleClick', { node });
  }

  export function toggleDropdownState(name) {
    let ddnStates = {};
    if (!dropDownStates[name]) {
      ddnStates[name] = true;
    }
    dropDownStates = ddnStates;
  }

  export function closeAllDropdowns() {
    dropDownStates = {};
    isMoreBtnExpanded = false;
  }

  export function onResize() {
    clearTabNav();
    calcTabsContainer();
  }
  export function toggleMoreBtn() {
    isMoreBtnExpanded = !isMoreBtnExpanded;
  }

  /**
   * Checks if the provided key corresponds to a single tab item.
   * Info: Nodes are grouped in Category or non - category groups for the tab nav logic.
   * A Category node group object usually has the Category Name as a key
   * A non-Category node usually would have an undefined key or a virtualGroupPrefix
   * @param {string} key - The key to check.
   * @returns {boolean} Returns true if the key is 'undefined' or starts with the virtualGroupPrefix; otherwise, returns false.
   */
  function isSingleTabItem(key, nodes) {
    const isKeyUndefined = key === 'undefined';
    const isVirtualGroupPrefix = key.indexOf(virtualGroupPrefix) === 0;
    if (isKeyUndefined || isVirtualGroupPrefix) {
      return true;
    }
    if (isHiddenAndOnlySubCategoryNode(nodes)) {
      return true;
    }
  }

  /**
   * Checks if any of the nodes is a tab item with sub-items.
   * @param {Array<Object>} nodes - An array of nodes to check.
   * @returns {boolean} Returns true if any node has a label and is not hidden from navigation; otherwise, returns false.
   */
  function isTabItemWithSubItems(nodes) {
    return nodes.some((node) => !node.hideFromNav && node.label);
  }

  /**
   * Checks if for the given nodes list there is a category that has a subcategory node which is hidden.
   * In this case the category node should be shown as a single tab item and not a category on the tabnav view
   * @param nodes list of nodes to check in the same level
   * @returns {boolean} true if only one hidden item found.
   */
  function isHiddenAndOnlySubCategoryNode(nodes) {
    // reference node = a subcategory node
    const referenceNode = nodes.find((node) => GenericHelpers.isObject(node.category));
    if (!referenceNode) {
      return;
    }
    const referenceCategoryName = referenceNode.category.label || referenceNode.category.id;

    const isOnlyOtherCategoryNodeHidden =
      nodes.filter((node) => node.category === referenceCategoryName && node.hideFromNav === true).length === 1;

    return isOnlyOtherCategoryNodeHidden;
  }

  /**
   * Finds the node in the provided array of nodes to navigate to based on the category's navigateOnClick property.
   * Search based on navigateOnClick set to true or a string representing the desired pathSegment to navigate to.
   * @param {Array<Object>} nodes - An array of nodes to search.
   * @returns {Object|undefined} Returns the first node with a truthy navigateOnClick property, or undefined if not found.
   */
  function getNodeToNavigateTo(nodes) {
    const referenceNode = nodes.find((node) => node.category?.navigateOnClick);
    if (!referenceNode) {
      return;
    }
    const navigateOnClick = referenceNode.category.navigateOnClick;
    if (navigateOnClick === true) {
      return referenceNode;
    }
    // return node which has same pathSegment as the navigateOnClick value
    return nodes.find((node) => node.pathSegment === navigateOnClick);
  }

  /**
   * Checks if any of the nodes is a tab item with multiple clickable areas.
   * @param {Array<Object>} nodes - An array of nodes to check.
   * @returns {boolean} Returns true if any node has a category with a truthy navigateOnClick property; otherwise, returns false.
   */
  function isMultiClickAreaTabItem(nodes) {
    return !!getNodeToNavigateTo(nodes);
  }

  /**
   * Checks if the popover element has enough space to the right side to see the whole content of the popover.
   * @param popoverElement
   */
  function hasSpaceOnRight(popoverElement) {
    if (!popoverElement) return;
    const rect = popoverElement.getBoundingClientRect();

    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const popoverRightEdge = rect.left + rect.width;
    return popoverRightEdge <= viewportWidth;
  }

  /**
   * Add/remove class to render popover to the right side or not.
   */
  function renderPopoverRightSide() {
    const luigiTabsContainer = document.querySelectorAll(
      '.luigi-tabsContainerHeader .fd-icon-tab-bar__item--single-click .fd-popover__body'
    );
    luigiTabsContainer.forEach((child) => {
      child.classList.remove('fd-popover__body--right');
      if (!hasSpaceOnRight(child)) {
        child.classList.add('fd-popover__body--right');
      }
    });
  }
</script>

<svelte:window on:click={closeAllDropdowns} on:blur={closeAllDropdowns} on:resize={onResize} />
{#if children && pathData.length > 0 && (pathData[0].topNav === false || pathData.length > 1)}
  <div id="tabsContainer" bind:this={tabsContainer}>
    {#if selectedNode.parent && selectedNode.parent.tabNav && selectedNode.parent.tabNav.showAsTabHeader}
      <TabHeader node={selectedNode.parent} />
    {/if}
    <nav
      class="fd-icon-tab-bar fd-icon-tab-bar--lg"
      on:toggleDropdownState={(event) => toggleDropdownState(event.name)}
    >
      <div
        class="tabsContainerHeader luigi-tabsContainerHeader fd-icon-tab-bar__header"
        role="tablist"
        bind:this={tabsContainerHeader}
      >
        {#each Object.entries(children) as [key, nodes], index}
          {#if isSingleTabItem(key, nodes)}
            {#each nodes as node, index2}
              {#if !node.hideFromNav}
                {#if node.label}
                  <!-- prettier-ignore -->
                  {@const isSelected = node === selectedNodeForTabNav}
                  <span role="presentation" class="fd-icon-tab-bar__item" uid="{index}-{index2}" {isSelected}>
                    <a
                      role="tab"
                      tabindex="0"
                      class="fd-icon-tab-bar__tab"
                      href={getRouteLink(node)}
                      data-testid={NavigationHelpers.getTestId(node)}
                      aria-selected={isSelected}
                      on:click|preventDefault={() => handleClick(node)}
                    >
                      <span class="fd-icon-tab-bar__tag">
                        {getNodeLabel(node)}
                        <StatusBadge {node} />
                      </span>
                    </a>
                  </span>
                {/if}
              {/if}
            {/each}
          {:else if isTabItemWithSubItems(nodes)}
            <!-- prettier-ignore -->
            {@const uid = `${index}-0`}
            <!-- prettier-ignore -->
            {@const popoverId = `lui-${uid}-popover`}

            {#if isMultiClickAreaTabItem(nodes)}
              <!-- prettier-ignore -->
              {@const nodeToNavigateTo = getNodeToNavigateTo(nodes)}
              <span
                {uid}
                role="presentation"
                class="fd-icon-tab-bar__item fd-icon-tab-bar__item--multi-click"
                on:click={(event) => event.stopPropagation()}
              >
                <!-- svelte-ignore a11y-missing-attribute -->
                <a
                  role="tab"
                  class="fd-icon-tab-bar__tab"
                  tabindex="0"
                  aria-selected={isSelectedCat(key, selectedNodeForTabNav)}
                  href={getRouteLink(nodeToNavigateTo)}
                  on:click|preventDefault={() => handleClick(nodeToNavigateTo)}
                >
                  <span class="fd-icon-tab-bar__tag">{$getTranslation(key)}</span>
                </a>
                <div class="fd-popover fd-icon-tab-bar__popover">
                  <div class="fd-popover__control">
                    <div class="fd-icon-tab-bar__button-container">
                      <button
                        class="fd-button fd-button--transparent fd-icon-tab-bar__button"
                        aria-controls={popoverId}
                        aria-expanded={!!dropDownStates[key]}
                        aria-haspopup="true"
                        aria-label="open menu button"
                        on:click|preventDefault={() => toggleDropdownState(key)}
                      >
                        <i class="sap-icon--slim-arrow-down" />
                      </button>
                    </div>
                  </div>
                  <div
                    class="fd-popover__body fd-popover__body--no-arrow {!isBtpToolLayoutActive
                      ? 'fd-popover__body--right'
                      : ''} fd-icon-tab-bar__popover-body"
                    aria-hidden={!dropDownStates[key]}
                    id={popoverId}
                  >
                    <ul class="fd-list fd-list--navigation fd-list--no-border fd-icon-tab-bar__list">
                      {#each nodes as node}
                        {#if !node.hideFromNav && node.label}
                          <li
                            tabindex="-1"
                            aria-level="1"
                            class="fd-list__item fd-list__item--link fd-icon-tab-bar__list-item"
                          >
                            <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
                            <!-- svelte-ignore a11y-missing-attribute -->
                            <a
                              role="tab"
                              tabindex="0"
                              class="fd-list__link fd-icon-tab-bar__list-link"
                              href={getRouteLink(node)}
                              aria-selected={node === selectedNodeForTabNav}
                              on:click|preventDefault={() => handleClick(node)}
                            >
                              <span class="fd-list__title">{getNodeLabel(node)}</span>
                            </a>
                          </li>
                        {/if}
                      {/each}
                    </ul>
                  </div>
                </div>
              </span>
            {:else}
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <span
                class="fd-icon-tab-bar__item fd-icon-tab-bar__item--single-click"
                {uid}
                role="tab"
                tabindex="-1"
                on:click={(event) => event.stopPropagation()}
                isSelected={isSelectedCat(key, selectedNodeForTabNav)}
              >
                <div class="fd-popover">
                  <div class="fd-popover__control">
                    <!-- svelte-ignore a11y-missing-attribute -->
                    <a
                      class="fd-icon-tab-bar__tab"
                      aria-expanded="false"
                      role="tab"
                      tabindex="0"
                      on:click|preventDefault={() => toggleDropdownState(key)}
                      on:keyup|preventDefault={(event) => {
                        (event.code === 'Enter' || event.code === 'Space') && toggleDropdownState(key);
                      }}
                      aria-selected={isSelectedCat(key, selectedNodeForTabNav)}
                    >
                      <div class="fd-icon-tab-bar__tab-container">
                        <span class="fd-icon-tab-bar__tag">{$getTranslation(key)}</span>
                        <span class="fd-icon-tab-bar__arrow">
                          <i class="sap-icon--slim-arrow-down" role="presentation" />
                        </span>
                      </div>
                    </a>
                  </div>
                  <div
                    class="fd-popover__body fd-popover__body--no-arrow {!isBtpToolLayoutActive
                      ? 'fd-popover__body--right'
                      : ''} fd-icon-tab-bar__popover-body"
                    aria-hidden={!dropDownStates[key]}
                  >
                    <ul class="fd-list fd-list--navigation fd-list--no-border fd-icon-tab-bar__list">
                      {#each nodes as node}
                        {#if !node.hideFromNav}
                          {#if node.label}
                            <li class="fd-list__item fd-list__item--link fd-icon-tab-bar__list-item">
                              <a
                                href={getRouteLink(node)}
                                class="fd-list__link fd-icon-tab-bar__list-link"
                                data-testid={NavigationHelpers.getTestId(node)}
                                on:click|preventDefault={() => handleClick(node)}
                                aria-selected={node === selectedNodeForTabNav}
                                role="tab"
                                tabindex="0"
                              >
                                <span class="fd-list__title">
                                  {getNodeLabel(node)}
                                  <StatusBadge {node} />
                                </span>
                              </a>
                            </li>
                          {/if}
                        {/if}
                      {/each}
                    </ul>
                  </div>
                </div>
              </span>
            {/if}
          {/if}
        {/each}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <span
          class="luigi-tabsMoreButton fd-icon-tab-bar__item fd-icon-tab-bar__item--overflow"
          on:click={(event) => event.stopPropagation()}
          role="button"
          tabindex="-1"
          bind:this={moreButton}
        >
          <div class="fd-popover">
            <!-- svelte-ignore a11y-missing-attribute -->
            <div class="fd-popover__control has-child luigi__more" role="presentation">
              <button class="fd-icon-tab-bar__overflow" on:click|preventDefault={toggleMoreBtn} bind:this={moreLink}>
                <span class="label fd-icon-tab-bar__overflow-text">More</span>
                <span class="sap-icon--slim-arrow-down" />
              </button>
            </div>
            <div
              class="fd-popover__body fd-popover__body--no-arrow fd-popover__body--right fd-icon-tab-bar__popover-body"
              aria-hidden={!isMoreBtnExpanded}
            >
              <ul class="fd-nested-list fd-nested-list--compact fd-nested-list--text-only">
                {#each Object.entries(children) as [key, nodes], index}
                  {#if key === 'undefined' || key.indexOf(virtualGroupPrefix) === 0}
                    {#each nodes as node, index2}
                      <li class="fd-nested-list__item" uid="{index}-{index2}">
                        <!-- svelte-ignore a11y-role-supports-aria-props -->
                        <a
                          href={getRouteLink(node)}
                          class="fd-nested-list__link"
                          data-testid={NavigationHelpers.getTestId(node)}
                          on:click|preventDefault={() => handleClick(node)}
                          aria-selected={node === selectedNodeForTabNav}
                        >
                          <span class="fd-nested-list__title">
                            {getNodeLabel(node)}
                            <StatusBadge {node} />
                          </span>
                        </a>
                      </li>
                    {/each}
                  {:else}
                    <li class="fd-nested-list__item" uid="{index}-0">
                      <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
                      <div class="fd-nested-list__content has-child" tabindex="0">
                        <!-- svelte-ignore a11y-invalid-attribute -->
                        <!-- svelte-ignore a11y-role-supports-aria-props -->
                        <a
                          href="javascript:void(null)"
                          tabindex="-1"
                          class="fd-nested-list__link"
                          id="tabnav_list_level1_{index}"
                          aria-haspopup="true"
                          aria-expanded={dropDownStates[key + index]}
                          aria-selected={isSelectedCat(key, selectedNodeForTabNav)}
                          on:click|preventDefault={() => toggleDropdownState(key + index)}
                        >
                          <span class="fd-nested-list__title">{$getTranslation(key)}</span>
                        </a>
                        <button
                          class="fd-button fd-nested-list__button"
                          href="#"
                          tabindex="-1"
                          aria-label="Expand submenu"
                          aria-haspopup="true"
                          aria-expanded={dropDownStates[key + index]}
                          on:click|preventDefault={() => toggleDropdownState(key + index)}
                        >
                          <i
                            class={dropDownStates[key + index]
                              ? 'sap-icon--navigation-down-arrow'
                              : 'sap-icon--navigation-right-arrow'}
                            role="presentation"
                          />
                        </button>
                      </div>
                      <ul class="fd-nested-list level-2" aria-hidden={!dropDownStates[key + index]}>
                        {#each nodes as node}
                          {#if node.label}
                            <li class="fd-nested-list__item" aria-labelledby="tabnav_list_level1_{index}">
                              <!-- svelte-ignore a11y-role-supports-aria-props -->
                              <a
                                class="fd-nested-list__link"
                                href={getRouteLink(node)}
                                data-testid={NavigationHelpers.getTestId(node)}
                                on:click|preventDefault={() => handleClick(node)}
                                aria-selected={node === selectedNodeForTabNav}
                              >
                                <span class="fd-nested-list__title">
                                  {getNodeLabel(node)}
                                  <StatusBadge {node} />
                                </span>
                              </a>
                            </li>
                          {/if}
                        {/each}
                      </ul>
                    </li>
                  {/if}
                {/each}
              </ul>
            </div>
          </div>
        </span>
      </div>
    </nav>
  </div>
{/if}

<style lang="scss">
  .tabsContainerHeader {
    width: 100%;

    /** 
      This override fixes an issue in fd that causes the link of an item with multi-click area in the icon tab bar
      to "steal" the focus so that the button of that item is not clickable anymore. Issue found in fd-styles v 0.33.2. 
      The problematic style is:
          .fd-icon-tab-bar__tab:focus { z-index: 5; }
      This alone does not cause the issue but in combination with the fact that the link of the item has padding that stretches
      over the button. But the z-index seems to be the main issue.
     */
    .fd-icon-tab-bar__item.fd-icon-tab-bar__item--multi-click a.fd-icon-tab-bar__tab:focus {
      z-index: initial;
    }
  }

  .luigi-tabsMoreButton {
    .fd-popover__body {
      > .fd-nested-list {
        max-height: calc(100vh - 110px);
        overflow-y: auto !important;
        padding-top: 4px;
        padding-bottom: 4px;

        .fd-nested-list__item {
          &:last-child {
            .fd-nested-list__content {
              border-bottom: none;
            }
          }

          :global(.hide_element) {
            display: none;
          }
        }
        .fd-nested-list__title {
          display: inline-block;
          height: auto;
        }
      }
    }

    :global(.hide_element) {
      display: none;
    }
  }

  .lui-breadcrumb .luigi-tabsContainerHeader .fd-popover__body {
    max-height: calc(
      100vh - calc(
          var(--luigi__shellbar--height) + var(--luigi__breadcrumb--height) +
            var(--luigi__horizontal-nav--live-height, var(--luigi__horizontal-nav--height))
        )
    );
    overflow-y: auto;
  }

  .luigi-tabsContainerHeader .fd-popover__body {
    max-height: calc(
      100vh - calc(
          var(--luigi__shellbar--height) +
            var(--luigi__horizontal-nav--live-height, var(--luigi__horizontal-nav--height))
        )
    );
    overflow-y: auto;
  }

  :global(.fd-tool-layout .lui-main-content) {
    #tabsContainer {
      left: 0;
    }
  }

  #tabsContainer {
    right: 0;
    left: var(--luigi__left-sidenav--width);
    border: none;
    position: absolute;

    @media (max-width: 599px) {
      left: 0;
    }

    :global(.hide_element) {
      display: none;
    }
  }
</style>
