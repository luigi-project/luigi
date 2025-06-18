<script>
  import LogoTitle from './LogoTitle.svelte';
  import BadgeCounter from './BadgeCounter.svelte';
  import Authorization from '../Authorization.svelte';
  import AuthorizationSimpleProfileMenu from '../AuthorizationSimpleProfileMenu.svelte';
  import AuthorizationVegaProfileMenu from '../AuthorizationVegaProfileMenu.svelte';
  import TopNavDropDown from '../TopNavDropDown.svelte';
  import ContextSwitcher from './ContextSwitcher.svelte';
  import ProductSwitcher from './ProductSwitcher.svelte';
  import GlobalSearch from './GlobalSearch.svelte';
  import GlobalSearchCentered from './GlobalSearchCentered.svelte';
  import TopNavNode from './TopNavNode.svelte';
  import { beforeUpdate, createEventDispatcher, onMount, getContext } from 'svelte';
  import { LuigiAuth, LuigiConfig, LuigiI18N } from '../core-api';
  import {
    AuthHelpers,
    NavigationHelpers,
    RoutingHelpers,
    StateHelpers,
    EventListenerHelpers,
    GenericHelpers
  } from '../utilities/helpers';
  import { SemiCollapsibleNavigation } from './services/semi-collapsed-navigation';

  const dispatch = createEventDispatcher();
  export let authorizationEnabled;
  export let autologinEnabled;
  export let isLoggedIn = false;
  export let hideSearchComponent;
  export let hideNavComponent;
  export let responsiveNavSetting;
  export let profileTypeSettings;
  export let showGlobalNav;
  export let pathData;
  let previousPathData;
  export let pathParams;
  export let dropDownStates = {};
  export let children;
  export let selectedNode;
  export let visibleNodeCount;
  export let globalNavNodeCount;
  export let totalBadgeNode;
  export let isProductSwitcherAvailable;
  export let productSwitcherConfig;
  export let openMobileDropDown;
  export let nodeForMobile;
  export let profileItemsAvailable;
  export let userInfo = {};
  export let globalSearchConfig;
  export let isGlobalSearchCentered;
  export let isSearchFieldVisible;
  export let inputElem;
  export let customSearchItemRendererSlot;
  export let displaySearchResult;
  export let searchResult;
  export let burgerTooltip;
  export let responsiveShellbarPadding;

  let store = getContext('store');
  let contextSwitcherToggle = false;
  let selectedLabel;
  let defaultLabelContextSwitcher;
  let contextSwitcherConfig = LuigiConfig.getConfigValue('navigation.contextSwitcher');
  export let addNavHrefForAnchor = LuigiConfig.getConfigBooleanValue('navigation.addNavHrefs');
  const setTopNavData = async () => {
    if (pathData && 0 < pathData.length) {
      const tnd = await NavigationHelpers.generateTopNavNodes(pathData);
      children = tnd.children;
      selectedNode = tnd.selectedNode;
      visibleNodeCount = tnd.visibleNodeCount;
      totalBadgeNode = tnd.totalBadgeNode;
      globalNavNodeCount = tnd.globalNavNodeCount;
      window.TOPNAVDATA = tnd.children;
      previousPathData = pathData;
    }
  };

  const setLoggedInState = () => {
    isLoggedIn = AuthHelpers.isLoggedIn();
  };

  onMount(() => {
    StateHelpers.doOnStoreChange(store, () => {
      authorizationEnabled = LuigiAuth.isAuthorizationEnabled();
      profileItemsAvailable = LuigiConfig.getConfigValue('navigation.profile');
      autologinEnabled = !Boolean(LuigiConfig.getConfigValue('auth.disableAutoLogin'));
      isProductSwitcherAvailable = LuigiConfig.getConfigValue('navigation.productSwitcher');
      hideNavComponent = LuigiConfig.getConfigBooleanValue('settings.hideNavigation');
      responsiveNavSetting = LuigiConfig.getConfigValue('settings.responsiveNavigation');
      profileTypeSettings = LuigiConfig.getConfigValue('settings.profileType');
      responsiveShellbarPadding = LuigiConfig.getConfigValue('settings.header.responsiveShellbarPaddings');
      productSwitcherConfig = NavigationHelpers.getProductSwitcherConfig();
      globalSearchConfig = LuigiConfig.getConfigValue('globalSearch');
      isGlobalSearchCentered =
        globalSearchConfig &&
        globalSearchConfig.searchFieldCentered &&
        GenericHelpers.requestExperimentalFeature('globalSearchCentered', true);
      showGlobalNav =
        LuigiConfig.getConfigBooleanValue('settings.globalSideNavigation') &&
        GenericHelpers.requestExperimentalFeature('globalNav', true);
      addNavHrefForAnchor = LuigiConfig.getConfigBooleanValue('navigation.addNavHrefs');
      contextSwitcherConfig = LuigiConfig.getConfigValue('navigation.contextSwitcher');
    }, ['navigation']);

    StateHelpers.doOnStoreChange(store, () => {
      setTopNavData();
    }, ['navigation.viewgroupdata']);

    EventListenerHelpers.addEventListener('message', (e) => {
      if ('luigi.navigation.update-badge-counters' === e.data.msg) {
        setTopNavData();
      }
    });
  });

  beforeUpdate(() => {
    if (!previousPathData || previousPathData != pathData) {
      setTopNavData();
    }
    setLoggedInState();
  });

  export let showTopNav;
  $: showTopNav = (authorizationEnabled && (!autologinEnabled || isLoggedIn)) || !authorizationEnabled;

  function getSapIconStr(iconString) {
    return NavigationHelpers.renderIconClassName(iconString);
  }

  function hasOpenUIicon(node) {
    return NavigationHelpers.isOpenUIiconName(node.icon);
  }

  const getNodeLabel = (node) => {
    return NavigationHelpers.getNodeLabel(node);
  };

  function getRouteLink(node) {
    return RoutingHelpers.getNodeHref(node, pathParams);
  }

  function resolveTooltipText(node, translation) {
    return NavigationHelpers.generateTooltipText(node, translation);
  }

  export function openMobileProductSwitcher() {
    toggleDropdownState('productSwitcherPopover');
  }

  export function openMobileContextSwitcher() {
    contextSwitcherToggle = !contextSwitcherToggle;
    toggleDropdownState('contextSwitcherPopover');
  }

  export function openMobileTopNavDropDown(node) {
    openMobileDropDown = true;
    nodeForMobile = node;
  }

  export function closeMobileTopNavDropDown() {
    openMobileDropDown = false;
  }

  export function handleClick(node) {
    dispatch('handleClick', { node });
  }

  export function handleSearchNavigation(node) {
    dispatch('handleSearchNavigation', { node });
  }

  export function handleClickExternal(event) {
    handleClick(event.detail.node);
  }

  export function toggleDropdownState(name) {
    const ddStates = dropDownStates || {};
    const dropDownState = !ddStates[name];

    closeAllDropdowns();
    closeMobileTopNavDropDown();
    ddStates[name] = dropDownState;

    dropDownStates = ddStates;
  }

  export function toggleDropdownStateExternal(event) {
    toggleDropdownState(event.detail.name);
  }

  function setFocusOnGlobalSearchFieldMobile() {
    if (inputElem) {
      inputElem.focus();
    }
  }

  export function toggleSearch() {
    if (!isSearchFieldVisible)
      setTimeout(() => {
        setFocusOnGlobalSearchFieldMobile();
      });
    dispatch('toggleSearch', {
      isSearchFieldVisible,
      inputElem,
      customSearchItemRendererSlot
    });
  }

  export function closeAllDropdowns() {
    const ddStates = dropDownStates || {};
    const keys = Object.keys(ddStates);
    if (keys && keys.length > 0) {
      keys.forEach((k) => {
        ddStates[k] = false;
        dropDownStates = ddStates;
      });
    }
  }

  function burgerClickHandler() {
    if (responsiveNavSetting === 'simple' || responsiveNavSetting === 'simpleMobileOnly') {
      simpleNav();
    } else {
      semicollapsedNav();
    }
    setBurgerTooltip();
  }

  function setBurgerTooltip() {
    if (!NavigationHelpers.getBurgerTooltipConfig()) {
      return;
    }
    const [collapseNavTooltip, expandNavTooltip] = NavigationHelpers.getBurgerTooltipConfig();
    if (collapseNavTooltip && expandNavTooltip) {
      if (document.body.classList.contains('lui-simpleSlideInNav')) {
        burgerTooltip = document.body.classList.contains('lui-leftNavToggle') ? collapseNavTooltip : expandNavTooltip;
      }
      if (document.body.classList.contains('lui-semiCollapsible')) {
        burgerTooltip = document.body.classList.contains('semiCollapsed') ? collapseNavTooltip : expandNavTooltip;
      }
    }
  }

  export function simpleNav() {
    document.body.classList.toggle('lui-leftNavToggle');
    if (document.getElementsByClassName('luigi-tabsContainerHeader').length > 0) {
      dispatch('resizeTabNav', {});
    }
  }

  export function semicollapsedNav() {
    SemiCollapsibleNavigation.buttonClicked();
    if (document.getElementsByClassName('luigi-tabsContainerHeader').length > 0) {
      dispatch('resizeTabNav', {});
    }
  }

  export function userInfoUpdate(event) {
    const uInfo = event.detail;
    userInfo = uInfo ? uInfo : {};
  }

  function handleToggleDropdownStateKeyEvent(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      toggleDropdownState(event.currentTarget.getAttribute('aria-controls'));
    }
  }
</script>

<svelte:window on:click={closeAllDropdowns} on:blur={closeAllDropdowns} />
{#if showTopNav}
  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
  <div
    class="fd-shellbar {responsiveShellbarPadding
      ? 'fd-shellbar--responsive-paddings'
      : ''} lui-shellbar-wrapper {hideNavComponent ? 'hideNavComponent' : ''}"
    tabindex="0"
  >
    <div class="fd-shellbar__group fd-shellbar__group--product">
      {#if responsiveNavSetting === 'simple' || responsiveNavSetting === 'simpleMobileOnly' || responsiveNavSetting === 'Fiori3'}
        <button
          class="fd-shellbar__button fd-button fd-button--transparent lui-burger"
          on:click={burgerClickHandler}
          tabindex="0"
          title={burgerTooltip}
          type="button"
        >
          <i class="sap-icon sap-icon--menu2" />
        </button>
      {/if}
      <LogoTitle
        {pathData}
        {pathParams}
        {addNavHrefForAnchor}
        bind:dropDownStates
        on:toggleDropdownState={toggleDropdownStateExternal}
        on:handleClick={handleClickExternal}
      />
    </div>
    {#if globalSearchConfig && isGlobalSearchCentered && !hideSearchComponent}
      <div class="lui-global-search">
        <GlobalSearchCentered
          {globalSearchConfig}
          bind:isSearchFieldVisible
          on:toggleSearch
          on:handleSearchNavigation
          bind:searchResult
          bind:displaySearchResult
          bind:inputElem
          bind:customSearchItemRendererSlot
          on:closeSearchResult
        />
      </div>
    {/if}
    <div class="fd-shellbar__group fd-shellbar__group--actions lui-shellbar_group--actions">
      {#if !authorizationEnabled || isLoggedIn}
        {#if globalSearchConfig && !isGlobalSearchCentered && !hideSearchComponent}
          <GlobalSearch
            bind:isSearchFieldVisible
            on:toggleSearch
            on:handleSearchNavigation
            bind:searchResult
            bind:displaySearchResult
            bind:inputElem
            bind:customSearchItemRendererSlot
            on:closeSearchResult
            {globalSearchConfig}
          />
        {/if}
        <ContextSwitcher
          bind:dropDownStates
          on:toggleDropdownState={() => toggleDropdownState('contextSwitcherPopover')}
          isMobile={false}
          {addNavHrefForAnchor}
        />
      {/if}
      {#if globalSearchConfig || (children && pathData.length > 0)}
        {#if children && pathData.length > 0}
          {#each children as node, i}
            {#if !(node.hideFromNav || (showGlobalNav && node.globalNav))}
              {#if node.isCat}
                {#if node.visibleChildren.filter((node) => !node.hideFromNav && node.label).length > 0}
                  <div class="fd-shellbar__action fd-shellbar__action--hide fd-shellbar__action--desktop">
                    <div class="fd-popover fd-popover--right">
                      <!-- svelte-ignore a11y-click-events-have-key-events -->
                      <!-- svelte-ignore a11y-no-static-element-interactions -->
                      <div class="fd-popover__control" on:click|stopPropagation={() => {}}>
                        <button
                          title={resolveTooltipText(node, getNodeLabel(node))}
                          class="fd-shellbar__button fd-button fd-button--transparent {node === selectedNode
                            ? 'is-selected'
                            : ''}"
                          aria-controls="dropDownPopover-{i}"
                          aria-expanded={dropDownStates[`dropDownPopover-${i}`] || false}
                          aria-haspopup="true"
                          on:click={() => toggleDropdownState(`dropDownPopover-${i}`)}
                          data-testid={NavigationHelpers.getTestId(node)}
                        >
                          <TopNavNode bind:node />
                          <BadgeCounter {node} />
                        </button>
                      </div>
                      <div
                        class="fd-popover__body fd-popover__body--right"
                        aria-hidden={!(dropDownStates[`dropDownPopover-${i}`] || false)}
                        id="dropDownPopover-{i}"
                      >
                        <TopNavDropDown {node} isMobile={false} {pathParams} {addNavHrefForAnchor} />
                      </div>
                    </div>
                  </div>
                {/if}
              {:else}
                <div class="fd-shellbar__action fd-shellbar__action--hide fd-shellbar__action--desktop">
                  {#if addNavHrefForAnchor}
                    {#if !node.separator}
                      <a
                        href={getRouteLink(node)}
                        class="fd-shellbar__button fd-button fd-button--transparent {node === selectedNode
                          ? 'is-selected'
                          : ''}"
                        title={resolveTooltipText(node, getNodeLabel(node))}
                        aria-expanded="false"
                        aria-haspopup="true"
                        on:click={(event) => {
                          NavigationHelpers.handleNavAnchorClickedWithoutMetaKey(event) && handleClick(node);
                        }}
                        data-testid={NavigationHelpers.getTestId(node)}
                      >
                        <TopNavNode bind:node />
                        <BadgeCounter {node} />
                      </a>
                    {:else}
                      <span class="fd-shellbar__button fd-button fd-button--transparent fd-separator" tabindex="-1"
                      ></span>
                    {/if}
                  {:else}
                    <button
                      title={resolveTooltipText(node, getNodeLabel(node))}
                      class="fd-shellbar__button fd-button fd-button--transparent {node === selectedNode
                        ? 'is-selected'
                        : ''}"
                      aria-expanded="false"
                      aria-haspopup="true"
                      on:click={() => handleClick(node)}
                      data-testid={NavigationHelpers.getTestId(node)}
                      type="button"
                    >
                      <TopNavNode bind:node />
                      <BadgeCounter {node} />
                    </button>
                  {/if}
                </div>
              {/if}
            {/if}
          {/each}
        {/if}
        <!-- Sample Markup for Notifications
            <div class="fd-shellbar__action fd-shellbar__action--desktop">
              <button class="fd-shellbar__button fd-button sap-icon--bell" aria-label="Notifications">
                <span class="fd-counter fd-counter--notification fd-shellbar__counter--notification" aria-label="Unread count">25</span>
              </button>
            </div>
    -->

        <!-- dropdown for top nav nodes on smaller screens -->
        {#if visibleNodeCount - globalNavNodeCount > 0 || isProductSwitcherAvailable || contextSwitcherConfig || globalSearchConfig}
          <div class="fd-shellbar__action fd-shellbar__action--mobile">
            <div class="fd-shellbar-collapse">
              <div class="fd-popover fd-popover--right">
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div class="fd-popover__control" on:click|stopPropagation={() => {}}>
                  <div class="fd-shellbar-collapse--control" aria-expanded="false" aria-haspopup="true" role="button">
                    <button
                      class="fd-shellbar__button fd-button fd-button--transparent"
                      aria-controls="overflowPopover"
                      aria-expanded={dropDownStates.overflowPopover || false}
                      aria-haspopup="true"
                      on:click={() => toggleDropdownState('overflowPopover')}
                      data-testid="mobile-menu"
                    >
                      <i class="sap-icon sap-icon--overflow" />
                      <BadgeCounter node={totalBadgeNode} special="true" />
                    </button>
                  </div>
                </div>
                <div
                  class="fd-popover__body fd-popover__body--right"
                  aria-hidden={!(dropDownStates.overflowPopover || false)}
                  id="overflowPopover"
                >
                  <nav class="fd-menu">
                    <ul class="fd-menu__list fd-menu__list--no-shadow">
                      {#if globalSearchConfig && !isGlobalSearchCentered && !hideSearchComponent}
                        <li class="fd-menu__item">
                          <!-- svelte-ignore a11y-click-events-have-key-events -->
                          <!-- svelte-ignore a11y-missing-attribute -->
                          <!-- svelte-ignore a11y-no-static-element-interactions -->
                          <a
                            class="fd-menu__link"
                            on:click|stopPropagation={() => {
                              toggleSearch(), toggleDropdownState('overflowPopover');
                            }}
                            data-testid="luigi-search-btn-mobile"
                          >
                            <i class="sap-icon sap-icon--search fd-top-nav__icon" />
                            <span class="fd-menu__title">Search</span>
                          </a>
                        </li>
                      {/if}
                      {#if contextSwitcherConfig && (!authorizationEnabled || isLoggedIn)}
                        <li class="fd-menu__item">
                          <!-- svelte-ignore a11y-click-events-have-key-events -->
                          <!-- svelte-ignore a11y-missing-attribute -->
                          <!-- svelte-ignore a11y-no-static-element-interactions -->
                          <a class="fd-menu__link" on:click|stopPropagation={openMobileContextSwitcher}>
                            <i
                              class="sap-icon fd-top-nav__icon {contextSwitcherConfig.icon &&
                              hasOpenUIicon(contextSwitcherConfig)
                                ? getSapIconStr(contextSwitcherConfig.icon)
                                : 'sap-icon--switch-views'}"
                            />
                            <span class="fd-menu__title"
                              >{selectedLabel ? selectedLabel : defaultLabelContextSwitcher}</span
                            >
                          </a>
                        </li>
                      {/if}
                      {#if children}
                        {#each children as node, i}
                          {#if !(node.hideFromNav || (showGlobalNav && node.globalNav))}
                            {#if !node.isCat || node.separator}
                              <li class="fd-menu__item">
                                {#if !node.separator}
                                  <a
                                    href={getRouteLink(node)}
                                    class="fd-menu__link {node === selectedNode ? 'is-selected' : ''}"
                                    on:click|preventDefault={() => handleClick(node)}
                                    data-testid="{NavigationHelpers.getTestId(node)}-mobile"
                                  >
                                    <span
                                      class="fd-top-nav__icon sap-icon {node.icon && hasOpenUIicon(node)
                                        ? getSapIconStr(node.icon)
                                        : ''}"
                                    >
                                      {#if !hasOpenUIicon(node)}
                                        <img src={node.icon} alt={node.altText ? node.altText : ''} />
                                      {/if}
                                      <BadgeCounter {node} />
                                    </span>
                                    <span class="fd-menu__title">{getNodeLabel(node)}</span>
                                  </a>
                                {:else}
                                  <span class="fd-menu__link fd-separator" tabindex="-1"></span>
                                {/if}
                              </li>
                            {:else if node.visibleChildren.filter((node) => !node.hideFromNav && node.label).length > 0}
                              <li class="fd-menu__item">
                                <a
                                  href={getRouteLink(node)}
                                  title={resolveTooltipText(node, getNodeLabel(node))}
                                  class="fd-menu__link"
                                  on:click|preventDefault={() => openMobileTopNavDropDown(node)}
                                  data-e2e="mobile-topnav-dropdown-category"
                                >
                                  <span class="fd-top-nav__icon">
                                    {#if hasOpenUIicon(node)}
                                      <i
                                        class="sap-icon {node.icon && hasOpenUIicon(node)
                                          ? getSapIconStr(node.icon)
                                          : ''}"
                                      />
                                    {:else}
                                      <img src={node.icon} alt={node.altText ? node.altText : ''} />
                                    {/if}
                                    <BadgeCounter {node} />
                                  </span>
                                  <span class="fd-list__title">{getNodeLabel(node)}</span>
                                </a>
                              </li>
                            {/if}
                          {/if}
                        {/each}
                      {/if}
                      {#if isProductSwitcherAvailable}
                        <li class="fd-menu__item">
                          <!-- svelte-ignore a11y-click-events-have-key-events -->
                          <!-- svelte-ignore a11y-missing-attribute -->
                          <!-- svelte-ignore a11y-no-static-element-interactions -->
                          <a
                            class="fd-menu__link"
                            on:click|stopPropagation={openMobileProductSwitcher}
                            data-testid="mobile-product-switcher"
                          >
                            {#if hasOpenUIicon(productSwitcherConfig) || !productSwitcherConfig.icon}
                              <i
                                class="fd-top-nav__icon sap-icon {getSapIconStr(productSwitcherConfig.icon || 'grid')}"
                              />
                            {:else}
                              <span class="fd-top-nav__icon sap-icon">
                                <img
                                  src={productSwitcherConfig.icon}
                                  alt={productSwitcherConfig.altText ? productSwitcherConfig.altText : ''}
                                />
                              </span>
                            {/if}
                            <span class="fd-menu__title">{productSwitcherConfig.label}</span>
                          </a>
                        </li>
                      {/if}
                    </ul>
                  </nav>
                </div>
                {#if isProductSwitcherAvailable}
                  <ProductSwitcher
                    bind:dropDownStates
                    on:toggleDropdownState={() => toggleDropdownState('productSwitcherPopover')}
                    isMobile={true}
                  />
                {/if}
                {#if openMobileDropDown}
                  <TopNavDropDown
                    node={nodeForMobile}
                    isMobile={true}
                    on:close={closeMobileTopNavDropDown}
                    {pathParams}
                  />
                {/if}
                {#if !authorizationEnabled || isLoggedIn}
                  <ContextSwitcher
                    bind:dropDownStates
                    on:toggleDropdownState={() => toggleDropdownState('contextSwitcherPopover')}
                    isMobile={true}
                    {contextSwitcherToggle}
                    bind:selectedLabel
                    bind:defaultLabel={defaultLabelContextSwitcher}
                  />
                {/if}
              </div>
            </div>
          </div>
        {/if}
      {/if}
      <!-- closes {#if children && pathData.length > 0} -->
      {#if authorizationEnabled || profileItemsAvailable}
        <div class="fd-shellbar__action fd-shellbar__action--show-always" data-testid="luigi-topnav-profile">
          {#if profileTypeSettings === 'Fiori3' && GenericHelpers.requestExperimentalFeature('profileMenuFiori3', true)}
            <div class="fd-popover fd-popover--right fd-user-menu">
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <!-- svelte-ignore a11y-no-static-element-interactions -->
              <div class="fd-popover__control" on:click|stopPropagation={() => {}}>
                <div
                  class="fd-button fd-button--transparent fd-shellbar__button fd-user-menu__control"
                  aria-controls="profilePopover"
                  aria-expanded="true"
                  aria-haspopup="true"
                  title={userInfo.name || undefined}
                  tabindex="0"
                  on:click={() => toggleDropdownState('profilePopover')}
                  on:keydown={(event) => handleToggleDropdownStateKeyEvent(event)}
                  data-testid={userInfo.picture ? 'luigi-topnav-profile-btn' : 'luigi-topnav-profile-initials'}
                >
                  <span
                    class="fd-avatar fd-avatar--xs fd-avatar--circle fd-shellbar__avatar--circle {userInfo.picture
                      ? 'fd-avatar--thumbnail'
                      : ''}"
                    style={userInfo.picture ? `background-image:url('${userInfo.picture}')` : ''}
                  >
                    {!userInfo.picture ? userInfo.initials || '' : ''}
                  </span>
                </div>
              </div>
              <div
                class="fd-popover__body fd-popover__body--no-arrow fd-popover__body--right"
                aria-hidden={!(dropDownStates.profilePopover || false)}
                id="profilePopover"
                on:click|stopPropagation
              >
                <Authorization
                  on:toggleDropdownState={() => toggleDropdownState('profilePopover')}
                  on:userInfoUpdated={userInfoUpdate}
                  {addNavHrefForAnchor}
                />
              </div>
            </div>
          {:else if profileTypeSettings === 'vega'}
            <div class="fd-user-menu">
              <div class="fd-popover">
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div class="fd-popover__control" on:click|stopPropagation={() => {}}>
                <div
                    class="fd-button fd-button--transparent fd-shellbar__button fd-user-menu__control"
                    aria-controls="profilePopover"
                    aria-expanded="true"
                    aria-haspopup="true"
                    title={userInfo.name || undefined}
                    tabindex="0"
                    on:click={() => toggleDropdownState('profilePopover')}
                    on:keydown={(event) => handleToggleDropdownStateKeyEvent(event)}
                    data-testid={userInfo.picture ? 'luigi-topnav-profile-btn' : 'luigi-topnav-profile-initials'}
                  >
                    <span
                      class="fd-avatar fd-avatar--xs fd-avatar--circle fd-shellbar__avatar--circle {userInfo.picture
                        ? 'fd-avatar--thumbnail'
                        : ''}"
                      style={userInfo.picture ? `background-image:url('${userInfo.picture}')` : ''}
                    >
                      {!userInfo.picture ? userInfo.initials || '' : ''}
                    </span>
                  </div>
                </div>
                <div
                  class="fd-popover__body fd-popover__body--right"
                  aria-hidden={!(dropDownStates.profilePopover || false)}
                  id="profilePopover"
                  on:click|stopPropagation
                >
                  <AuthorizationVegaProfileMenu
                    on:toggleDropdownState={() => toggleDropdownState('profilePopover')}
                    on:userInfoUpdated={userInfoUpdate}
                    {addNavHrefForAnchor}
                  />
                </div>
              </div>
            </div> 
          {:else}
            <div class="fd-user-menu">
              <div class="fd-popover">
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div class="fd-popover__control" on:click|stopPropagation={() => {}}>
                  <div class={userInfo.picture ? 'fd-shellbar__button--user-menu' : ''}>
                    <button
                      class="fd-button fd-button--transparent fd-shellbar__button"
                      aria-expanded={dropDownStates.profilePopover || false}
                      aria-haspopup="true"
                      aria-controls="profilePopover"
                      on:click={() => toggleDropdownState('profilePopover')}
                      title={userInfo.name ? userInfo.name : undefined}
                      tabindex="0"
                      data-testid="luigi-topnav-profile-btn"
                    >
                      {#if userInfo.picture}
                        <span
                          class="fd-avatar fd-avatar--xs fd-avatar--circle"
                          style="background-image:url('{userInfo.picture}')"
                        />
                      {:else}
                        <i
                          class="sap-icon {!userInfo.picture
                            ? 'sap-icon--customer'
                            : 'fd-identifier fd-identifier--xs fd-identifier--circle'}"
                        />
                      {/if}
                    </button>
                  </div>
                </div>
                <div
                  class="fd-popover__body fd-popover__body--right"
                  aria-hidden={!(dropDownStates.profilePopover || false)}
                  id="profilePopover"
                  on:click|stopPropagation
                >
                  <AuthorizationSimpleProfileMenu
                    on:toggleDropdownState={() => toggleDropdownState('profilePopover')}
                    on:userInfoUpdated={userInfoUpdate}
                    {addNavHrefForAnchor}
                  />
                </div>
              </div>
            </div>
          {/if}
        </div>
      {/if}
      {#if isProductSwitcherAvailable}
        <ProductSwitcher
          bind:dropDownStates
          on:toggleDropdownState={() => toggleDropdownState('productSwitcherPopover')}
          isMobile={false}
          {addNavHrefForAnchor}
        />
      {/if}
    </div>
  </div>
{:else}
  <AuthorizationSimpleProfileMenu
    on:toggleDropdownState={() => toggleDropdownState('profilePopover')}
    isHidden={true}
    {addNavHrefForAnchor}
  />
{/if}

<style lang="scss">
  /*Remove Safari bug with blue outlines of dropdowns in the shellbar*/
  .fd-shellbar:focus {
    outline: none;
  }

  .fd-shellbar:not(.fd-shellbar--responsive-paddings) {
    padding: 0 0.5rem;
  }

  .fd-shellbar {
    height: $topNavHeight;
    box-shadow: var(--sapContent_HeaderShadow);

    .fd-avatar.is-focus:after,
    .fd-avatar:focus:after {
      border-color: var(--fdShellbar_Button_Outline_Color);
    }

    .fd-shellbar__group .fd-shellbar__action.fd-shellbar__action .fd-shellbar__button {
      padding: 0 0.325rem 0 0.325rem;
    }
  }

  .hideNavComponent {
    display: none;
  }

  .nav-icon {
    height: 100%;
  }

  .fd-top-nav__icon {
    img {
      max-height: 16px;
      vertical-align: top;
      max-width: 16px;
    }
  }

  .fd-popover {
    .nav-icon {
      height: 2em;
    }
  }

  .lui-burger {
    cursor: pointer;
    color: var(--sapShell_TextColor, #fff);
  }

  @media (min-width: $desktopMinWidth) {
    :global(.lui-mobileOnly) .lui-burger {
      display: none;
    }
  }

  :global(.no-side-nav) {
    .lui-burger {
      display: none;
    }
  }

  .fd-top-nav__icon {
    display: inline-block;
    vertical-align: middle;
    min-width: 16px;
  }

  .fd-user-menu {
    background-color: transparent;
  }

  .fd-user-menu .fd-shellbar__button {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  :global(.fd-shellbar .fd-shellbar__button.is-selected) {
    background: var(--sapShell_Active_Background, #354a5f);
    color: var(--sapShell_Active_TextColor, #fff);
  }

  .fd-user-menu .fd-avatar {
    cursor: pointer;
  }

  .fd-separator {
    pointer-events: none;
  }

  .lui-shellbar-wrapper {
    column-gap: 2rem;
  }
</style>
