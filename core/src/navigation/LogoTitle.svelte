<script>
  import { beforeUpdate, createEventDispatcher, onMount, getContext } from 'svelte';
  import * as Header from './services/header';
  import { Routing } from '../services/routing';
  import { NavigationHelpers, RoutingHelpers, GenericHelpers } from '../utilities/helpers';

  const dispatch = createEventDispatcher();

  export let logo;
  export let hasLogo;
  export let title;
  export let hasApps;
  export let keepMainTitle;
  export let showSubTitle = true;
  export let dropDownStates = {};
  export let showMainAppEntry;
  export let selectedItem;
  export let defaultTitle;
  export let appSwitcherItems;
  export let itemRenderer;
  export let pathParams;
  export let subTitle;
  export let defaultSubTitle;
  export let pathData;
  export let addNavHrefForAnchor;
  let customItemRenderer__slotContainer;
  let previousPathData;
  let getUnsavedChangesModalPromise = getContext('getUnsavedChangesModalPromise');
  let getTranslation = getContext('getTranslation');
  let store = getContext('store');
  const appSwitcherApiObj = {
    closeDropDown: () => {
      toggleDropdownState('appSwitcherPopover');
    }
  };

  //TODO refactor
  const getComponentWrapper = () => {
    return {
      get: () => {
        return {
          pathData,
          pathParams,
          appSwitcherItems,
          itemRenderer,
          selectedItem,
          defaultTitle,
          title,
          subTitle,
          defaultSubTitle,
          showMainAppEntry,
          hasApps,
          keepMainTitle,
          showSubTitle,
          hasLogo,
          logo
        };
      },
      set: (obj) => {
        if (obj) {
          Object.getOwnPropertyNames(obj).forEach((prop) => {
            if (prop === 'pathData') {
              pathData = obj.pathData;
            } else if (prop === 'appSwitcherItems') {
              appSwitcherItems = obj.appSwitcherItems;
            } else if (prop === 'itemRenderer') {
              itemRenderer = obj.itemRenderer;
            } else if (prop === 'pathParams') {
              pathParams = obj.pathParams;
            } else if (prop === 'selectedItem') {
              selectedItem = obj.selectedItem;
            } else if (prop === 'title') {
              title = obj.title;
            } else if (prop === 'defaultSubTitle') {
              defaultSubTitle = obj.defaultSubTitle;
            } else if (prop === 'subTitle') {
              subTitle = obj.subTitle;
            } else if (prop === 'defaultTitle') {
              defaultTitle = obj.defaultTitle;
            } else if (prop === 'subTitle') {
              subTitle = obj.subTitle;
            } else if (prop === 'showMainAppEntry') {
              showMainAppEntry = obj.showMainAppEntry;
            } else if (prop === 'hasApps') {
              hasApps = obj.hasApps;
            } else if (prop === 'keepMainTitle') {
              keepMainTitle = obj.keepMainTitle;
            } else if (prop === 'showSubTitle') {
              showSubTitle = obj.showSubTitle;
            } else if (prop === 'hasLogo') {
              hasLogo = obj.hasLogo;
            }
          });
        }
      },
      store
    };
  };

  onMount(() => {
    Header.processHeaderSettings(getComponentWrapper());
  });

  beforeUpdate(() => {
    if (!previousPathData || previousPathData != pathData) {
      Header.updateTitle(getComponentWrapper());
      previousPathData = pathData;
    }
  });

  function renderCustomList(item, slot, index) {
    setTimeout(() => {
      if (slot) {
        itemRenderer(item, slot.children[index], appSwitcherApiObj);
      }
    });
    return '';
  }

  export function goTo(path) {
    getUnsavedChangesModalPromise().then(
      () => {
        Routing.navigateTo(RoutingHelpers.applyPathParams(path, pathParams));
      },
      () => {}
    );
  }

  export function goToRoot() {
    getUnsavedChangesModalPromise().then(
      () => {
        Routing.navigateTo('/');
      },
      () => {}
    );
  }

  export function handleClick(node) {
    dispatch('handleClick', { node });
    toggleDropdownState('appSwitcherPopover');
  }

  export function toggleDropdownState(name) {
    dispatch('toggleDropdownState', { name });
  }

  function getTestId(item) {
    return item.testId ? item.testId : NavigationHelpers.prepareForTests(item.title || item);
  }

  function hasValidLink(item, pathParams) {
    if (item.link) {
      const concreteLink = RoutingHelpers.applyPathParams(item.link, pathParams);
      if (concreteLink.indexOf(':') !== 0 && concreteLink.indexOf('/:') === -1) {
        return true;
      }
    }
    return false;
  }

  function getRouteLink(node) {
    return RoutingHelpers.getNodeHref(node);
  }
</script>

<div class="fd-shellbar__branding" role="link" tabindex="0" aria-label="SAP Corporate Portal Home">
  {#if addNavHrefForAnchor}
    <a
      class="fd-shellbar__logo {!hasLogo ? 'fd-shellbar__logo--image-replaced' : ''} {hasLogo ? 'lui-customlogo' : ''}"
      aria-label={title}
      on:click={(event) => {
        NavigationHelpers.handleNavAnchorClickedWithoutMetaKey(event) && goTo('/');
      }}
      href="/"
      role="button"
      tabindex="0"
    >
      {#if hasLogo}<img data-testid="luigi-topnav-logo" bind:this={logo} alt={title} />{/if}
    </a>
  {:else}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <span
      class="fd-shellbar__logo {!hasLogo ? 'fd-shellbar__logo--image-replaced' : ''} {hasLogo ? 'lui-customlogo' : ''}"
      aria-label={title}
      on:click={() => goTo('/')}
      role="button"
      tabindex="0"
    >
      {#if hasLogo}<img data-testid="luigi-topnav-logo" bind:this={logo} alt={title} />{/if}
    </span>
  {/if}
  {#if title}
    {#if !hasApps || keepMainTitle}
      {#if addNavHrefForAnchor}
        <a
          class="fd-shellbar__title lui-shellbar-single-app-title {hasApps && 'lui-has-apps'}"
          data-testid="luigi-topnav-title"
          on:click={(event) => {
            NavigationHelpers.handleNavAnchorClickedWithoutMetaKey(event) && goTo('/');
          }}
          href="/"
        >
          {$getTranslation(keepMainTitle ? defaultTitle : title)}
        </a>
      {:else}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span
          class="fd-shellbar__title lui-shellbar-single-app-title"
          data-testid="luigi-topnav-title"
          on:click={() => goTo('/')}
        >
          {$getTranslation(keepMainTitle ? defaultTitle : title)}
        </span>
      {/if}
    {/if}
  {/if}
</div>
{#if title}
  {#if hasApps}
    {#if keepMainTitle}<span class="fd-shellbar__separator"></span>{/if}
    <div
      class="fd-popover {keepMainTitle && 'lui-keep-main'} {appSwitcherItems &&
        appSwitcherItems.length === 1 &&
        'lui-sat'}"
    >
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="fd-popover__control" on:click|stopPropagation={() => {}}>
        {#if addNavHrefForAnchor}
          {#if appSwitcherItems && appSwitcherItems.length === 1}
            <a
              href={getRouteLink(appSwitcherItems[0])}
              class="fd-shellbar__title lui-shellbar-single-app-title"
              on:click={(event) => {
                NavigationHelpers.handleNavAnchorClickedWithoutMetaKey(event) && goTo(appSwitcherItems[0].link);
              }}
            >
              <span>{$getTranslation(appSwitcherItems[0].title)}</span>
            </a>
          {/if}
          {#if appSwitcherItems && appSwitcherItems.length > 1}
            {#each appSwitcherItems as item}
              {#if item === selectedItem && hasValidLink(item, pathParams)}
                <a
                  href={getRouteLink(item)}
                  class="fd-button fd-button--transparent fd-button--menu fd-shellbar__button fd-shellbar__button--menu lui-app-switch"
                  aria-haspopup="true"
                  aria-expanded={dropDownStates.appSwitcherPopover || false}
                  on:click|preventDefault={() => toggleDropdownState('appSwitcherPopover')}
                  data-testid="app-switcher"
                >
                  <span class="fd-button__text" data-testid="luigi-topnav-title">{$getTranslation(title)}</span>
                  <i class="sap-icon sap-icon--megamenu fd-shellbar__button--icon" />
                </a>
              {/if}
            {/each}
          {/if}
          {#if appSwitcherItems.length > 1 && !selectedItem}
            <a
              href="/"
              class="fd-button fd-button--transparent fd-button--menu fd-shellbar__button fd-shellbar__button--menu lui-app-switch"
              aria-haspopup="true"
              aria-expanded={dropDownStates.appSwitcherPopover || false}
              on:click|preventDefault={() => toggleDropdownState('appSwitcherPopover')}
              data-testid="app-switcher"
            >
              <span class="fd-button__text" data-testid="luigi-topnav-title">{$getTranslation(title)}</span>
              <i class="sap-icon sap-icon--megamenu fd-shellbar__button--icon" />
            </a>
          {/if}
        {:else}
          <button
            class="fd-button fd-button--transparent fd-button--menu fd-shellbar__button fd-shellbar__button--menu lui-app-switch"
            aria-haspopup="true"
            aria-expanded={dropDownStates.appSwitcherPopover || false}
            on:click|stopPropagation={() => toggleDropdownState('appSwitcherPopover')}
            data-testid="app-switcher"
          >
            <span class="fd-shellbar__title" data-testid="luigi-topnav-title">{$getTranslation(title)}</span>
            <i class="sap-icon sap-icon--megamenu fd-shellbar__button--icon" />
          </button>
        {/if}
      </div>
      <div
        class="fd-popover__body fd-popover__body--left"
        aria-hidden={!(dropDownStates.appSwitcherPopover || false)}
        id="appSwitcherPopover"
      >
        <nav class="fd-menu">
          <ul class="fd-menu__list fd-menu__list--no-shadow" bind:this={customItemRenderer__slotContainer}>
            {#if showMainAppEntry && selectedItem}
              <li class="fd-menu__item">
                <a
                  href="/"
                  role="button"
                  class="fd-menu__link"
                  on:click|preventDefault={goToRoot}
                  data-testid={getTestId(defaultTitle)}
                >
                  <span class="fd-menu__title">{$getTranslation(defaultTitle)}</span>
                </a>
              </li>
            {/if}
            {#if appSwitcherItems && appSwitcherItems.length > 0}
              {#each appSwitcherItems as item, index}
                {#if GenericHelpers.isFunction(itemRenderer)}
                  {#if customItemRenderer__slotContainer}
                    <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
                    <li class="fd-menu__item" tabindex="0">
                      {@html renderCustomList(item, customItemRenderer__slotContainer, index)}
                    </li>
                  {/if}
                {:else if item !== selectedItem && hasValidLink(item, pathParams)}
                  <li class="fd-menu__item">
                    <a
                      role="button"
                      class="fd-menu__link"
                      on:click={(event) => {
                        NavigationHelpers.handleNavAnchorClickedWithoutMetaKey(event) && goTo(item.link);
                      }}
                      href={addNavHrefForAnchor ? getRouteLink(item, pathParams) : undefined}
                      data-testid={getTestId(item)}
                    >
                      <span class="fd-menu__title">{$getTranslation(item.title)}</span>
                    </a>
                  </li>
                {/if}
              {/each}
            {/if}
          </ul>
        </nav>
      </div>
    </div>
  {/if}
  {#if subTitle && showSubTitle}
    <div class="fd-shellbar__subtitle">{$getTranslation(subTitle)}</div>
  {/if}
{/if}

<style lang="scss">
  // Force height because of base64 img src
  .lui-customlogo img {
    height: 24px;
  }

  .fd-shellbar__logo {
    margin: 0 0.5rem;
  }

  .fd-shellbar__logo,
  .fd-shellbar__title {
    cursor: pointer;
  }

  @media (max-width: $desktopMinWidth) {
    .fd-shellbar__subtitle {
      display: none;
    }
  }
</style>
