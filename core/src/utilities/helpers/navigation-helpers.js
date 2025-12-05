// Helper methods for 'navigation.js' file. They don't require any method from 'navigation.js` but are required by them.
import { reject, get } from 'lodash';
import { LuigiAuth, LuigiConfig, LuigiFeatureToggles, LuigiI18N } from '../../core-api';
import { Navigation } from '../../navigation/services/navigation';
import { Routing } from '../../services/routing';
import { AuthHelpers, GenericHelpers, IframeHelpers, RoutingHelpers } from './';

class NavigationHelpersClass {
  constructor() {
    this.EXP_CAT_KEY = 'luigi.preferences.navigation.expandedCategories';
    this.COL_NAV_KEY = 'luigi.preferences.navigation.collapsedNavigation';
    this.COLLAPSED_SUPER_CATEGORIES_KEY = 'luigi.preferences.navigation.collapsedSuperCategories';
    this.virtualGroupPrefix = '___';
  }

  getProductSwitcherConfig() {
    const userConfig = LuigiConfig.getConfigValue('navigation.productSwitcher');
    return Object.assign({ icon: 'grid', label: 'My Products' }, userConfig);
  }

  getProductSwitcherColumnsNumber() {
    const productSwitcherConfig = this.getProductSwitcherConfig();
    if (!productSwitcherConfig.items) return;
    let productSwitcherColumns = productSwitcherConfig.columns;
    let productSwitcherItemsAmount;
    if (GenericHelpers.isFunction(productSwitcherConfig.items)) {
      productSwitcherItemsAmount = productSwitcherConfig.items().length;
    } else {
      productSwitcherItemsAmount = productSwitcherConfig.items.length;
    }
    if (productSwitcherColumns === 'auto') {
      if (productSwitcherItemsAmount <= 6) {
        return (productSwitcherConfig.columns = 3);
      } else {
        return (productSwitcherConfig.columns = 4);
      }
    } else {
      return productSwitcherConfig.columns === 3 ? 3 : 4;
    }
  }

  prepareForTests(...parts) {
    let result = '';
    parts.forEach((p) => {
      if (p) {
        result += (result ? '_' : '') + encodeURIComponent(p.toLowerCase().split(' ').join(''));
      }
    });
    return result;
  }

  checkVisibleForFeatureToggles(nodeToCheckPermission) {
    if (nodeToCheckPermission && nodeToCheckPermission.visibleForFeatureToggles) {
      const activeFeatureToggles = LuigiFeatureToggles.getActiveFeatureToggleList();
      for (const ft of nodeToCheckPermission.visibleForFeatureToggles) {
        if (ft.startsWith('!')) {
          if (activeFeatureToggles.includes(ft.slice(1))) {
            return false;
          }
        } else {
          if (!activeFeatureToggles.includes(ft)) {
            return false;
          }
        }
      }
    }
    return true;
  }

  isNodeAccessPermitted(nodeToCheckPermissionFor, parentNode, currentContext) {
    if (LuigiAuth.isAuthorizationEnabled()) {
      const loggedIn = AuthHelpers.isLoggedIn();
      const anon = nodeToCheckPermissionFor.anonymousAccess;

      if ((loggedIn && anon === 'exclusive') || (!loggedIn && anon !== 'exclusive' && anon !== true)) {
        return false;
      }
    }

    if (!this.checkVisibleForFeatureToggles(nodeToCheckPermissionFor)) return false;

    const permissionCheckerFn = LuigiConfig.getConfigValue('navigation.nodeAccessibilityResolver');
    if (typeof permissionCheckerFn !== 'function') {
      return true;
    }
    return permissionCheckerFn(nodeToCheckPermissionFor, parentNode, currentContext);
  }

  applyContext(context, addition, navigationContext) {
    if (addition) {
      for (var p in addition) {
        context[p] = addition[p];
      }
    }
    if (navigationContext) {
      context.parentNavigationContexts.unshift(navigationContext);
    }
    return context;
  }

  getNodePath(node) {
    return RoutingHelpers.getNodePath(node, null);
  }

  groupNodesBy(nodes, property, useVirtualGroups) {
    const defaultTooltipForExpandCollapseCategories = LuigiConfig.getConfigValue('navigation.defaults.category');
    let result = {};
    let groupCounter = 0;
    let virtualGroupCounter = 0;

    const orderNodes = (nodes) => {
      nodes.sort((a, b) => {
        const oa = a.order || 0;
        const ob = b.order || 0;
        return oa - ob;
      });
    };

    nodes.forEach((node) => {
      let key;
      let metaInfo;
      const category = node[property];
      if (GenericHelpers.isObject(category)) {
        key = category.id ? category.id : category.label;
        metaInfo = Object.assign({}, category);
      } else {
        key = category;
        if (useVirtualGroups && !category) {
          key = this.virtualGroupPrefix + virtualGroupCounter;
        }
        metaInfo = {
          label: key,
          _fromString: true
        };
      }

      let arr = result[key];
      if (!arr) {
        if (useVirtualGroups && category) {
          virtualGroupCounter++;
        }
        if (metaInfo.order === undefined || metaInfo.order === null || metaInfo.order === '') {
          metaInfo.order = key ? groupCounter++ : -1;
        }
        arr = [];
        result[key] = arr;
      }
      if (!arr.metaInfo) {
        arr.metaInfo = metaInfo;
      }
      if (GenericHelpers.isObject(category) && arr.metaInfo._fromString) {
        delete arr.metaInfo._fromString;
        arr.metaInfo = { ...arr.metaInfo, ...category };
      }
      if (GenericHelpers.isObject(category) && defaultTooltipForExpandCollapseCategories) {
        category.titleExpandButton
          ? (arr.metaInfo.titleExpandButton = category.titleExpandButton)
          : (arr.metaInfo.titleExpandButton = defaultTooltipForExpandCollapseCategories.titleExpandButton);
        category.titleCollapseButton
          ? (arr.metaInfo.titleCollapseButton = category.titleCollapseButton)
          : (arr.metaInfo.titleCollapseButton = defaultTooltipForExpandCollapseCategories.titleCollapseButton);
      }
      if (!arr.metaInfo.categoryUid && key) {
        arr.metaInfo.categoryUid = node.parent ? this.getNodePath(node.parent) + ':' + key : key;
      }
      // Previously we skipped pushing hideFromNav nodes, but we need them now for TabNav logic
      arr.push(node);
    });
    Object.keys(result).forEach((category) => {
      const metaInfo = result[category].metaInfo;
      if (metaInfo && metaInfo.id) {
        if (!result[metaInfo.label]) {
          result[metaInfo.label] = result[metaInfo.id];
        } else {
          let displayLabel = metaInfo.label + ' ';
          while (result[displayLabel]) {
            displayLabel += ' ';
          }
          result[displayLabel] = result[metaInfo.id];
          metaInfo.label = displayLabel;
        }
        delete result[metaInfo.id];
      }
    });

    Object.keys(result).forEach((category) => {
      orderNodes(result[category]);
      if (result[category].length === 0) {
        delete result[category];
      }
    });
    return result;
  }

  generateTooltipText(node, translation) {
    let ttText = node.tooltipText;
    if (ttText === undefined) {
      ttText = LuigiConfig.getConfigValue('navigation.defaults.tooltipText');
    }

    if (ttText === undefined) {
      return translation;
    } else if (ttText === false) {
      return '';
    } else {
      return LuigiI18N.getTranslation(ttText);
    }
  }

  async generateTopNavNodes(pathData) {
    const rawChildren = pathData[0].topNav === false ? [] : await Navigation.getFilteredChildren(pathData[0]);
    let selectedNode = null;
    let visibleNodeCount = 0;
    let globalNavNodeCount = 0;
    let cats = {};
    const children = [];
    let badgeCountsToSumUp = [];

    for (const node of rawChildren) {
      pathData.forEach((n) => {
        if (!selectedNode && n === node) {
          selectedNode = node;
        }
      });

      if (!node.hideFromNav) {
        visibleNodeCount++;
        if (node.globalNav) {
          globalNavNodeCount++;
        }
      }

      let badgeCount;
      const hasBadge = !!node.badgeCounter;
      if (hasBadge) {
        badgeCount = await node.badgeCounter.count();
      }

      if (node.category) {
        const catLabel = node.category.label || node.category;
        if (cats[catLabel]) {
          if (!cats[catLabel].icon) {
            cats[catLabel].icon = node.category.icon;
            cats[catLabel].altText = node.category.altText;
          }
          if (hasBadge && !cats[catLabel].badgeCounter) {
            cats[catLabel].badgeCounter = {
              label: '',
              count: () => badgeCount
            };
          } else if (hasBadge) {
            const updatedCount = cats[catLabel].badgeCounter.count() + badgeCount;
            cats[catLabel].badgeCounter.count = () => updatedCount;
          }
        } else {
          cats[catLabel] = {
            isCat: true,
            label: catLabel,
            icon: node.category.icon,
            altText: node.category.altText,
            children: [],
            badgeCounter: hasBadge && { label: '', count: () => badgeCount }
          };
          children.push(cats[catLabel]);
        }
        cats[catLabel].children.push(node);
      } else {
        children.push(node);
      }

      if (badgeCount) {
        badgeCountsToSumUp.push(badgeCount);
      }
    }
    for (let i = 0; i < children.length; i++) {
      if (children[i].isCat) {
        children[i].visibleChildren = (await Navigation.getChildren(children[i])) || [];
      }
    }
    const tnd = {
      children,
      selectedNode,
      visibleNodeCount,
      globalNavNodeCount
    };

    if (badgeCountsToSumUp.length) {
      const badgeCountSum = badgeCountsToSumUp.reduce((a, b) => a + b);
      tnd.totalBadgeNode = {
        badgeCounter: {
          count: () => badgeCountSum,
          label: ''
        }
      };
    }
    return tnd;
  }

  /**
   * Returns if sideNavAccordionMode is true or false
   * @param {*} selectedNode
   * @returns if sideNavAccordionMode is true or false
   */
  getSideNavAccordionMode(selectedNode) {
    let sideNavAccordionModeOverride =
      (selectedNode && selectedNode.sideNavAccordionMode) ||
      (selectedNode && selectedNode.parent && selectedNode.parent.sideNavAccordionMode);
    if (typeof sideNavAccordionModeOverride !== 'undefined') {
      return sideNavAccordionModeOverride;
    } else {
      return LuigiConfig.getConfigBooleanValue('navigation.defaults.sideNavAccordionMode');
    }
  }

  loadExpandedCategories() {
    let expandedList = [];
    const expString = localStorage.getItem(this.EXP_CAT_KEY);
    if (expString) {
      try {
        expandedList = JSON.parse(expString);
      } catch (e) {
        console.warn('Preference data corrupted, using default');
      }
    }
    return expandedList;
  }

  storeCollapsedSuperCategoriesState(key, value) {
    let collapsedList = GenericHelpers.parseJSON(localStorage.getItem(this.COLLAPSED_SUPER_CATEGORIES_KEY)) || [];

    if (value) {
      collapsedList = collapsedList.filter((item) => item !== key);
    } else {
      if (!collapsedList.includes(key)) {
        collapsedList.push(key);
      }
    }

    localStorage.setItem(this.COLLAPSED_SUPER_CATEGORIES_KEY, JSON.stringify(collapsedList));
  }

  isCollapsedSuperCategory(key) {
    const collapsedList = GenericHelpers.parseJSON(localStorage.getItem(this.COLLAPSED_SUPER_CATEGORIES_KEY)) || [];
    return collapsedList.includes(key);
  }

  storeExpandedState(key, value, replace = false) {
    let expandedList = this.loadExpandedCategories();

    //get conxtext for siblings
    let context = key.split(':')[0];
    if (value) {
      if (replace) {
        // Filter out other categories
        expandedList = expandedList.filter((f) => f.indexOf(context + ':') === -1);
      }

      if (expandedList.indexOf(key) < 0) {
        expandedList.push(key);
      }
    } else {
      let index = expandedList.indexOf(key);
      if (index >= 0) {
        expandedList.splice(index, 1);
      }
    }
    localStorage.setItem(this.EXP_CAT_KEY, JSON.stringify(expandedList));
    return expandedList;
  }

  isOpenUIiconName(string) {
    return /^[a-z0-9\-]+$/i.test(string);
  }

  /**
   * Checks, if icon class is businessSuiteInAppSymbols or TNT suite and renders the icon name accordingly
   * I.e. will return sap-icon--home or sap-icon-TNT--systemjava or sap-icon-businessSuiteInAppSymbols--birthday
   * @param {*} iconString - icon name
   * @returns properly formatted icon name.
   */
  renderIconClassName(iconString) {
    if (!iconString) return '';
    let iconClass = 'sap-icon-';
    if (iconString.startsWith('businessSuiteInAppSymbols') || iconString.startsWith('TNT')) {
      iconClass += iconString;
    } else {
      iconClass += '-' + iconString;
    }
    return iconClass;
  }

  handleUnresponsiveClient(node) {
    if (node.errorFn) {
      node.errorFn();
    } else {
      console.warn('Something went wrong with a client! You will be redirected to another page.');
      const path = node.redirectPath || '/';
      Routing.navigateTo(path);
    }
  }

  getBurgerTooltipConfig() {
    const burgerTooltipSettings = LuigiConfig.getConfigValue('settings.burgerTooltip');
    if (GenericHelpers.isObject(burgerTooltipSettings) || burgerTooltipSettings === true) {
      const expandNavTooltip = burgerTooltipSettings.navExpanded
        ? LuigiI18N.getTranslation(burgerTooltipSettings.navExpanded)
        : 'Collapse navigation';
      const collapseNavTooltip = burgerTooltipSettings.navCollapsed
        ? LuigiI18N.getTranslation(burgerTooltipSettings.navCollapsed)
        : 'Expand navigation';
      return [collapseNavTooltip, expandNavTooltip];
    }
    return undefined;
  }

  /* istanbul ignore next */
  stripNode(node) {
    const strippedNode = { ...node };
    delete strippedNode.parent;
    delete strippedNode.children;
    delete strippedNode.navHeader;
    return strippedNode;
  }

  /**
   * Checks if for the given node path navigation should be prevented or not
   * @param {string} nodepath - path to check
   * @returns {boolean} navigation should be prevented or not
   */
  async shouldPreventNavigationForPath(nodepath) {
    const { nodeObject } = await Navigation.extractDataFromPath(nodepath);
    if (await Navigation.shouldPreventNavigation(nodeObject)) {
      return true;
    }
    return false;
  }

  /**
   * Returns a nested property value defined by a chain string
   * @param {*} obj - the object
   * @param {*} propChain - a string defining the property chain
   * @param {*} fallback - fallback value if resolution fails
   * @returns the value or fallback
   */
  getPropertyChainValue(obj, propChain, fallback) {
    if (!propChain || !obj) {
      return fallback;
    }
    return get(obj, propChain, fallback);
  }

  substituteVars(resolver, context) {
    const resolverString = JSON.stringify(resolver);
    const resString = resolverString.replace(/\$\{[a-zA-Z0-9$_.]+\}/g, (match) => {
      const chain = match.substr(2, match.length - 3);
      return this.getPropertyChainValue(context, chain) || match;
    });
    return JSON.parse(resString);
  }

  _fetch(url, options) {
    return fetch(url, options);
  }

  processTitleData(data, resolver) {
    let label = this.getPropertyChainValue(data, resolver.titlePropertyChain);
    if (label) {
      label = label.trim();
    }
    if (label && resolver.titleDecorator) {
      label = resolver.titleDecorator.replace('%s', label);
    }
    const titleData = {
      label: label || resolver.fallbackTitle,
      icon: this.getPropertyChainValue(data, resolver.iconPropertyChain, resolver.fallbackIcon)
    };

    return titleData;
  }

  async fetchNodeTitleData(node, context) {
    return new Promise((resolve, reject) => {
      if (!node.titleResolver) {
        reject(new Error('No title resolver defined at node'));
        return;
      }
      const strippedResolver = { ...node.titleResolver };
      delete strippedResolver._cache;

      const resolver = this.substituteVars(strippedResolver, context);
      const resolverString = JSON.stringify(resolver);
      if (node.titleResolver._cache) {
        if (node.titleResolver._cache.key === resolverString) {
          resolve(node.titleResolver._cache.value);
          return;
        }
      }

      const requestOptions = resolver.request;

      this._fetch(requestOptions.url, {
        method: requestOptions.method,
        headers: requestOptions.headers,
        body: JSON.stringify(requestOptions.body)
      })
        .then((response) => {
          response.json().then((data) => {
            try {
              const titleData = this.processTitleData(data, resolver, node);
              node.titleResolver._cache = {
                key: resolverString,
                value: titleData
              };
              resolve(titleData);
            } catch (e) {
              reject(e);
            }
          });
        })
        .catch((error) => {
          reject(error);
        });
    }).catch((error) => {
      reject(error);
    });
  }

  /**
   * This function checks if the CTRL, CMD or SHIFT key is pressed on the click event.
   * If one of these keyboard controls is pressed, default behavior (open in new tab/window) should be allowed.
   * In addition custom behavior that might be inflicted from any parent click event should be stopped,
   * to make way for the default behavior, ergo the stopPropagation() function in the else condition.
   * If none of the buttons is pressed, then the default behavior is prevented and the custom behavior fn takes over.
   * @param {*} event - the click event to be handled
   * @returns {boolean} true if keyboard meta controls are not pressed, false otherwise
   */
  handleNavAnchorClickedWithoutMetaKey(event) {
    // keyboard Meta keys are not pressed
    if (!(event.ctrlKey || event.metaKey || event.shiftKey)) {
      event.preventDefault();
      return true;
    } else {
      // keyboard meta keys are pressed
      event.stopPropagation();
      return false;
    }
  }

  /**
   * Replace the node label with the live custom data from the view group settings.
   * @param {Object} node
   * @returns node label
   */
  getNodeLabel(node) {
    let label = LuigiI18N.getTranslation(node.label);
    const vg = this.findViewGroup(node);

    if (vg) {
      const vgSettings = this.getViewGroupSettings(vg) || {};
      let cdata = { ...(vgSettings.customData || {}), ...(vgSettings._liveCustomData || {}) };
      label = GenericHelpers.replaceVars(label, cdata, 'viewGroupData.');
    }

    return label;
  }

  getParentNode(node, pathData) {
    let res = node.parent;
    if (!res && pathData.length > 0 && pathData[1] === node) {
      res = pathData[0];
    }
    return res;
  }

  /**
   * Returns the whole viewgroup settings from config.
   * @returns {Object} viewgroup settings from config
   */
  getAllViewGroupSettings() {
    return LuigiConfig.getConfigValue('navigation.viewGroupSettings');
  }

  /**
   * Retrieves the settings for a specific view group.
   * @param {string} viewGroup - the name of the view group for which settings are to be retrieved
   * @returns {Object} The settings for the specified view group. If the view group is not found, an empty object is returned.
   */
  getViewGroupSettings(viewGroup) {
    const viewGroupSettings = this.getAllViewGroupSettings();
    if (viewGroup && viewGroupSettings && viewGroupSettings[viewGroup]) {
      return viewGroupSettings[viewGroup];
    } else {
      return {};
    }
  }

  /**
   * Recursively finds the view group associated with a given node in a hierarchical structure.
   * @param {Object} node - the current node being examined
   * @param {Object} [originalNode] - the original node from which the search started
   * @returns {string | undefined} The view group associated with the node, or undefined if not found.
   */
  findViewGroup(node, originalNode) {
    if (node.viewGroup) {
      if (originalNode && originalNode !== node) {
        if (
          node.viewUrl &&
          originalNode.viewUrl &&
          IframeHelpers.getLocation(node.viewUrl) === IframeHelpers.getLocation(originalNode.viewUrl)
        ) {
          return node.viewGroup;
        }

        return undefined;
      } else {
        return node.viewGroup;
      }
    } else if (node.parent) {
      return this.findViewGroup(node.parent, originalNode || node);
    }
  }

  /**
   * Generates the test ID of a navigation node.
   * If the node has a test ID, it returns the test ID.
   * Otherwise, it prepares a test ID using the node's path segment and label.
   * @param node - The navigation node.
   * @returns The test ID of the navigation node.
   */
  getTestId(node) {
    return node.testId ? node.testId : NavigationHelpers.prepareForTests(node.pathSegment, node.label);
  }
}

export const NavigationHelpers = new NavigationHelpersClass();
