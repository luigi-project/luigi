<script>
  import { afterUpdate, beforeUpdate, createEventDispatcher, onMount, getContext } from 'svelte';
  import { Navigation } from './services/navigation';
  import { Routing } from '../services/routing';
  import {
    IframeHelpers,
    NavigationHelpers,
    GenericHelpers,
    RoutingHelpers,
    StateHelpers,
    EventListenerHelpers
  } from '../utilities/helpers';
  import { LuigiConfig, LuigiElements, LuigiNavigation } from '../core-api';
  import { SemiCollapsibleNavigation } from './services/semi-collapsed-navigation';
  import BadgeCounter from './BadgeCounter.svelte';
  import StatusBadge from './StatusBadge.svelte';
  import LeftNavGroup from './LeftNavGroup.svelte';
  import LeftNavCollapsedWrapper from './LeftNavCollapsedWrapper.svelte';
  import { KEYCODE_ENTER } from '../utilities/keycode';
  import LeftNavMore from './LeftNavMore.svelte';

  //TODO refactor
  const __this = {
    get: () => ({
      children,
      hideNavComponent,
      footerText,
      semiCollapsible,
      pathData,
      virtualGroupPrefix,
      isSemiCollapsed,
      selectedNode,
      sideNavAccordionMode,
      selectedCategory,
      expandedCategories,
      hasCategoriesWithIcon,
      navParentNode
    }),
    set: async (obj) => {
      if (obj) {
        Object.getOwnPropertyNames(obj).forEach(async (prop) => {
          if (prop === 'pathData') {
            pathData = obj.pathData;
          } else if (prop === 'context') {
            context = obj.context;
          } else if (prop === 'children') {
            children = obj.children;
          } else if (prop === 'selectedNode') {
            selectedNode = obj.selectedNode;
          } else if (prop === 'hasCategoriesWithIcon') {
            hasCategoriesWithIcon = obj.hasCategoriesWithIcon;
          } else if (prop === 'navParent') {
            navHeader = undefined;
            let parentNode = obj.navParent;
            navParentNode = parentNode;
            if (parentNode && parentNode.navHeader && GenericHelpers.requestExperimentalFeature('navHeader', true)) {
              let resolvedNavHeader = parentNode.navHeader;
              let resolvedNavHeaderNode = parentNode;

              if ('inherit' === resolvedNavHeader) {
                resolvedNavHeaderNode = parentNode.parent;
                while (resolvedNavHeaderNode && 'inherit' === resolvedNavHeaderNode.navHeader) {
                  resolvedNavHeaderNode = resolvedNavHeaderNode.parent;
                }
                resolvedNavHeader = resolvedNavHeaderNode ? resolvedNavHeaderNode.navHeader : undefined;
              }

              if (resolvedNavHeader instanceof Function) {
                navHeader = {};

                let res = resolvedNavHeader(
                  NavigationHelpers.stripNode(parentNode),
                  NavigationHelpers.stripNode(resolvedNavHeaderNode),
                  context
                );
                if (res instanceof Promise) {
                  res.then((headerData) => {
                    navHeader = headerData;
                  });
                } else {
                  navHeader = res;
                }
              } else if ('auto' === resolvedNavHeader) {
                navHeader = {
                  label: parentNode.label,
                  icon: parentNode.icon
                };
              } else if (
                resolvedNavHeader &&
                resolvedNavHeader.useTitleResolver &&
                resolvedNavHeaderNode.titleResolver
              ) {
                if (resolvedNavHeaderNode.titleResolver.prerenderFallback) {
                  navHeader = {
                    ...resolvedNavHeader,
                    label: resolvedNavHeaderNode.titleResolver.fallbackTitle || '',
                    icon: resolvedNavHeaderNode.titleResolver.fallbackIcon
                  };
                } else {
                  navHeader = resolvedNavHeader;
                }

                const route = RoutingHelpers.mapPathToNode(Routing.getCurrentPath(), resolvedNavHeaderNode);

                Navigation.extractDataFromPath(route).then((data) => {
                  const ctx = RoutingHelpers.substituteDynamicParamsInObject(
                    Object.assign({}, data.pathData.context, resolvedNavHeaderNode.context),
                    data.pathData.pathParams
                  );
                  NavigationHelpers.fetchNodeTitleData(resolvedNavHeaderNode, ctx)
                    .then((headerData) => {
                      navHeader = { ...resolvedNavHeader, ...headerData };
                    })
                    .catch((error) => {
                      console.error('Error while retrieving title, fallback to node label');
                      navHeader = {
                        ...resolvedNavHeader,
                        label: parentNode.label,
                        icon: parentNode.icon
                      };
                    });
                });
              } else {
                navHeader = await processHeader(resolvedNavHeader, resolvedNavHeaderNode);
              }
            }
          }
        });
        sideNavAccordionMode = !vegaSideNav && NavigationHelpers.getSideNavAccordionMode(selectedNode);
      }
    }
  };

  const dispatch = createEventDispatcher();

  export let children;
  export let hideNavComponent;
  export let footerText;
  export let semiCollapsible;
  export let semiCollapsibleButton;
  export let semiCollapsibleButtonStyle;
  export let displayFooterWhenCollapsed;
  export let pathData;
  export let pathParams;
  export let virtualGroupPrefix = NavigationHelpers.virtualGroupPrefix;
  export let isSemiCollapsed;
  export let selectedNode;
  export let selectedCategory = null;
  export let expandedCategories;
  export let hasCategoriesWithIcon;
  export let sideNavAccordionMode;
  export let burgerTooltip;
  export let navHeader;
  export let navParentNode;
  let context;
  let previousPathData;
  let sideNavCompactMode;
  let store = getContext('store');
  let getTranslation = getContext('getTranslation');
  let addNavHrefForAnchor = false;
  let btpToolLayout =
    LuigiConfig.getConfigValue('settings.btpToolLayout') &&
    GenericHelpers.requestExperimentalFeature('btpToolLayout', false);
  let vegaSideNav = LuigiConfig.getConfigValue('settings.sideNav.style') === 'vega';
  let btpNavTopCnt;
  let toolLayoutSubCatDelimiter =
    LuigiConfig.getConfigValue('settings.sideNav.subCategoryDelimiter') ||
    LuigiConfig.getConfigValue('settings.btpToolLayout.subCategoryDelimiter') ||
    '::';
  let navHeaderContainer;
  let vegaNavCnt;
  let updateTimeout;

  const getNodeLabel = (node) => {
    return NavigationHelpers.getNodeLabel(node);
  };

  const setLeftNavData = async () => {
    if (window.Luigi.__btpNavTopCntRszObs) {
      window.Luigi.__btpNavTopCntRszObs.disconnect();
      delete window.Luigi.__btpNavTopCntRszObs;
    }
    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }
    const componentData = __this.get();
    const leftNavData = await Navigation.getLeftNavData({ ...componentData }, componentData);
    if (!leftNavData) {
      return;
    }
    __this.set(leftNavData);
    previousPathData = pathData;
    window.LEFTNAVDATA = leftNavData.children;
  };

  onMount(() => {
    semiCollapsibleButton = LuigiConfig.getConfigValue('settings.responsiveNavigation') === 'semiCollapsible';
    semiCollapsibleButtonStyle = LuigiConfig.getConfigValue('settings.semiCollapsibleButtonStyle');
    addNavHrefForAnchor = LuigiConfig.getConfigValue('navigation.addNavHrefs');
    hideNavComponent = LuigiConfig.getConfigBooleanValue('settings.hideNavigation');
    sideNavCompactMode = LuigiConfig.getConfigBooleanValue('settings.sideNavCompactMode');
    expandedCategories = NavigationHelpers.loadExpandedCategories();
    displayFooterWhenCollapsed = LuigiConfig.getConfigBooleanValue('settings.sideNav.displayFooterWhenCollapsed');

    StateHelpers.doOnStoreChange(store, () => {
      footerText = LuigiConfig.getConfigValue('settings.sideNavFooterText');
    }, ['settings.footer']);

    StateHelpers.doOnStoreChange(store, () => {
      setLeftNavData();
    }, ['navigation.viewgroupdata']);

    let stateArr = SemiCollapsibleNavigation.initial();
    isSemiCollapsed = stateArr.isSemiCollapsed;
    semiCollapsible = stateArr.semiCollapsible;
    SemiCollapsibleNavigation.onValueChanged((stateArr) => {
      const previousSemiCollapsed = isSemiCollapsed;
      isSemiCollapsed = stateArr.isSemiCollapsed;
      if (vegaSideNav) {
        if (!previousSemiCollapsed) {
          resetNavEntries();
        }
        if (isSemiCollapsed) {
          calculateNavEntries();
        }
      }
    });

    EventListenerHelpers.addEventListener('message', (e) => {
      if ('luigi.navigation.update-badge-counters' === e.data.msg) {
        setLeftNavData();
      }
    });
  });

  const resetNavEntries = () => {
    setTimeout(() => {
      if (btpNavTopCnt) {
        const moreEntries = btpNavTopCnt.querySelectorAll('.lui-moreItems  > .lui-nav-entry');
        const navList = btpNavTopCnt.querySelector('.fd-navigation__list');
        const spacer = btpNavTopCnt.querySelector('.fd-navigation__list > .lui-spacer');
        moreEntries?.forEach((item) => {
          if (item.navGroupId) {
            navList.querySelector(`[navGroupId="${item.navGroupId}"]`).appendChild(item);
          } else {
            navList.insertBefore(item, spacer);
          }
        });
        btpNavTopCnt.querySelector('.fd-navigation__list > .fd-navigation__list-item--overflow').style.display = 'none';
      } else if (vegaSideNav && vegaNavCnt) {
        const more = vegaNavCnt.querySelector('.lui-more');
        const moreUL = vegaNavCnt.querySelector('.lui-more .fd-popover__wrapper');
        if (more) {
          more.style.display = 'none';
        }

        moreUL.querySelectorAll('li').forEach((li) => {
          if (li.luiIndex) {
            const placeholder = vegaNavCnt.querySelector('.lui-placeholder-' + li.luiIndex);
            if (!placeholder) {
              return;
            }
            placeholder.parentNode.insertBefore(li, placeholder);
            placeholder.remove();
          }
        });
        moreUL.innerHTML = '';
        vegaNavCnt
          .querySelectorAll('.fd-side-nav__container--top > .fd-navigation-list .fd-navigation-list__item--group')
          .forEach((li) => {
            li.style.display = 'list-item';
          });
      }
    });
  };

  const calculateNavEntries = () => {
    setTimeout(() => {
      if (btpNavTopCnt) {
        const spacer = btpNavTopCnt.querySelector('.fd-navigation__list > .lui-spacer');
        const moreUL = btpNavTopCnt.querySelector('.lui-moreItems');
        const entries = btpNavTopCnt.querySelectorAll('.fd-navigation__list > .lui-nav-entry');

        if (spacer.clientHeight === 0 && entries.length > 1) {
          btpNavTopCnt.querySelector('.fd-navigation__list > .fd-navigation__list-item--overflow').style.display =
            'flex';
          for (let i = entries.length - 1; i > 0; i--) {
            lastNode = entries[i - 1];
            entries[i].navGroupId = entries[i].parentNode.getAttribute('navGroupId');
            moreUL.insertBefore(entries[i], moreUL.firstChild);
            if (spacer.clientHeight > 0) {
              break;
            }
          }
        }
      } else if (vegaSideNav && vegaNavCnt) {
        const spacer = vegaNavCnt.querySelector('.lui-spacer');
        const entries = vegaNavCnt.querySelectorAll(
          '.fd-side-nav__container--top > .fd-navigation-list .lui-nav-entry'
        );
        const moreUL = vegaNavCnt.querySelector('.lui-more .fd-popover__wrapper');

        if (spacer.clientHeight === 0 && entries.length > 1) {
          vegaNavCnt.querySelector('.lui-more').style.display = 'block';
          for (let i = entries.length - 1; i > 0; i--) {
            lastNode = entries[i];
            const parent = lastNode.parentNode;
            lastNode.luiIndex = i;
            const placeholder = document.createElement('li');
            placeholder.luiIndex = i;
            placeholder.classList.add('lui-placeholder-' + i);
            placeholder.style.display = 'none';
            lastNode.parentNode.insertBefore(placeholder, lastNode);
            moreUL.insertBefore(lastNode, moreUL.firstChild);
            if (lastNode.getAttribute('is-in-group') === 'true' && parent.getBoundingClientRect().height === 0) {
              parent.parentNode.style.display = 'none';
            }
            if (spacer.clientHeight > 0) {
              break;
            }
          }
        }
      }
    });
  };

  const handleNavHeaderRenderer = () => {
    const clickHandler = (node) => {
      if (node) {
        handleClick(node);
      }
    };

    if (navHeader?.renderer && navHeaderContainer) {
      if (navHeader.clearBeforeRender) {
        navHeaderContainer.innerHTML = '';
      }

      navHeader.renderer(navHeaderContainer, navParentNode, clickHandler, { ...navHeader, context: pathData._context });
    }
  };

  afterUpdate(() => {
    if (!window.Luigi.__btpNavTopCntRszObs) {
      let oldHeight = 0;
      window.Luigi.__btpNavTopCntRszObs = new ResizeObserver((entries, observer) => {
        if (updateTimeout) {
          clearTimeout(updateTimeout);
        }
        if (isSemiCollapsed) {
          if (entries[0].target.getBoundingClientRect().height !== oldHeight) {
            updateTimeout = setTimeout(() => {
              resetNavEntries();
              calculateNavEntries();
              oldHeight = entries[0].target.getBoundingClientRect().height;
            }, 100);
          }
        }
      });
    }
    window.Luigi.__btpNavTopCntRszObs.disconnect();
    if ((btpNavTopCnt || vegaSideNav) && isSemiCollapsed) {
      window.Luigi.__btpNavTopCntRszObs.observe(btpNavTopCnt || vegaNavCnt);
    } else {
      resetNavEntries();
    }
    handleNavHeaderRenderer();
  });

  beforeUpdate(() => {
    vegaSideNav = LuigiConfig.getConfigValue('settings.sideNav.style') === 'vega';
    if (!previousPathData || previousPathData != pathData) {
      setLeftNavData();
    }
    sideNavCompactMode = LuigiConfig.getConfigBooleanValue('settings.sideNavCompactMode');
    expandedCategories = NavigationHelpers.loadExpandedCategories();
    semiCollapsibleButton = LuigiConfig.getConfigValue('settings.responsiveNavigation') === 'semiCollapsible';
  });

  function convertEntriesToToolLayout(entries) {
    if (btpToolLayout || vegaSideNav) {
      const categoryById = {};
      const subCatEntries = [];
      const subCatDelim = toolLayoutSubCatDelimiter;
      let converted = [];
      entries.forEach((entry) => {
        if (entry[0].startsWith(virtualGroupPrefix)) {
          //single nodes
          converted.push({ isSingleEntry: true, entries: [entry] });
        } else {
          // categories
          const catId = entry[1].metaInfo.categoryUid;
          if (catId && catId.indexOf(subCatDelim) > 0) {
            // subcat
            subCatEntries.push(entry);
          } else {
            // supercat
            const isGroup = entry[1].metaInfo.isGroup;
            categoryById[catId] = {
              isSingleEntry: !isGroup,
              title: $getTranslation(entry[1].metaInfo.label),
              groupEntry: entry,
              uid: catId,
              entries: [isGroup ? ['undefined', entry[1]] : entry]
            };
            converted.push(categoryById[catId]);
            if (!NavigationHelpers.isCollapsedSuperCategory(catId) && isGroup) {
              setExpandedState(entry[1], true);
            }
          }
        }
      });

      subCatEntries.forEach((entry) => {
        const superCatId = entry[1].metaInfo.categoryUid.split(subCatDelim)[0];
        const potentialSuperCat = categoryById[superCatId];
        if (!potentialSuperCat) {
          // dunno yet what to do in this case
        } else {
          if (potentialSuperCat.isSingleEntry) {
            // convert to super cat
            potentialSuperCat.isSingleEntry = false;
            potentialSuperCat.entries = [['undefined', potentialSuperCat.groupEntry[1]]];
          }
          potentialSuperCat.entries.push(entry);
        }
      });
      return converted.filter((group) => {
        if (group.entries && group.entries.length > 0) {
          for (let index = 0; index < group.entries.length; index++) {
            const [key, nodes] = group.entries[index];
            if (nodes.filter((node) => !node.hideFromNav && node.label).length > 0) {
              return true;
            }
          }
        }
        return false;
      });
    } else {
      return entries;
    }
  }

  export let sortedChildrenEntries;
  export let sortedVerticalNavGroups;
  $: {
    if (children) {
      const entries = Object.entries(children);
      entries.sort((e1, e2) => e1[1].metaInfo.order - e2[1].metaInfo.order);
      sortedChildrenEntries = entries;
      sortedVerticalNavGroups = convertEntriesToToolLayout(entries);
    }
  }

  function getSapIconStr(iconString) {
    return NavigationHelpers.renderIconClassName(iconString);
  }

  function isOpenUIiconName(name) {
    return NavigationHelpers.isOpenUIiconName(name);
  }

  function isExpanded(nodes, expandedList) {
    return expandedList && expandedList.indexOf(nodes.metaInfo.categoryUid) >= 0;
  }

  function getRouteLink(node) {
    return RoutingHelpers.getNodeHref(node, pathParams);
  }

  function getTestIdForCat(metaInfo, key) {
    return metaInfo && metaInfo.testId ? metaInfo.testId : NavigationHelpers.prepareForTests(key || metaInfo.label);
  }

  async function processHeader(header, node) {
    const route = RoutingHelpers.mapPathToNode(Routing.getCurrentPath(), node);
    const data = await Navigation.extractDataFromPath(route);
    const dynParams = data.pathData.pathParams;
    const nhead = RoutingHelpers.substituteDynamicParamsInObject(header, dynParams);
    return nhead;
  }

  function resolveTooltipText(node, translation) {
    return NavigationHelpers.generateTooltipText(node, translation);
  }

  // [svelte-upgrade suggestion]
  // review these functions and remove unnecessary 'export' keywords
  export function handleClick(node) {
    dispatch('handleClick', { node });
    if (vegaSideNav) {
      closeMorePopup();
    }
  }

  export function handleIconClick(nodeOrNodes, el) {
    if (SemiCollapsibleNavigation.getCollapsed()) {
      let selectedCat;
      let sideBar = document.getElementsByClassName('fd-app__sidebar')[0];

      if (nodeOrNodes.metaInfo && nodeOrNodes.metaInfo.label) {
        selectedCat = nodeOrNodes.metaInfo.label;
      } else {
        selectedCat = (nodeOrNodes.category && nodeOrNodes.category.label) || nodeOrNodes.category;
      }

      if (sideBar && !sideBar.classList.contains('isBlocked')) {
        sideBar.className += ' isBlocked';
      }

      // only close if same clicked
      if (selectedCat === selectedCategory) {
        selectedCategory = SemiCollapsibleNavigation.closePopupMenu(selectedCategory);
        return;
      }

      selectedCategory = selectedCat;

      if (sideBar || vegaSideNav) {
        calculateFlyoutPosition(el);
        if (vegaSideNav && !el.closest('.lui-more')) {
          closeMorePopup();
        }
      } else if (btpToolLayout) {
        calculateBTPNavFlyoutPosition(el);
        if (!el.closest('.lui-moreItems')) {
          closeMorePopup();
        }
      }
    }
  }

  export function calculateFlyoutPosition(el) {
    if (vegaSideNav) {
      const liPopOver = el.closest('.fd-popover__control');
      const parentPos = liPopOver.getBoundingClientRect();
      const flyout = liPopOver.querySelector('.fd-popover__body');
      flyout.setAttribute(
        'style',
        `position: fixed; left: ${Math.round(parentPos.right) + 10}px !important; top: ${Math.round(parentPos.top) + 5}px;`
      );
      setTimeout(() => {
        const offset = flyout.getBoundingClientRect().bottom - window.innerHeight;
        if (offset > 0) {
          let cStyle = flyout.getAttribute('style');
          cStyle += `--lui-flyout-offset: ${offset}px; transform: translateY(-${offset}px)`;
          flyout.setAttribute('style', cStyle);
        }
      });
    } else {
      //Calculate top/bottom position for flyout sublist
      const parent = el.closest('.fd-nested-list__item');
      const parentTopPosition = parent.offsetTop;
      const shellbarHeight = LuigiElements.getShellbar().offsetHeight;
      let containerHeight;
      if (LuigiElements.isCustomLuigiContainer()) {
        containerHeight = LuigiElements.getCustomLuigiContainer().clientHeight;
      } else {
        containerHeight = window.innerHeight;
      }
      setTimeout(() => {
        const flyoutSublist = parent.getElementsByClassName('lui-flyout-sublist')[0];
        const topScroll = el.closest('.lui-fd-side-nav-wrapper').scrollTop;
        const topPosition = parentTopPosition + shellbarHeight - topScroll;
        const bottomPosition = containerHeight - parentTopPosition - parent.offsetHeight + topScroll - shellbarHeight;

        if (topPosition + flyoutSublist.offsetHeight >= containerHeight) {
          flyoutSublist.style.bottom = bottomPosition + 'px';
          flyoutSublist.className += ' has-bottom-position';
        } else {
          flyoutSublist.style.top = topPosition - shellbarHeight + 'px';
        }
      });
    }
  }

  export function calculateBTPNavFlyoutPosition(el) {
    const parent = el.closest('.lui-nav-entry');
    parent.style.setProperty('--lui_popover_offset', '0px');

    setTimeout(() => {
      const popover = parent.querySelector('.fd-popover__body');
      const rect = popover?.getBoundingClientRect();
      if (rect && rect.top + rect.height > window.innerHeight) {
        parent.style.setProperty('--lui_popover_offset', rect.top + rect.height - window.innerHeight + 'px');
      }
    });
  }

  export function onResize() {
    if (semiCollapsible) {
      let stateArr = SemiCollapsibleNavigation.onResize(selectedCategory);
      isSemiCollapsed = stateArr.isSemiCollapsed;
      selectedCategory = stateArr.selectedCategory;
    }
  }

  export function handleKey(event) {
    const code = event.code;
    if (code === 'ArrowRight') {
      const iframe = IframeHelpers.getCurrentMicrofrontendIframe();
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.focus();
      }
    }
  }

  export function handleUp(event) {
    let node = navParentNode ? navParentNode.parent : undefined;
    while (node) {
      if (node.pathSegment && node.pathSegment.trim().indexOf(':') !== 0) {
        dispatch('handleClick', { node });
        return;
      }
      node = node.parent;
    }

    console.warn('Could not resolve "up"-node, redirecting to root');
    LuigiNavigation.navigate('/');
  }

  export function setExpandedState(nodes, value) {
    if (SemiCollapsibleNavigation.getCollapsed()) {
      return;
    }

    expandedCategories = NavigationHelpers.storeExpandedState(nodes.metaInfo.categoryUid, value, sideNavAccordionMode);
  }

  function closeMorePopup() {
    btpNavTopCnt &&
      btpNavTopCnt.querySelector('.fd-navigation__item.lui-nav-more').setAttribute('aria-expanded', false);
    if (vegaSideNav) {
      vegaNavCnt.querySelector('.lui-more > a').setAttribute('aria-expanded', false);
      vegaNavCnt.querySelector('.lui-more > div').setAttribute('lui-hidden', 'true');
    }
  }

  export function closePopupMenu() {
    selectedCategory = SemiCollapsibleNavigation.closePopupMenu(selectedCategory);
    closeMorePopup();
  }

  function closePopupMenuOnEsc(event) {
    if (event && event.code === 'Escape') {
      closePopupMenu();
    }
  }

  function semiCollapsibleButtonClicked() {
    isSemiCollapsed = SemiCollapsibleNavigation.buttonClicked();
    if (document.getElementsByClassName('luigi-tabsContainerHeader').length > 0) {
      dispatch('resizeTabNav', {});
    }
    setBurgerTooltip();
  }

  function handleEnterSemiCollapseBtn(event) {
    const code = event.code;
    if (code === 'Enter' || code === 'Space') {
      semiCollapsibleButtonClicked();
    }
  }

  function handleExpandCollapseCategories(event, nodes) {
    if (event.code === 'Enter' || event === 'Space') {
      handleIconClick(nodes, event.currentTarget);
    }
  }

  /**
   * Handles pressing the enter key when addNavHref is disabled
   * @param event the event of the anchor element currently focused on
   * @param node the corresponding node selected
   */
  function handleEnterPressed(event, node) {
    if (event.keyCode === KEYCODE_ENTER) {
      NavigationHelpers.handleNavAnchorClickedWithoutMetaKey(event) && handleClick(node);
    }
  }

  function setBurgerTooltip() {
    if (!NavigationHelpers.getBurgerTooltipConfig()) {
      return;
    }
    const [collapseNavTooltip, expandNavTooltip] = NavigationHelpers.getBurgerTooltipConfig();
    const hasSemiCollapsible = document.body.classList.contains('lui-semiCollapsible');
    if (collapseNavTooltip && expandNavTooltip && hasSemiCollapsible) {
      burgerTooltip = document.body.classList.contains('semiCollapsed') ? collapseNavTooltip : expandNavTooltip;
    }
  }

  function setTitleForCategoryButton(nodes, expandedCategories) {
    return isExpanded(nodes, expandedCategories)
      ? nodes.metaInfo.titleCollapseButton
        ? $getTranslation(nodes.metaInfo.titleCollapseButton)
        : undefined
      : nodes.metaInfo.titleExpandButton
        ? $getTranslation(nodes.metaInfo.titleExpandButton)
        : undefined;
  }

  function displayMoreButtonMenu(event) {
    if (!event) return;
    const parent = event.target.parentElement;
    if (parent.getAttribute('aria-expanded') === 'true') {
      parent.setAttribute('aria-expanded', 'false');
    } else {
      closePopupMenu();
      parent.setAttribute('aria-expanded', 'true');
    }
    event.stopPropagation();
  }
</script>

<svelte:window
  on:resize={onResize}
  on:click={closePopupMenu}
  on:blur={closePopupMenu}
  on:keydown={closePopupMenuOnEsc}
/>
{#if btpToolLayout}
  <div
    class="fd-navigation fd-navigation--vertical {sideNavCompactMode ? 'is-compact' : ''} {hideNavComponent
      ? 'hideNavComponent'
      : ''} {footerText || semiCollapsibleButton ? 'hasFooter' : ''} {footerText && !semiCollapsibleButton
      ? 'hasOnlyFooterText'
      : ''}
        {isSemiCollapsed ? 'fd-navigation--snapped' : ''}"
    role="navigation"
    style="width: var(--luigi__left-sidenav--width); height: 100%;"
  >
    {#if navHeader}
      <div class="lui-nav-title" bind:this={navHeaderContainer}>
        {#if !navHeader.renderer}
          <ul class="fd-nested-list">
            <li class="fd-nested-list__item">
              <!-- svelte-ignore a11y-missing-attribute -->
              <a class="fd-nested-list__link" title={resolveTooltipText(navHeader, $getTranslation(navHeader.label))}>
                {#if navHeader.icon}
                  {#if isOpenUIiconName(navHeader.icon)}
                    <i
                      class="lui-header-icon fd-nested-list__icon sap-icon {getSapIconStr(navHeader.icon)}"
                      role="presentation"
                    />
                  {:else}
                    <span class="fd-nested-list__icon sap-icon">
                      <img src={navHeader.icon} alt={navHeader.altText ? navHeader.altText : ''} />
                    </span>
                  {/if}
                {/if}
                <span class="fd-nested-list__title">{$getTranslation(navHeader.label)}</span>
                {#if navHeader.showUpLink}
                  <i
                    class="lui-nav-up fd-nested-list__icon sap-icon sap-icon--navigation-up-arrow"
                    role="presentation"
                    title={$getTranslation('luigi.navigation.up')}
                    on:click|preventDefault={handleUp}
                  />
                {/if}
              </a>
            </li>
          </ul>
        {/if}
      </div>
    {/if}

    {#if children && pathData.length > 1}
      <div class="fd-navigation__container fd-navigation__container--top" bind:this={btpNavTopCnt}>
        <ul class="fd-navigation__list" role="tree" tabindex="-1">
          {#each sortedVerticalNavGroups as group}
            <LeftNavGroup
              navGroup={group}
              expanded={group.groupEntry && isExpanded(group.groupEntry[1], expandedCategories)}
            >
              {#each group.entries as [key, nodes], index}
                {#if key === 'undefined' || key.startsWith(virtualGroupPrefix)}
                  <!-- Single nodes -->
                  {#each nodes as node}
                    {#if !node.hideFromNav}
                      {#if node.label}
                        <li class="fd-navigation__list-item lui-nav-entry">
                          <div
                            class="fd-navigation__item"
                            aria-level="2"
                            role="treeitem"
                            aria-selected={node === selectedNode}
                            aria-expanded="false"
                          >
                            <a
                              class="fd-navigation__link {node === selectedNode ? 'is-selected' : ''} lui-hideOnHover"
                              tabindex="0"
                              href={getRouteLink(node)}
                              title={resolveTooltipText(node, getNodeLabel(node))}
                              on:click={(event) => {
                                NavigationHelpers.handleNavAnchorClickedWithoutMetaKey(event) && handleClick(node);
                              }}
                              on:keyup={!addNavHrefForAnchor ? (event) => handleEnterPressed(event, node) : undefined}
                              role={!addNavHrefForAnchor ? 'button' : undefined}
                              data-testid={NavigationHelpers.getTestId(node)}
                              on:mouseup={(event) => {
                                isSemiCollapsed && event.target.blur();
                              }}
                            >
                              {#if node.icon}
                                {#if isOpenUIiconName(node.icon)}
                                  <span
                                    class="fd-navigation__icon lui-hideOnHover-show {getSapIconStr(node.icon)}"
                                    role="presentation"
                                    aria-hidden="true"
                                  />
                                {:else}
                                  <span class="fd-navigation__icon lui-hideOnHover-show">
                                    <img src={node.icon} alt={node.altText ? node.altText : ''} />
                                  </span>
                                {/if}
                              {:else}
                                <span
                                  class="fd-navigation__icon lui-hideOnHover-show {isSemiCollapsed
                                    ? 'sap-icon--rhombus-milestone-2'
                                    : ''}"
                                  role="presentation"
                                  aria-hidden="true"
                                />
                              {/if}
                              <span
                                class="fd-navigation__text lui-hideOnHover-show badge-align-{node.statusBadge &&
                                node.statusBadge.align === 'right'
                                  ? 'right'
                                  : 'left'}"
                              >
                                {getNodeLabel(node)}
                                <StatusBadge {node} />
                              </span>
                              {#if node.externalLink && node.externalLink.url}
                                <span
                                  class="fd-navigation__external-link-indicator"
                                  role="presentation"
                                  aria-hidden="true"
                                  aria-label="external link indicator"
                                />
                              {/if}
                              {#if node.badgeCounter}
                                <BadgeCounter {node} />
                              {/if}
                              <span
                                class="fd-navigation__selection-indicator"
                                role="presentation"
                                aria-hidden="true"
                                aria-label="selection indicator"
                              />
                            </a>
                          </div>
                        </li>
                      {/if}
                    {/if}
                  {/each}
                {:else if nodes.filter((node) => !node.hideFromNav && node.label).length > 0}
                  <li
                    class="fd-navigation__list-item {isSemiCollapsed ? 'fd-popover' : ''} lui-nav-entry"
                    data-testid={getTestIdForCat(nodes.metaInfo, key)}
                  >
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-interactive-supports-focus -->
                    <div
                      class="fd-navigation__item {isSemiCollapsed ? 'fd-popover__control' : ''}"
                      role="treeitem"
                      title={resolveTooltipText(nodes, $getTranslation(key))}
                      aria-expanded={isSemiCollapsed
                        ? nodes.metaInfo && nodes.metaInfo.label === selectedCategory
                        : isExpanded(nodes, expandedCategories)}
                      aria-selected={isSemiCollapsed && nodes.indexOf(selectedNode) >= 0}
                      on:click|stopPropagation={(event) => handleIconClick(nodes, event.currentTarget)}
                    >
                      <!-- svelte-ignore a11y-missing-attribute -->
                      <!-- svelte-ignore a11y-click-events-have-key-events                   -->
                      <a
                        class="fd-navigation__link"
                        role="button"
                        tabindex="0"
                        on:click|preventDefault={() =>
                          setExpandedState(nodes, !isExpanded(nodes, expandedCategories), this)}
                        on:keypress|preventDefault={() =>
                          setExpandedState(nodes, !isExpanded(nodes, expandedCategories), this)}
                        on:keypress|preventDefault={(event) => handleExpandCollapseCategories(event, nodes)}
                      >
                        {#if isOpenUIiconName(nodes.metaInfo.icon)}
                          <span
                            class="fd-navigation__icon {getSapIconStr(nodes.metaInfo.icon)} {isSemiCollapsed &&
                            !nodes.metaInfo.icon
                              ? 'sap-icon--rhombus-milestone-2'
                              : ''}"
                            role="presentation"
                            aria-hidden="true"
                          />
                        {:else}
                          <span class="fd-navigation__icon" role="presentation" aria-hidden="true">
                            <img src={nodes.metaInfo.icon} alt={nodes.metaInfo.altText ? nodes.metaInfo.altText : ''} />
                          </span>
                        {/if}
                        <span class="fd-navigation__text">{$getTranslation(key)}</span>
                        <span
                          class="fd-navigation__selection-indicator"
                          role="presentation"
                          aria-hidden="true"
                          aria-label="selection indicator"
                        />
                        <span
                          class="fd-navigation__has-children-indicator"
                          role="presentation"
                          aria-hidden="true"
                          aria-label="has children indicator, expanded"
                        />
                      </a>
                    </div>
                    {#if !isSemiCollapsed || (nodes.metaInfo && nodes.metaInfo.label === selectedCategory)}
                      <div
                        class="fd-navigation__list-container
                        {isSemiCollapsed
                          ? 'fd-popover__body fd-popover__body--after fd-popover__body--arrow-left'
                          : ''}"
                      >
                        <div
                          class="fd-navigation__list-wrapper
                            {isSemiCollapsed ? 'fd-popover__wrapper' : ''}"
                        >
                          {#if isSemiCollapsed}
                            <div
                              class="fd-navigation__item fd-navigation__item--title"
                              aria-level="1"
                              role="treeitem"
                              aria-expanded="true"
                              aria-selected="false"
                              title={resolveTooltipText(nodes, $getTranslation(key))}
                              data-testid={getTestIdForCat(nodes.metaInfo, key)}
                            >
                              <!-- svelte-ignore a11y-missing-attribute -->
                              <a class="fd-navigation__link" role="button" tabindex="0">
                                {#if hasCategoriesWithIcon && nodes.metaInfo.icon}
                                  {#if isOpenUIiconName(nodes.metaInfo.icon)}
                                    <span
                                      class="fd-navigation__icon {getSapIconStr(nodes.metaInfo.icon)}"
                                      role="presentation"
                                      aria-hidden="true"
                                    />
                                  {:else}
                                    <span class="fd-navigation__icon" role="presentation" aria-hidden="true">
                                      <img
                                        src={nodes.metaInfo.icon}
                                        alt={nodes.metaInfo.altText ? nodes.metaInfo.altText : ''}
                                      />
                                    </span>
                                  {/if}
                                {/if}
                                <span class="fd-navigation__text">{$getTranslation(key)}</span>
                                <span class="fd-navigation__selection-indicator" />
                              </a>
                            </div>
                          {/if}

                          <ul class="fd-navigation__list fd-navigation__list--child-items" role="tree" tabindex="-1">
                            {#each nodes as node}
                              {#if !node.hideFromNav}
                                {#if node.label}
                                  <li class="fd-navigation__list-item">
                                    <div
                                      class="fd-navigation__item fd-navigation__item--child"
                                      aria-level="3"
                                      role="treeitem"
                                      title={resolveTooltipText(node, getNodeLabel(node))}
                                      aria-expanded="false"
                                      aria-selected={node === selectedNode}
                                      data-testid={NavigationHelpers.getTestId(node)}
                                    >
                                      <a
                                        class="fd-navigation__link"
                                        tabindex="0"
                                        href={getRouteLink(node)}
                                        on:click={(event) => {
                                          NavigationHelpers.handleNavAnchorClickedWithoutMetaKey(event) &&
                                            handleClick(node);
                                        }}
                                        on:keyup={!addNavHrefForAnchor
                                          ? (event) => handleEnterPressed(event, node)
                                          : undefined}
                                      >
                                        <span
                                          class="fd-navigation__text badge-align-{node.statusBadge &&
                                          node.statusBadge.align === 'right'
                                            ? 'right'
                                            : 'left'}"
                                        >
                                          {getNodeLabel(node)}
                                          <StatusBadge {node} />
                                        </span>
                                        <span
                                          class="fd-navigation__selection-indicator"
                                          role="presentation"
                                          aria-hidden="true"
                                          aria-label="selection indicator"
                                        />
                                        {#if node.externalLink && node.externalLink.url}
                                          <span
                                            class="fd-navigation__external-link-indicator"
                                            role="presentation"
                                            aria-hidden="true"
                                            aria-label="external link indicator"
                                          />
                                        {/if}
                                        {#if node.badgeCounter}
                                          <BadgeCounter {node} />
                                        {/if}
                                      </a>
                                    </div>
                                  </li>

                                  <li
                                    style="display: none;"
                                    class="fd-nested-list__item"
                                    aria-labelledby="collapsible_listnode_{index}"
                                  >
                                    <a
                                      href={getRouteLink(node)}
                                      class="fd-nested-list__link {node === selectedNode ? 'is-selected' : ''}"
                                      on:click={(event) => {
                                        NavigationHelpers.handleNavAnchorClickedWithoutMetaKey(event) &&
                                          handleClick(node);
                                      }}
                                      on:keyup={!addNavHrefForAnchor
                                        ? (event) => handleEnterPressed(event, node)
                                        : undefined}
                                      role={!addNavHrefForAnchor ? 'button' : undefined}
                                      tabindex="0"
                                      data-testid={NavigationHelpers.getTestId(node)}
                                      title={resolveTooltipText(node, getNodeLabel(node))}
                                    >
                                      <span
                                        class="fd-nested-list__title badge-align-{node.statusBadge &&
                                        node.statusBadge.align === 'right'
                                          ? 'right'
                                          : 'left'}"
                                      >
                                        {getNodeLabel(node)}
                                        <StatusBadge {node} />
                                      </span>

                                      {#if node.externalLink && node.externalLink.url}
                                        <i class="sap-icon--action" />
                                      {/if}
                                      {#if node.badgeCounter}
                                        <BadgeCounter {node} />
                                      {/if}
                                    </a>
                                  </li>
                                {/if}
                              {/if}
                            {/each}
                          </ul>
                        </div>
                      </div>
                    {/if}
                  </li>
                {/if}
              {/each}
            </LeftNavGroup>
          {/each}

          <li class="lui-spacer" role="presentation" aria-hidden="true" />

          <li class="fd-navigation__list-item fd-navigation__list-item--overflow">
            <div class="fd-navigation__item lui-nav-more" aria-haspopup="menu" role="menuitem" aria-expanded="false">
              <!-- svelte-ignore a11y-missing-attribute -->
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <a
                class="fd-navigation__link"
                role="button"
                tabindex="0"
                on:click={displayMoreButtonMenu}
                on:keypress={(event) => {
                  (event.code === 'Enter' || event.code === 'Space') && displayMoreButtonMenu(event);
                }}
              >
                <span class="fd-navigation__icon sap-icon--overflow" role="presentation" aria-hidden="true" />
                <span class="fd-navigation__text">More Items</span>
              </a>
            </div>
            <div class="fd-navigation__list-container fd-navigation__list-container--menu fd-menu" aria-hidden="false">
              <div class="fd-navigation__list-wrapper">
                <ul class="lui-moreItems" />
              </div>
            </div>
          </li>
        </ul>
      </div>
    {/if}
  </div>
{:else}
  <div
    class="fd-app__sidebar fd-navigation {hideNavComponent ? 'hideNavComponent' : ''} {footerText ||
    semiCollapsibleButton
      ? 'hasFooter'
      : ''} {footerText && !semiCollapsibleButton ? 'hasOnlyFooterText' : ''}"
  >
    {#if navHeader}
      <div class="lui-nav-title" bind:this={navHeaderContainer}>
        {#if !navHeader.renderer}
          <ul class="fd-nested-list">
            <li class="fd-nested-list__item">
              <!-- svelte-ignore a11y-missing-attribute -->
              <a class="fd-nested-list__link" title={resolveTooltipText(navHeader, $getTranslation(navHeader.label))}>
                {#if navHeader.icon}
                  {#if isOpenUIiconName(navHeader.icon)}
                    <i
                      class="lui-header-icon fd-nested-list__icon sap-icon {getSapIconStr(navHeader.icon)}"
                      role="presentation"
                    />
                  {:else}
                    <span class="fd-nested-list__icon sap-icon">
                      <img src={navHeader.icon} alt={navHeader.altText ? navHeader.altText : ''} />
                    </span>
                  {/if}
                {/if}
                <span class="fd-nested-list__title">{$getTranslation(navHeader.label)}</span>
                {#if navHeader.showUpLink}
                  <i
                    class="lui-nav-up fd-nested-list__icon sap-icon sap-icon--navigation-up-arrow"
                    role="presentation"
                    title={$getTranslation('luigi.navigation.up')}
                    on:click|preventDefault={handleUp}
                  />
                {/if}
              </a>
            </li>
          </ul>
        {/if}
      </div>
    {/if}
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->

    {#if vegaSideNav}
      <nav
        class="fd-side-nav {isSemiCollapsed ? 'is-collapsed' : ''} {vegaSideNav ? 'vega-nav' : ''} {navHeader
          ? 'lui-nav-header-visible'
          : ''} {sideNavCompactMode ? 'is-compact' : ''}"
        aria-roledescription="Main Navigation"
        bind:this={vegaNavCnt}
      >
      <div class="fd-side-nav__container fd-side-nav__container--top">
        <ul class="fd-navigation-list level-1" role="tree" aria-roledescription="Navigation List Tree">
          {#if children && pathData.length > 1}
          {#each sortedVerticalNavGroups as group}
                <LeftNavGroup
                  navGroup={group}
                  vega={vegaSideNav}
                  expanded={group.groupEntry && isExpanded(group.groupEntry[1], expandedCategories)}
                >
                  {#each group.entries as [key, nodes], index}
                    {#if key === 'undefined' || key.startsWith(virtualGroupPrefix)}
                      <!-- Single nodes -->
                      {#each nodes as node}
                        {#if !node.hideFromNav}
                          {#if node.label}
                            <li
                              is-in-group={!group.isSingleEntry}
                              class="fd-navigation-list__item lui-nav-entry"
                              role="none"
                            >
                              <!-- svelte-ignore a11y-role-has-required-aria-props -->
                              <a
                                class="fd-navigation-list__content {node === selectedNode ? 'is-selected' : ''}"
                                role="treeitem"
                                tabindex="0"
                                href={getRouteLink(node)}
                                title={resolveTooltipText(node, getNodeLabel(node))}
                                on:click={(event) => {
                                  NavigationHelpers.handleNavAnchorClickedWithoutMetaKey(event) && handleClick(node);
                                }}
                                on:keyup={!addNavHrefForAnchor ? (event) => handleEnterPressed(event, node) : undefined}
                                data-testid={NavigationHelpers.getTestId(node)}
                                on:mouseup={(event) => {
                                  isSemiCollapsed && event.target.blur();
                                }}
                              >
                                <div class="fd-navigation-list__content-container">
                                  {#if node.icon}
                                    <span class="fd-navigation-list__icon">
                                      {#if isOpenUIiconName(node.icon)}
                                        <i class="lui-hideOnHover-show {getSapIconStr(node.icon)}" role="presentation"
                                        ></i>
                                      {:else}
                                        <img
                                          src={node.icon}
                                          alt={node.altText ? node.altText : ''}
                                          class="lui-hideOnHover-show"
                                        />
                                      {/if}
                                    </span>
                                  {:else if isSemiCollapsed}
                                    <span class="fd-navigation-list__icon">
                                      <i
                                        class="lui-hideOnHover-show test sap-icon--rhombus-milestone-2"
                                        role="presentation"
                                      />
                                    </span>
                                  {/if}
                                  <span
                                    class="fd-navigation-list__text badge-align-{node.statusBadge &&
                                    !isSemiCollapsed &&
                                    node.statusBadge.align === 'right'
                                      ? 'right'
                                      : 'left'}"
                                  >
                                    {getNodeLabel(node)}
                                    <StatusBadge {node} />

                                    {#if node.badgeCounter}
                                      <BadgeCounter {node} />
                                    {/if}
                                  </span>
                                </div>
                                {#if node.externalLink && node.externalLink.url}
                                  <div
                                    class="fd-navigation-list__indication-arrow"
                                    role="presentation"
                                    aria-hidden="true"
                                  >
                                    <i class="sap-icon--arrow-right" role="presentation"></i>
                                  </div>
                                {/if}
                              </a>
                            </li>
                          {/if}
                        {/if}
                      {/each}
                    {:else if nodes.filter((node) => !node.hideFromNav && node.label).length > 0}
                      <!-- Category Nodes-->
                      <!-- svelte-ignore a11y-click-events-have-key-events -->
                      <li
                        is-in-group={!group.isSingleEntry}
                        class="fd-navigation__list-item {isSemiCollapsed ? 'fd-popover__control' : ''} lui-nav-entry"
                        data-testid={getTestIdForCat(nodes.metaInfo, key)}
                        on:click|stopPropagation={(event) => handleIconClick(nodes, event.currentTarget)}
                      >
                        <!-- svelte-ignore a11y-missing-attribute -->
                        <a
                          class="fd-navigation-list__content"
                          role="treeitem"
                          tabindex="0"
                          aria-expanded={isSemiCollapsed
                            ? nodes.metaInfo && nodes.metaInfo.label === selectedCategory
                            : isExpanded(nodes, expandedCategories)}
                          aria-selected={isSemiCollapsed && nodes.indexOf(selectedNode) >= 0}
                          on:click|preventDefault={() =>
                            setExpandedState(nodes, !isExpanded(nodes, expandedCategories), this)}
                          on:keypress|preventDefault={() =>
                            setExpandedState(nodes, !isExpanded(nodes, expandedCategories), this)}
                          on:keypress|preventDefault={(event) => handleExpandCollapseCategories(event, nodes)}
                        >
                          <div class="fd-navigation-list__content-container">
                            {#if isOpenUIiconName(nodes.metaInfo.icon)}
                              <span class="fd-navigation-list__icon">
                                <i
                                  class="{getSapIconStr(nodes.metaInfo.icon)} {isSemiCollapsed && !nodes.metaInfo.icon
                                    ? 'sap-icon--rhombus-milestone-2'
                                    : ''}"
                                  role="presentation"
                                ></i>
                              </span>
                            {:else}
                              <span class="fd-navigation-list__icon" role="presentation" aria-hidden="true">
                                <img
                                  src={nodes.metaInfo.icon}
                                  alt={nodes.metaInfo.altText ? nodes.metaInfo.altText : ''}
                                />
                              </span>
                            {/if}
                            <span class="fd-navigation-list__text">{$getTranslation(key)}</span>
                          </div>
                          <div class="fd-navigation-list__navigation-indicator" role="presentation" aria-hidden="true">
                            {#if !isSemiCollapsed && isExpanded(nodes, expandedCategories)}
                              <i class="sap-icon--navigation-down-arrow" role="presentation"></i>
                            {:else}
                              <i class="sap-icon--navigation-right-arrow" role="presentation"></i>
                            {/if}
                          </div>
                        </a>
                        {#if isSemiCollapsed || isExpanded(nodes, expandedCategories)}
                          <LeftNavCollapsedWrapper
                            label={$getTranslation(key)}
                            icon={nodes.metaInfo.icon}
                            collapsedMode={isSemiCollapsed}
                            expanded={isSemiCollapsed
                              ? nodes.metaInfo && nodes.metaInfo.label === selectedCategory
                              : isExpanded(nodes, expandedCategories)}
                          >
                            <ul class="fd-navigation-list level-2" role="group" tabindex="-1">
                              {#each nodes as node}
                                {#if !node.hideFromNav}
                                  {#if node.label}
                                    <li class="fd-navigation-list__item" role="none">
                                      <!-- svelte-ignore a11y-role-has-required-aria-props -->
                                      <a
                                        class="fd-navigation-list__content {node === selectedNode ? 'is-selected' : ''}"
                                        role="treeitem"
                                        tabindex="0"
                                        href={getRouteLink(node)}
                                        title={resolveTooltipText(node, getNodeLabel(node))}
                                        on:click={(event) => {
                                          NavigationHelpers.handleNavAnchorClickedWithoutMetaKey(event) &&
                                            handleClick(node);
                                        }}
                                        on:keyup={!addNavHrefForAnchor
                                          ? (event) => handleEnterPressed(event, node)
                                          : undefined}
                                        data-testid={NavigationHelpers.getTestId(node)}
                                        on:mouseup={(event) => {
                                          isSemiCollapsed && event.target.blur();
                                        }}
                                      >
                                        <div class="fd-navigation-list__content-container">
                                          <span
                                            class="fd-navigation-list__text badge-align-{node.statusBadge &&
                                            !isSemiCollapsed &&
                                            node.statusBadge.align === 'right'
                                              ? 'right'
                                              : 'left'}"
                                          >
                                            {getNodeLabel(node)}
                                            <StatusBadge {node} />

                                            {#if node.badgeCounter}
                                              <BadgeCounter {node} />
                                            {/if}
                                          </span>
                                        </div>
                                        {#if node.externalLink && node.externalLink.url}
                                          <div
                                            class="fd-navigation-list__indication-arrow"
                                            role="presentation"
                                            aria-hidden="true"
                                          >
                                            <i class="sap-icon--arrow-right" role="presentation"></i>
                                          </div>
                                        {/if}
                                      </a>
                                    </li>
                                  {/if}
                                {/if}
                              {/each}
                            </ul>
                          </LeftNavCollapsedWrapper>
                        {/if}
                      </li>
                    {/if}
                  {/each}
                </LeftNavGroup>
              {/each}
              {/if}

              <LeftNavMore collapsedMode={isSemiCollapsed}></LeftNavMore>
            </ul>
          </div>
        <!-- Vega footer -->
        {#if displayFooterWhenCollapsed && footerText}
          <div class="fd-side-nav__utility">
            <span class="lui-side-nav__footer" data-testid="lui-side-nav__footer">
              <span
                class="lui-side-nav__footer--text-visible fd-has-type-minus-1"
                data-testid="lui-side-nav__footer--text-visible">{footerText ? footerText : ''}</span
              >
            </span>
          </div>
        {:else if (footerText || semiCollapsibleButton) && !isSemiCollapsed}
          <div class="fd-side-nav__utility">
            <span class="lui-side-nav__footer" data-testid="lui-side-nav__footer">
              <span class="lui-side-nav__footer--text fd-has-type-minus-1" data-testid="lui-side-nav__footer--text"
                >{footerText ? footerText : ''}</span
              >
              {#if semiCollapsibleButton}
                {#if semiCollapsibleButtonStyle == 'button'}
                  <button
                    on:click={(event) => semiCollapsibleButtonClicked(event, this)}
                    data-testid="semiCollapsibleButton"
                    title={burgerTooltip}
                    tabindex="0"
                    class="fd-button fd-button--transparent fd-button--cozy lui-semi-btn"
                  >
                    <i
                      class="lui-side-nav__footer--icon {isSemiCollapsed
                        ? 'sap-icon--open-command-field'
                        : 'sap-icon--close-command-field'}"
                    />
                  </button>
                {:else}
                  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
                  <!-- svelte-ignore a11y-no-static-element-interactions -->
                  <i
                    class="lui-side-nav__footer--icon {isSemiCollapsed
                      ? 'sap-icon--open-command-field'
                      : 'sap-icon--close-command-field'}"
                    on:click={(event) => semiCollapsibleButtonClicked(event, this)}
                    on:keydown={(event) => handleEnterSemiCollapseBtn(event, this)}
                    data-testid="semiCollapsibleButton"
                    title={burgerTooltip}
                    tabindex="0"
                  />
                {/if}
              {/if}
            </span>
          </div>
        {/if}
      </nav>
    {:else}
      <nav
        class="fd-side-nav {isSemiCollapsed ? 'fd-side-nav--condensed' : ''} {navHeader
          ? 'lui-nav-header-visible'
          : ''}"
        on:keyup={handleKey}
        data-testid="semiCollapsibleLeftNav"
      >
        <div class="fd-side-nav__main-navigation">
          {#if children && pathData.length > 0 && (pathData[0].topNav === false || pathData.length > 1)}
            <div class="lui-fd-side-nav-wrapper">
              <ul class={sideNavCompactMode ? 'fd-nested-list fd-nested-list--compact' : 'fd-nested-list'}>
                {#each sortedChildrenEntries as [key, nodes], index}
                  {#if key === 'undefined' || key.startsWith(virtualGroupPrefix)}
                    <!-- Single nodes -->
                    {#each nodes as node}
                      {#if !node.hideFromNav}
                        {#if node.label}
                          <li class="fd-nested-list__item">
                            <a
                              href={getRouteLink(node)}
                              title={resolveTooltipText(node, getNodeLabel(node))}
                              class="fd-nested-list__link {node === selectedNode ? 'is-selected' : ''}"
                              on:click={(event) => {
                                NavigationHelpers.handleNavAnchorClickedWithoutMetaKey(event) && handleClick(node);
                              }}
                              tabindex="0"
                              on:keyup={!addNavHrefForAnchor ? (event) => handleEnterPressed(event, node) : undefined}
                              role={!addNavHrefForAnchor ? 'button' : undefined}
                              data-testid={NavigationHelpers.getTestId(node)}
                            >
                              {#if node.icon}
                                {#if isOpenUIiconName(node.icon)}
                                  <i
                                    class="fd-nested-list__icon sap-icon {getSapIconStr(node.icon)}"
                                    role="presentation"
                                  />
                                {:else}
                                  <span class="fd-nested-list__icon sap-icon">
                                    <img src={node.icon} alt={node.altText ? node.altText : ''} />
                                  </span>
                                {/if}
                              {:else}
                                <i
                                  class="fd-nested-list__icon sap-icon {isSemiCollapsed
                                    ? 'sap-icon--rhombus-milestone-2'
                                    : ''}"
                                  role="presentation"
                                />
                              {/if}
                              <span
                                class="fd-nested-list__title badge-align-{node.statusBadge &&
                                node.statusBadge.align === 'right'
                                  ? 'right'
                                  : 'left'}"
                                >{getNodeLabel(node)}
                                <StatusBadge {node} />
                              </span>
                              {#if node.externalLink && node.externalLink.url}
                                <i class="fd-nested-list__icon sap-icon sap-icon--action" role="presentation" />
                              {/if}
                              {#if node.badgeCounter}
                                <BadgeCounter {node} />
                              {/if}
                            </a>
                          </li>
                        {/if}
                      {/if}
                    {/each}
                  {:else if nodes.filter((node) => !node.hideFromNav && node.label).length > 0}
                    <!-- Collapsible nodes -->
                    {#if nodes.metaInfo.collapsible}
                      <!-- svelte-ignore a11y-click-events-have-key-events -->
                      <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                      <li
                        class="fd-nested-list__item lui-collapsible-item"
                        class:lui-item-expanded={isExpanded(nodes, expandedCategories)}
                        on:click|stopPropagation={() => handleIconClick(nodes, event.currentTarget)}
                        data-testid={getTestIdForCat(nodes.metaInfo, key)}
                      >
                        <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                        <div
                          class="fd-nested-list__content has-child"
                          on:keypress={(event) => handleExpandCollapseCategories(event, nodes)}
                          tabindex={isSemiCollapsed ? '0' : '-1'}
                        >
                          <a
                            title={resolveTooltipText(nodes, $getTranslation(key))}
                            class="fd-nested-list__link {isExpanded(nodes, expandedCategories) ? 'is-expanded' : ''}"
                            tabindex={isSemiCollapsed ? '-1' : '0'}
                            role={!addNavHrefForAnchor ? 'button' : undefined}
                            id="collapsible_listnode_{index}"
                            aria-haspopup="true"
                            aria-expanded={isExpanded(nodes, expandedCategories)}
                            on:click|preventDefault={() =>
                              setExpandedState(nodes, !isExpanded(nodes, expandedCategories), this)}
                          >
                            {#if isOpenUIiconName(nodes.metaInfo.icon)}
                              <i
                                class="fd-nested-list__icon sap-icon {getSapIconStr(
                                  nodes.metaInfo.icon
                                )} {isSemiCollapsed && !nodes.metaInfo.icon ? 'sap-icon--rhombus-milestone-2' : ''}"
                                role="presentation"
                              />
                            {:else}
                              <span class="fd-nested-list__icon sap-icon">
                                <img
                                  src={nodes.metaInfo.icon}
                                  alt={nodes.metaInfo.altText ? nodes.metaInfo.altText : ''}
                                />
                              </span>
                            {/if}
                            <span class="fd-nested-list__title">{$getTranslation(key)}</span>
                          </a>
                          <button
                            class="fd-button fd-nested-list__button"
                            href="#"
                            tabindex="0"
                            aria-label="Expand categories"
                            aria-haspopup="true"
                            aria-expanded={isExpanded(nodes, expandedCategories)}
                            title={setTitleForCategoryButton(nodes, expandedCategories)}
                            on:click|preventDefault={() =>
                              setExpandedState(nodes, !isExpanded(nodes, expandedCategories), this)}
                          >
                            <i
                              class={isExpanded(nodes, expandedCategories)
                                ? 'sap-icon--navigation-down-arrow'
                                : 'sap-icon--navigation-right-arrow'}
                              role="presentation"
                            />
                          </button>
                        </div>
                        <ul
                          class="fd-nested-list fd-nested-list--text-only level-2"
                          aria-hidden={!isExpanded(nodes, expandedCategories)}
                        >
                          {#each nodes as node}
                            {#if !node.hideFromNav}
                              {#if node.label}
                                <li class="fd-nested-list__item" aria-labelledby="collapsible_listnode_{index}">
                                  <a
                                    href={getRouteLink(node)}
                                    class="fd-nested-list__link {node === selectedNode ? 'is-selected' : ''}"
                                    on:click={(event) => {
                                      NavigationHelpers.handleNavAnchorClickedWithoutMetaKey(event) &&
                                        handleClick(node);
                                    }}
                                    on:keyup={!addNavHrefForAnchor
                                      ? (event) => handleEnterPressed(event, node)
                                      : undefined}
                                    role={!addNavHrefForAnchor ? 'button' : undefined}
                                    tabindex="0"
                                    data-testid={NavigationHelpers.getTestId(node)}
                                    title={resolveTooltipText(node, getNodeLabel(node))}
                                  >
                                    <span
                                      class="fd-nested-list__title badge-align-{node.statusBadge &&
                                      node.statusBadge.align === 'right'
                                        ? 'right'
                                        : 'left'}"
                                    >
                                      {getNodeLabel(node)}
                                      <StatusBadge {node} />
                                    </span>

                                    {#if node.externalLink && node.externalLink.url}<i class="sap-icon--action" />{/if}
                                    {#if node.badgeCounter}
                                      <BadgeCounter {node} />
                                    {/if}
                                  </a>
                                </li>
                              {/if}
                            {/if}
                          {/each}
                        </ul>
                        <!-- Flyout for collapsible nodes -->
                        {#if nodes.metaInfo && nodes.metaInfo.label === selectedCategory}
                          <div class="lui-flyout-sublist">
                            <div class="lui-flyout-sublist__wrapper">
                              <h5 class="lui-flyout-sublist__title fd-has-type-minus-1 fd-has-color-text-4">
                                {$getTranslation(key)}
                              </h5>
                              <ul class="fd-nested-list fd-nested-list--text-only">
                                {#each nodes as node}
                                  {#if !node.hideFromNav}
                                    {#if node.label}
                                      <li class="fd-nested-list__item">
                                        <a
                                          href={getRouteLink(node)}
                                          class="fd-nested-list__link {node === selectedNode ? 'is-selected' : ''}"
                                          tabindex="0"
                                          on:click={(event) => {
                                            NavigationHelpers.handleNavAnchorClickedWithoutMetaKey(event) &&
                                              handleClick(node);
                                          }}
                                          on:keyup={!addNavHrefForAnchor
                                            ? (event) => handleEnterPressed(event, node)
                                            : undefined}
                                          role={!addNavHrefForAnchor ? 'button' : undefined}
                                          data-testid={NavigationHelpers.getTestId(node)}
                                          title={resolveTooltipText(node, getNodeLabel(node))}
                                        >
                                          <span
                                            class="fd-nested-list__title badge-align-{node.statusBadge &&
                                            node.statusBadge.align === 'right'
                                              ? 'right'
                                              : 'left'}"
                                          >
                                            {getNodeLabel(node)}
                                            <StatusBadge {node} />
                                          </span>
                                          {#if node.externalLink && node.externalLink.url}
                                            <i class="sap-icon--action" />
                                          {/if}
                                          {#if node.badgeCounter}
                                            <BadgeCounter {node} />
                                          {/if}
                                        </a>
                                      </li>
                                    {/if}
                                  {/if}
                                {/each}
                              </ul>
                            </div>
                          </div>
                        {/if}
                      </li>
                    {:else}
                      <!-- Category nodes -->
                      <li
                        class="fd-nested-list__group-header lui-category"
                        title={resolveTooltipText(nodes, $getTranslation(key))}
                        data-testid={getTestIdForCat(nodes.metaInfo, key)}
                        id="category_list_level1_{index}"
                      >
                        {#if hasCategoriesWithIcon && nodes.metaInfo.icon}
                          {#if isOpenUIiconName(nodes.metaInfo.icon)}
                            <i
                              class="fd-nested-list__icon sap-icon {nodes.metaInfo.icon
                                ? getSapIconStr(nodes.metaInfo.icon)
                                : ''}"
                              role="presentation"
                            />
                          {:else}
                            <span class="fd-nested-list__icon sap-icon">
                              <img
                                src={nodes.metaInfo.icon}
                                alt={nodes.metaInfo.altText ? nodes.metaInfo.altText : ''}
                              />
                            </span>
                          {/if}
                        {/if}
                        {$getTranslation(key)}
                      </li>
                      {#each nodes as node}
                        {#if !node.hideFromNav}
                          {#if node.label}
                            <li
                              class="fd-nested-list__item"
                              title={resolveTooltipText(node, getNodeLabel(node))}
                              aria-labelledby="category_list_level1_{index}"
                            >
                              <a
                                href={getRouteLink(node)}
                                tabindex="0"
                                class="fd-nested-list__link {node === selectedNode ? 'is-selected' : ''}"
                                on:click={(event) => {
                                  NavigationHelpers.handleNavAnchorClickedWithoutMetaKey(event) && handleClick(node);
                                }}
                                on:keyup={!addNavHrefForAnchor ? (event) => handleEnterPressed(event, node) : undefined}
                                role={!addNavHrefForAnchor ? 'button' : undefined}
                                data-testid={NavigationHelpers.getTestId(node)}
                              >
                                {#if node.icon}
                                  {#if isOpenUIiconName(node.icon)}
                                    <i class="fd-nested-list__icon sap-icon {getSapIconStr(node.icon)}" />
                                  {:else}
                                    <span class="fd-nested-list__icon sap-icon">
                                      <img src={node.icon} alt={node.altText ? node.altText : ''} />
                                    </span>
                                  {/if}
                                {:else}
                                  <i
                                    class="fd-nested-list__icon sap-icon {isSemiCollapsed
                                      ? 'sap-icon--rhombus-milestone-2'
                                      : ''}"
                                  />
                                  <span>{isSemiCollapsed ? 'sap-icon--rhombus-milestone-2' : ''}</span>
                                {/if}
                                <span
                                  class="fd-nested-list__title badge-align-{node.statusBadge &&
                                  node.statusBadge.align === 'right'
                                    ? 'right'
                                    : 'left'}"
                                  >{getNodeLabel(node)}
                                  {#if node.statusBadge}
                                    <StatusBadge {node} />
                                  {/if}
                                </span>

                                {#if node.externalLink && node.externalLink.url}<i class="sap-icon--action" />{/if}
                                {#if node.badgeCounter}
                                  <BadgeCounter {node} />
                                {/if}
                              </a>
                            </li>
                          {/if}
                        {/if}
                      {/each}
                    {/if}
                  {/if}
                {/each}
              </ul>
            </div>
          {/if}
        </div>
        {#if footerText || semiCollapsibleButton}
          <div class="fd-side-nav__utility">
            <span class="lui-side-nav__footer" data-testid="lui-side-nav__footer">
              <span class="lui-side-nav__footer--text fd-has-type-minus-1" data-testid="lui-side-nav__footer--text"
                >{footerText ? footerText : ''}</span
              >
              {#if semiCollapsibleButton}
                {#if semiCollapsibleButtonStyle == 'button'}
                  <button
                    on:click={(event) => semiCollapsibleButtonClicked(event, this)}
                    data-testid="semiCollapsibleButton"
                    title={burgerTooltip}
                    tabindex="0"
                    class="fd-button fd-button--transparent fd-button--cozy lui-semi-btn"
                  >
                    <i
                      class="lui-side-nav__footer--icon {isSemiCollapsed
                        ? 'sap-icon--open-command-field'
                        : 'sap-icon--close-command-field'}"
                    />
                  </button>
                {:else}
                  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
                  <!-- svelte-ignore a11y-no-static-element-interactions -->
                  <i
                    class="lui-side-nav__footer--icon {isSemiCollapsed
                      ? 'sap-icon--open-command-field'
                      : 'sap-icon--close-command-field'}"
                    on:click={(event) => semiCollapsibleButtonClicked(event, this)}
                    on:keydown={(event) => handleEnterSemiCollapseBtn(event, this)}
                    data-testid="semiCollapsibleButton"
                    title={burgerTooltip}
                    tabindex="0"
                  />
                {/if}
              {/if}
            </span>
          </div>
        {/if}
      </nav>
    {/if}
  </div>
{/if}

<style lang="scss">
  $footerPaddingVertical: 13px;
  $footerHeight: calc(16px + (2 * #{$footerPaddingVertical}));

  a {
    cursor: pointer;
    outline-offset: -1px;
    user-select: none;
    -webkit-user-select: none;
  }

  :global(html.luigi-app-in-custom-container) {
    .fd-app__sidebar {
      position: absolute;
    }
  }

  :global(.lui-global-nav-visible) .fd-app__sidebar {
    left: $globalNavWidth;
    .fd-side-nav {
      width: var(--luigi__left-sidenav--width);
    }
  }

  :global(.semiCollapsed) .lui-fd-side-nav-wrapper {
    scrollbar-width: none;

    &::-webkit-scrollbar {
      width: 0;
    }
  }

  :global(body:not(.semiCollapsed)) .fd-app__sidebar .fd-side-nav.lui-nav-header-visible {
    height: auto;
    top: $navHeaderHeight;
    position: absolute;
    bottom: 0;
  }

  :global(.semiCollapsed) .fd-app__sidebar .fd-side-nav {
    height: auto;
    position: absolute;
    top: 0;
    bottom: 0;
  }

  :global(.semiCollapsed) .lui-nav-title {
    display: none;
  }

  :global(.lui-breadcrumb) .fd-app__sidebar {
    top: calc(#{$topNavHeight} + var(--luigi__breadcrumb--height));
  }

  :global(.lui-breadcrumb .vega) .fd-app__sidebar {
    top: $topNavHeight;
  }

  :global(.vega) .fd-app__sidebar {
    .lui-nav-title {
      background: var(--sapList_Background);
      width: 100%;
      padding-top: 0.25rem;
    }
  }

  .fd-app__sidebar {
    position: fixed;
    top: $topNavHeight;
    left: 0;
    bottom: 0;
    z-index: 1;
    width: var(--luigi__left-sidenav--width);

    .lui-fd-side-nav-wrapper {
      display: flex;
      justify-content: space-between;
      flex-direction: column;
    }

    .lui-nav-title {
      height: $navHeaderHeight;
      width: var(--luigi__left-sidenav--width);
      border-bottom: var(--sapList_BorderWidth, 0.0625rem) solid var(--sapList_BorderColor, #e4e4e4);
      border-right: var(--sapList_BorderWidth, 0.0625rem) solid var(--sapGroup_ContentBorderColor, #d9d9d9);

      & > ul {
        height: 100%;
        & > li {
          height: 100%;
        }
      }

      .fd-nested-list__link,
      .fd-nested-list__link:active {
        height: 100%;
        padding-left: 0.5rem;
        background: none;
        cursor: default;

        .fd-nested-list__title {
          font-weight: bold;
          padding-left: 0.3rem;
          color: var(--sapTextColor, #32363a);
        }

        .lui-header-icon {
          font-size: 1.5rem;
          color: var(--sapTile_TextColor, #6a6d70);
        }

        .lui-nav-up {
          cursor: pointer;
          color: var(--sapTile_TextColor, #6a6d70);
        }
      }
    }
    .fd-side-nav:not(.vega-nav) {
      height: 100%;
      width: var(--luigi__left-sidenav--width);
    }
    .fd-side-nav,
    .fd-side-nav {
      height: 100%;
      //workaround fd v39
      border-right: var(--sapList_BorderWidth) solid;
      border-right-color: var(--sapGroup_ContentBorderColor);
      //workaround end
      &.fd-side-nav--condensed {
        width: $leftNavWidthCollapsed;
      }
    }
    .fd-side-nav__container--top {
      overflow-y: var(--fdSideNav_Overflow, auto);
    }

    .fd-side-nav__main-navigation {
      height: 100%;
      overflow: hidden;
    }

    .fd-side-nav__utility {
      margin-top: 0;

      &:before {
        display: none;
      }
    }

    &.hasFooter {
      .fd-side-nav__main-navigation {
        height: calc(100% - 2rem);
      }
    }

    .lui-flyout-sublist {
      position: absolute;
    }
  }
  .hasOnlyFooterText .fd-side-nav--condensed .fd-side-nav__utility {
    display: none;
  }
  :global(.fd-nested-list__item) {
    &:not(.lui-collapsible-item) {
      .fd-nested-list__link {
        padding-right: 1rem;
      }
    }
  }

  .fd-nested-list__link {
    &:not(.has-child) {
      .fd-nested-list__title {
        padding-right: 5px;
      }
    }
  }

  .fd-nested-list__icon,
  .fd-navigation__icon,
  .fd-navigation-list__icon {
    img {
      max-width: 18px;
      max-height: 18px;
    }
  }

  :global(.fd-nested-list--compact) {
    .fd-nested-list__icon {
      img {
        max-width: 16px;
        max-height: 16px;
      }
    }
  }

  .fd-nested-list__group-header {
    .fd-nested-list__icon {
      margin-left: -1rem;
      font-size: 0.875rem;
      color: var(--sapContent_IconColor, #0854a0);
      height: 74%;

      img {
        max-width: 0.875rem;
        max-height: 0.875rem;
      }
    }
  }

  .lui-category {
    border-top: var(--sapList_BorderWidth) solid var(--sapList_GroupHeaderBorderColor);
  }

  .lui-fd-side-nav-wrapper {
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    background-color: transparent;
    @include transition(width 0.1s linear);
  }

  .lui-side-nav__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: var(--sapList_BorderWidth, 0.0625rem) solid var(--sapList_BorderColor, #e4e4e4);

    &--text,
    &--text-visible {
      color: #32363a;
      color: var(--sapTextColor, #32363a);
      white-space: nowrap;
      width: auto;
      padding: $footerPaddingVertical 15px;
      @include transition(all 0.1s linear);
      text-overflow: ellipsis;
      overflow: hidden;
      max-width: 100%;
    }

    &--icon {
      cursor: pointer;
      padding: $footerPaddingVertical 15px;
    }

    .lui-semi-btn {
      margin: var(--sapContent_FocusWidth);
      color: var(--sapContent_IconColor);
      width: calc($leftNavWidthCollapsed - 2 * (var(--fdButton_Outline_Offset) + var(--sapContent_FocusWidth)));
    }

    .lui-semi-btn &--icon {
      padding: 0;
    }
    .lui-semi-btn:focus:after {
      border: none;
    }
  }

  :global(.lui-semiCollapsible) {
    .fd-app__sidebar {
      @include transition(width 0.1s linear);
    }

    .lui-side-nav__footer {
      &--text {
        max-width: calc(100% - 50px);
      }
    }
  }

  .fd-nested-list .fd-nested-list__title {
    display: inline-block;
    height: auto;
  }

  /* BTP CSS */
  .fd-navigation--vertical {
    .lui-nav-title {
      padding-bottom: 1rem;

      .fd-nested-list {
        border-bottom: none;
      }
    }

    .fd-navigation__container--top > .fd-navigation__list {
      padding-top: 0.125rem;
    }
  }
  .fd-nested-list .fd-nested-list__title.badge-align-right,
  .fd-navigation__text.badge-align-right,
  .fd-navigation-list__text.badge-align-right {
    display: flex;
    align-items: center;
    :global(.fd-object-status) {
      margin-left: auto;
    }
  }

  .fd-navigation--snapped .lui-spacer {
    flex-grow: 1;
  }

  .fd-navigation:not(.fd-navigation--snapped) .lui-spacer {
    min-height: 0.125rem;
  }

  .fd-navigation--snapped .lui-moreItems {
    padding: 0;
  }

  .fd-navigation--snapped .fd-navigation__list-container--menu.fd-navigation__list-container--menu {
    top: auto;
    bottom: 0;
    max-height: 100%;
  }

  .fd-navigation--snapped .fd-navigation__list-item--overflow {
    position: static;
  }

  .fd-navigation--snapped .fd-popover {
    .fd-popover__body--after {
      padding: 0.5rem;
      max-height: 80vh;
      transform: translateY(calc(0px - (var(--lui_popover_offset))));
      &:after,
      &:before {
        transform: translateY(var(--lui_popover_offset));
      }
    }
  }

  .fd-navigation--snapped .lui-moreItems .fd-popover {
    width: 100%;
    --lui_popover_offset: 0px;
    .fd-popover__body--after {
      .fd-navigation__item--title {
        display: none;
      }
    }
  }

  .fd-side-nav:not(.fd-side-nav--condensed) .fd-nested-list__content.has-child {
    .fd-nested-list__link {
      max-width: calc(100% - 2.5rem);
    }
  }

  :global(.semiCollapsed) {
    .fd-nested-list.level-2 {
      display: none;
    }

    .fd-app__sidebar {
      width: $leftNavWidthCollapsed;
      .lui-fd-side-nav-wrapper {
        min-width: auto;
        width: calc(#{$leftNavWidthCollapsed} + 70px);
        padding-right: 70px;
        margin-right: -70px;
      }
    }

    :global(.isBlocked .lui-fd-side-nav-wrapper) {
      overflow: hidden !important;
    }

    .lui-side-nav {
      &__footer {
        &--text {
          width: 0;
          opacity: 0;
          padding: 0;
          visibility: hidden;
        }

        &--icon {
          padding-left: 14px;
          padding-right: 14px;
        }
      }
    }
    .hasOnlyFooterText {
      .fd-side-nav__main-navigation {
        height: 100%;
      }
    }
  }

  :global(.lui-flyout-sublist__title) {
    padding: 11px 12px 12px;
    text-transform: uppercase;
    margin: 0;
  }

  :global(.lui-flyout-sublist) {
    position: fixed;
    left: 48px;
    width: 180px;

    .lui-flyout-sublist__wrapper {
      position: relative;
      border-radius: var(--sapElement_BorderCornerRadius, 0.25rem);
      @include box-shadow(
        var(--sapContent_Shadow2, (0 0 0 0.0625rem rgba(0, 0, 0, 0.42), 0 0.625rem 1.275rem 0 rgba(0, 0, 0, 0.3)))
      );
      opacity: 0;
      animation-name: flyoutAnimation;
      animation-duration: 0.3s;
      animation-fill-mode: forwards;
      .lui-flyout-sublist__title {
        background: var(--sapList_Background, #fff);
      }

      @keyframes flyoutAnimation {
        0% {
          opacity: 0;
        }
        100% {
          opacity: 1;
        }
      }

      &:before,
      &:after {
        display: block;
        position: absolute;
        top: 13px;
        content: '';
        width: 13px;
        border-style: solid;
        border-width: 8px 6.5px;
        border-color: transparent;
      }

      &:before {
        left: -14px;
        border-right-color: var(--sapContent_ForegroundBorderColor, #89919a);
      }

      &:after {
        left: -13px;
        border-right-color: var(--sapGroup_ContentBackground, #fff);
      }

      & > *:first-child {
        border-top-right-radius: var(--sapElement_BorderCornerRadius, 0.25rem);
        border-top-left-radius: var(--sapElement_BorderCornerRadius, 0.25rem);
      }

      & > *:last-child {
        border-bottom-right-radius: var(--sapElement_BorderCornerRadius, 0.25rem);
        border-bottom-left-radius: var(--sapElement_BorderCornerRadius, 0.25rem);
      }
    }

    .fd-nested-list {
      display: block;
      position: relative;
      max-height: 190px;
      overflow-y: auto;
    }

    &:global(.has-bottom-position .lui-flyout-sublist__wrapper) {
      &:before,
      &:after {
        top: auto;
        bottom: 9px;
      }
    }
  }

  .fd-nested-list__button:focus {
    outline-offset: -0.1875rem;
    outline-width: var(--sapContent_FocusWidth);
    outline-color: var(--sapContent_FocusColor);
    outline-style: var(--sapContent_FocusStyle);
  }

  .fd-side-nav--condensed .lui-fd-side-nav-wrapper > .fd-nested-list {
    & > .fd-nested-list__button,
    & > .fd-nested-list__group-header,
    & > .fd-nested-list__title {
      display: none;
    }
  }

  .fd-navigation-list__content {
    text-decoration: none;
  }

  .fd-side-nav__container--top > .fd-navigation-list {
    flex-grow: 1;

    :global(.lui-more) {
      margin-bottom: 0.5rem;
    }
  }
</style>
