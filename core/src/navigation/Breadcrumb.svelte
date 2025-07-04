<script>
  import { beforeUpdate, createEventDispatcher, onMount, getContext } from 'svelte';
  import { LuigiConfig, LuigiI18N } from '../core-api';
  import { NavigationHelpers, RoutingHelpers, StateHelpers } from '../utilities/helpers';
  import { Routing } from '../services/routing';
  import { Navigation } from './services/navigation';

  const dispatch = createEventDispatcher();

  export let pathData;
  let previousPathData;
  let previousBreadcrumbs = {};

  let breadcrumbContainer;

  let store = getContext('store');

  export let showBreadcrumb;
  let addNavHrefForAnchor = LuigiConfig.getConfigBooleanValue('navigation.addNavHrefs');

  const setNavData = async () => {
    if (pathData && 0 < pathData.length) {
      // const tnd = await NavigationHelpers.generateTopNavNodes(pathData);
      // children = tnd.children;
      // selectedNode = tnd.selectedNode;
      previousPathData = pathData;
    }
  };

  const clickHandler = (element) => {
    if (!element.last) {
      handleClick(element.node);
    }
  };

  onMount(() => {
    StateHelpers.doOnStoreChange(store, () => {}, ['navigation']);
  });

  beforeUpdate(async () => {
    if (pathData && (!previousPathData || previousPathData != pathData)) {
      setNavData();

      if (pathData.length === 0) {
        // data reset, just do nothing
        return;
      }

      const breadcrumbConfig = LuigiConfig.getConfigValue('navigation.breadcrumbs');
      showBreadcrumb = !!breadcrumbConfig;
      if (showBreadcrumb) {
        // if enabled in general, check node scope
        pathData.forEach((node) => {
          if (node.showBreadcrumbs === false) {
            showBreadcrumb = false;
          } else if (node.showBreadcrumbs === true) {
            showBreadcrumb = true;
          }
        });
      }

      if (showBreadcrumb) {
        addNavHrefForAnchor = LuigiConfig.getConfigBooleanValue('navigation.addNavHrefs');

        if (breadcrumbConfig.renderer) {
          let items = [];
          const start = breadcrumbConfig.omitRoot ? 2 : 1;
          const currentPath = Routing.getCurrentPath();

          for (let i = start; i < pathData.length; i++) {
            // First run needed for pre-render
            const node = pathData[i];
            const route = RoutingHelpers.mapPathToNode(currentPath, node);
            if (previousBreadcrumbs[route]) {
              items.push(previousBreadcrumbs[route]);
            } else if (node.label || node.pathSegment || node.titleResolver) {
              document.body.classList.add('lui-breadcrumb');
              if (node.titleResolver) {
                items.push({
                  label:
                    node.titleResolver.prerenderFallback && node.titleResolver.fallbackTitle
                      ? LuigiI18N.getTranslation(node.titleResolver.fallbackTitle)
                      : breadcrumbConfig.pendingItemLabel || '',
                  node: node,
                  route: route,
                  pending: true
                });
              } else {
                const label = await getNodeLabel(node);
                if (label) {
                  items.push({ label: label, node: node, route: route });
                }
              }
            }
          }

          if (breadcrumbConfig.clearBeforeRender) {
            breadcrumbContainer.innerHTML = '';
          }
          breadcrumbConfig.renderer(breadcrumbContainer, items, clickHandler);
          items = [];

          for (let i = start; i < pathData.length; i++) {
            const node = pathData[i];

            const route = RoutingHelpers.mapPathToNode(currentPath, node);

            if (node.titleResolver) {
              const data = await Navigation.extractDataFromPath(route);

              const ctx = RoutingHelpers.substituteDynamicParamsInObject(
                Object.assign({}, data.pathData.context, node.context),
                data.pathData.pathParams
              );

              try {
                const headerData = await NavigationHelpers.fetchNodeTitleData(node, ctx);
                items.push({ label: headerData.label, node: node, route: route });
                continue;
              } catch (e) {
                //
              }
            }

            const label = await getNodeLabel(node);
            if (label) {
              items.push({ label: label, node: node, route: route });
            }
          }
          // check if route has been changed in the meantime, if yes, do nothing
          if (currentPath === Routing.getCurrentPath()) {
            if (breadcrumbConfig.clearBeforeRender) {
              breadcrumbContainer.innerHTML = '';
            }
            if (items.length > 1) {
              items[items.length - 1].last = true;
              document.body.classList.add('lui-breadcrumb');
              breadcrumbConfig.renderer(breadcrumbContainer, items, clickHandler);
            } else if (breadcrumbConfig.autoHide) {
              document.body.classList.remove('lui-breadcrumb');
            }
            previousBreadcrumbs = {};
            items.map((item) => {
              previousBreadcrumbs[item.route] = item;
            });
          }
        } else {
          document.body.classList.remove('lui-breadcrumb');
          console.warn('No breadcrumb container renderer specified');
        }
      } else {
        breadcrumbContainer.innerHTML = '';
        document.body.classList.remove('lui-breadcrumb');
      }
    }
  });

  async function getNodeLabel(node) {
    if (node.label && !node._virtualTree) {
      return LuigiI18N.getTranslation(node.label) || node.label;
    }
    if (node.pathSegment && node.pathSegment.indexOf(':') === 0) {
      const route = RoutingHelpers.mapPathToNode(Routing.getCurrentPath(), node);
      const data = await Navigation.extractDataFromPath(route);
      return RoutingHelpers.getDynamicNodeValue(node, data.pathData.pathParams);
    }
    if (node.pathSegment) {
      return node.pathSegment;
    }
    return '';
  }

  export function handleClick(node) {
    dispatch('handleClick', { node });
  }
</script>

<div class="lui-breadcrumb-container" bind:this={breadcrumbContainer} />

<style lang="scss">
  .lui-breadcrumb-container {
    position: absolute;
    right: 0;
    top: $topNavHeight;
    height: var(--luigi__breadcrumb--height);
    left: 0;
    display: none;
  }

  :global(.fd-tool-layout) .lui-breadcrumb-container.lui-breadcrumb-container {
    background: transparent;
    box-shadow: none;
    top: 0;
    left: unset;
    right: unset;
    width: 100%;
  }

  :global(.lui-breadcrumb) .lui-breadcrumb-container {
    display: block;
  }

  :global(.lui-global-nav-visible) .lui-breadcrumb-container {
    left: $globalNavWidth;
  }

  :global(.lui-breadcrumb .vega) .lui-breadcrumb-container {
    left: var(--luigi__left-sidenav--width);
  }
  :global(.lui-breadcrumb.semiCollapsed .vega) .lui-breadcrumb-container {
    left: var(--luigi__leftnav_collapsed--width);
  }
</style>
