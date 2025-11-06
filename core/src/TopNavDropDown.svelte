<script>
  import BadgeCounter from './navigation/BadgeCounter.svelte';
  import MobileTopNav from './navigation/MobileTopNavDropDown.svelte';
  import { beforeUpdate, createEventDispatcher, onMount, getContext } from 'svelte';
  import { Routing } from './services/routing';
  import { Navigation } from './navigation/services/navigation';
  import { NavigationHelpers } from './utilities/helpers';
  import { RoutingHelpers } from './utilities/helpers';
  import { LuigiI18N, LuigiConfig } from './core-api';

  const dispatch = createEventDispatcher();

  export let isMobile;
  export let children;
  export let node;
  let pathParams;
  let getUnsavedChangesModalPromise = getContext('getUnsavedChangesModalPromise');
  let openViewInModal = getContext('openViewInModal');
  export let addNavHrefForAnchor;
  const getNodeSubtitle = () => {};

  //TODO refactor
  const getComponentWrapper = () => {
    return {
      get: () => {
        return {
          pathParams
        };
      },
      set: (obj) => {
        if (obj) {
        }
      }
    };
  };

  onMount(async () => {
    setViewportHeightVariable();
  });

  beforeUpdate(async () => {
    if (!children) {
      children = await Navigation.getChildren(node);
    }
    //force refresh of badge counters
    children = children;
  });

  // [svelte-upgrade suggestion]
  // review these functions and remove unnecessary 'export' keywords
  export function onActionClick(node) {
    getUnsavedChangesModalPromise().then(
      () => {
        if (node.openNodeInModal) {
          const route = RoutingHelpers.buildRoute(node, `/${node.pathSegment}`);
          openViewInModal(route, node.openNodeInModal === true ? {} : node.openNodeInModal);
        } else {
          Routing.handleRouteClick(node, getComponentWrapper());
        }
      },
      () => {}
    );
    closeSubNav();
  }

  export function onActionClickExternal(event) {
    onActionClick(event.detail);
  }

  export function closeSubNav() {
    dispatch('close');
  }

  export function setViewportHeightVariable() {
    // get the viewport height and multiple it by 1% to get a value for a vh unit
    let vh = window.innerHeight * 0.01;
    // set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  function hasOpenUIicon(node) {
    return NavigationHelpers.isOpenUIiconName(node.icon);
  }

  function getSapIconStr(iconString) {
    return NavigationHelpers.renderIconClassName(iconString);
  }

  function getNodeLabel(node) {
    return LuigiI18N.getTranslation(node.label);
  }

  function getRouteLink(node) {
    return RoutingHelpers.getNodeHref(node, pathParams);
  }
</script>

<svelte:window on:resize={setViewportHeightVariable} />
{#if !isMobile}
  <nav class="fd-menu">
    <ul class="fd-menu__list fd-menu__list--top fd-menu__list--no-shadow">
      {#if children}
        {#each children as node}
          {#if node.label}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <li
              role="presentation"
              class="fd-menu__item"
              on:click={() => onActionClick(node)}
              data-testid={NavigationHelpers.getTestId(node)}
            >
              <a
                href={addNavHrefForAnchor ? getRouteLink(node) : undefined}
                on:click={(event) => {
                  NavigationHelpers.handleNavAnchorClickedWithoutMetaKey(event);
                }}
                class="fd-menu__link"
              >
                <span class="fd-top-nav__icon">
                  {#if node.icon && hasOpenUIicon(node)}
                    <i class="sap-icon {getSapIconStr(node.icon)}" />
                  {:else}
                    <img class="sap-icon" src={node.icon} alt={node.altText ? node.altText : ''} />
                  {/if}
                  <BadgeCounter {node} />
                </span>
                <span class="fd-menu__title">{getNodeLabel(node)}</span>
              </a>
            </li>
          {/if}
        {/each}
      {/if}
    </ul>
  </nav>
{/if}
{#if isMobile}
  <MobileTopNav
    on:click={closeSubNav}
    on:listClick={onActionClickExternal}
    nodes={node.children}
    label={getNodeLabel(node)}
    {hasOpenUIicon}
    {getNodeLabel}
    {getNodeSubtitle}
    noSubTitle="true"
  />
{/if}

<style lang="scss">
  .fd-top-nav__icon {
    img {
      max-width: 16px;
      height: 16px;
      vertical-align: top;
    }
  }
</style>
