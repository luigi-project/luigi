<script>
  import Alerts from './Alerts.svelte';
  import ConfirmationModal from './ConfirmationModal.svelte';
  import Modal from './Modal.svelte';
  import UserSettingsDialog from './UserSettingsDialog.svelte';
  import Backdrop from './Backdrop.svelte';
  import SplitView from './SplitView.svelte';
  import LeftNav from './navigation/LeftNav.svelte';
  import TopNav from './navigation/TopNav.svelte';
  import TabNav from './navigation/TabNav.svelte';
  import GlobalNav from './navigation/GlobalNav.svelte';
  import Breadcrumb from './navigation/Breadcrumb.svelte';
  import { afterUpdate, beforeUpdate, onMount, setContext, createEventDispatcher } from 'svelte';
  import { CSS_BREAKPOINTS } from './utilities/constants';
  import { KEYCODE_ESC } from './utilities/keycode.js';
  import {
    EventListenerHelpers,
    GenericHelpers,
    StateHelpers,
    RoutingHelpers,
    IframeHelpers,
    AuthHelpers,
    StorageHelper,
    UserSettingsHelper,
    NavigationHelpers
  } from './utilities/helpers';
  import {
    LuigiI18N,
    LuigiConfig,
    LuigiElements,
    LuigiGlobalSearch,
    LuigiTheming,
    LuigiRouting,
    LuigiUX
  } from './core-api';
  import { Navigation } from './navigation/services/navigation';
  import { Routing } from './services/routing';
  import { Iframe } from './services/iframe';
  import { SplitViewSvc } from './services/split-view';
  import { ViewGroupPreloading } from './services/preloading';
  import { MessagesListeners } from './services/messages-listeners';
  import { thirdPartyCookiesStatus } from './utilities/third-party-cookies-check.js';
  import { NodeDataManagementStorage } from './services/node-data-management.js';

  const dispatch = createEventDispatcher();

  export let store;
  export let getTranslation;

  let showLoadingIndicator = false;

  let mfSplitView = {
    displayed: false
  };
  let splitViewValues;

  /// MFs
  let modal;
  let activeDrawer = false;
  let disableBackdrop;
  let drawerIframe;
  let drawerIframeData;
  let drawerWC;
  let drawerWCData;
  let drawer;
  let splitViewIframe;
  let splitViewIframeData;
  let splitViewWC;
  let splitViewWCData;
  let splitView;
  let context;
  let nodeParams;
  let pathParams;
  let urlParamsRaw;
  let currentNode;
  let viewUrl;
  let viewGroup;
  let isolateView;
  let pageErrorHandler;
  let previousNodeValues;
  let isNavigationSyncEnabled = true;
  let isNavigateBack = false;
  let goBackContext;
  let navigationPath;
  let contentNode;
  let preservedViews = [];
  let unsavedChanges = {
    isDirty: false,
    persistUrl: null
  };
  let simpleSlideInNav;
  let responsiveNavSetting;
  let tabNav;
  let resizeTabNavToggle = false;
  let thirdPartyCookiesCheck;
  let searchProvider;
  let internalUserSettingsObject = {};
  let burgerTooltip;
  let breadcrumbsEnabled;
  let contextRequested = false;
  let loadingIndicatorTimeout;
  let btpToolLayout =
    LuigiConfig.getConfigValue('settings.btpToolLayout') &&
    GenericHelpers.requestExperimentalFeature('btpToolLayout', true);
  let vegaLayout = LuigiConfig.getConfigValue('settings.sideNav.style') === 'vega';

  export let isSearchFieldVisible;
  export let inputElem;
  export let customSearchItemRendererSlot;
  export let displaySearchResult;
  export let searchResult;
  export let storedUserSettings;

  const prepareInternalData = async (config) => {
    const iframeConf = config.iframe.luigi;
    const userSettingsGroupName = iframeConf.currentNode && iframeConf.currentNode.userSettingsGroup;
    const userSettingGroups = await LuigiConfig.readUserSettings();
    const hasUserSettings =
      userSettingsGroupName && typeof userSettingGroups === 'object' && userSettingGroups !== null;
    const internalData = IframeHelpers.applyCoreStateData({
      isNavigateBack,
      viewStackSize: preservedViews.length,
      clientPermissions: iframeConf.nextViewUrl ? iframeConf.nextClientPermissions : iframeConf.clientPermissions,
      thirdPartyCookieCheck: await LuigiConfig.getConfigValue('settings.thirdPartyCookieCheck'),
      userSettings: hasUserSettings ? userSettingGroups[userSettingsGroupName] : null,
      anchor: LuigiRouting.getAnchor(),
      cssVariables: await LuigiTheming.getCSSVariables()
    });

    IframeHelpers.specialIframeTypes
      .map((o) => o.iframeConfigKey)
      .forEach((key) => {
        internalData[key] = config[key] || false;
      });

    return internalData;
  };

  const sendContextToClient = async (config, goBackContext = {}) => {
    if (!config.iframe) {
      console.debug('iframe does not exist, not able to send context.');
      return;
    }

    const message = {
      msg: 'luigi.init',
      context: JSON.stringify(Object.assign({}, config.context || context, goBackContext)),
      nodeParams: JSON.stringify(Object.assign({}, config.nodeParams || nodeParams)),
      pathParams: JSON.stringify(Object.assign({}, config.pathParams || pathParams)),
      searchParams: JSON.stringify(
        Object.assign({}, RoutingHelpers.prepareSearchParamsForClient(config.iframe.luigi.currentNode))
      ),
      internal: JSON.stringify(await prepareInternalData(config)),
      authData: AuthHelpers.getStoredAuthData()
    };
    config.iframe.luigi._lastUpdatedMessage = message;
    IframeHelpers.sendMessageToIframe(config.iframe, message);
  };
  const sendAuthDataToClient = (authData) => {
    const message = {
      msg: 'luigi.auth.tokenIssued',
      authData
    };
    IframeHelpers.broadcastMessageToAllIframes(message);
  };

  //// NAVIGATION

  const addPreserveView = (data, config) => {
    if (data.params.preserveView || data.params.viewgroup) {
      const nextPath = buildPath(data.params);
      const nodePath = Routing.getNodePath(currentNode, urlParamsRaw);

      preservedViews.push({
        path:
          config.iframe.luigi && config.iframe.luigi.pathParams
            ? GenericHelpers.replaceVars(nodePath, config.iframe.luigi.pathParams, ':', false)
            : nodePath,
        nextPath: nextPath.startsWith('/') ? nextPath : '/' + nextPath,
        context
      });

      // Mark iframe with pv if there is a preserved view situation
      config.iframe['pv'] = 'pv';
    }
  };

  const handleNavigation = (data, config, srcNode, srcPathParams) => {
    let path = buildPath(data.params, srcNode, srcPathParams);
    const { preventHistoryEntry, preserveQueryParams, preventContextUpdate } = data.params;

    const options = {
      keepBrowserHistory: !preventHistoryEntry,
      navSync: isNavigationSyncEnabled,
      preventContextUpdate
    };

    path = GenericHelpers.addLeadingSlash(path);
    path = preserveQueryParams ? RoutingHelpers.composeSearchParamsToRoute(path) : path;
    addPreserveView(data, config);

    // Navigate to the raw path. Any errors/alerts are handled later.
    // Make sure we use `replaceState` instead of `pushState` method if navigation sync is disabled.
    return Routing.navigateTo(path, options);
  };

  const removeQueryParams = (str) => str.split('?')[0];

  const isValidBackRoute = (preservedViews, routeHash) => {
    if (preservedViews.length === 0) {
      return false;
    }
    // we're only checking the previous goBack state and
    // compare it with the new route
    const routePath = routeHash.startsWith('/') ? routeHash : `/${routeHash}`;
    const lastPreservedView = [...preservedViews].pop();
    const paths = [removeQueryParams(lastPreservedView.path), removeQueryParams(lastPreservedView.nextPath)];
    return paths.includes(removeQueryParams(routePath));
  };

  /**
   * Clears the dirty state when dirty state promise resolves and dirty state is not needed anymore
   * @param source used for drawers/modals/split view wc and iframe when source is needed to differentiate which mf is affected
   */
  const clearDirtyState = (source) => {
    if (unsavedChanges && unsavedChanges.dirtySet) {
      if (source) {
        unsavedChanges.dirtySet.delete(source);
      } else {
        unsavedChanges.dirtySet.clear();
      }
    }
  };

  const getUnsavedChangesModalPromise = (source) => {
    return new Promise((resolve, reject) => {
      if (shouldShowUnsavedChangesModal(source)) {
        showUnsavedChangesModal().then(
          () => {
            clearDirtyState();
            resolve();
          },
          () => {
            reject();
          }
        );
      } else {
        resolve();
      }
    });
  };

  //TODO refactor
  const getComponentWrapper = () => {
    return {
      get: () => {
        return {
          unsavedChanges,
          hideNav,
          viewUrl,
          nodeParams,
          viewGroup,
          urlParamsRaw,
          currentNode,
          navigationPath,
          context,
          pathParams,
          hideGlobalSearch,
          hideSideNav,
          isolateView,
          pageErrorHandler,
          previousNodeValues,
          mfSplitView,
          splitViewValues,
          splitViewIframe,
          splitViewWC,
          showLoadingIndicator,
          tabNav,
          isNavigateBack,
          goBackContext,
          isNavigationSyncEnabled
        };
      },
      set: (obj) => {
        if (obj) {
          noAnimation = false;
          Object.getOwnPropertyNames(obj).forEach((prop) => {
            if (prop === 'hideNav') {
              hideNav = obj.hideNav;
            } else if (prop === 'viewUrl') {
              viewUrl = obj.viewUrl;
            } else if (prop === 'nodeParams') {
              nodeParams = obj.nodeParams;
            } else if (prop === 'viewGroup') {
              viewGroup = obj.viewGroup;
            } else if (prop === 'urlParamsRaw') {
              urlParamsRaw = obj.urlParamsRaw;
            } else if (prop === 'currentNode') {
              currentNode = obj.currentNode;
            } else if (prop === 'navigationPath') {
              navigationPath = obj.navigationPath;
            } else if (prop === 'context') {
              context = obj.context;
            } else if (prop === 'pathParams') {
              pathParams = obj.pathParams;
            } else if (prop === 'hideGlobalSearch') {
              hideGlobalSearch = obj.hideGlobalSearch;
            } else if (prop === 'hideSideNav') {
              if (hideSideNav != obj.hideSideNav) {
                noAnimation = true;
                setTimeout(() => {
                  const appNode = document.querySelector('#app');
                  if (appNode) {
                    appNode.classList.remove('no-animation');
                  }
                });
              }
              hideSideNav = obj.hideSideNav;
            } else if (prop === 'isolateView') {
              isolateView = obj.isolateView;
            } else if (prop === 'pageErrorHandler') {
              pageErrorHandler = obj.pageErrorHandler;
            } else if (prop === 'previousNodeValues') {
              previousNodeValues = obj.previousNodeValues;
            } else if (prop === 'mfSplitView') {
              mfSplitView = obj.mfSplitView;
            } else if (prop === 'splitViewValues') {
              splitViewValues = obj.splitViewValues;
            } else if (prop === 'splitViewIframe') {
              splitViewIframe = obj.splitViewIframe;
            } else if (prop == 'splitViewWC') {
              splitViewWC = obj.splitViewWC;
            } else if (prop === 'showLoadingIndicator') {
              if (obj.showLoadingIndicator === true) {
                clearTimeout(loadingIndicatorTimeout);
                loadingIndicatorTimeout = setTimeout(() => {
                  showLoadingIndicator = true;
                }, 250);
              } else {
                showLoadingIndicator = false;
                clearTimeout(loadingIndicatorTimeout);
              }
            } else if (prop === 'tabNav') {
              tabNav = obj.tabNav;
            } else if (prop === 'isNavigateBack') {
              isNavigateBack = obj.isNavigateBack;
            } else if (prop === 'goBackContext') {
              goBackContext = obj.goBackContext;
            } else if (prop === 'isNavigationSyncEnabled') {
              isNavigationSyncEnabled = obj.isNavigationSyncEnabled;
            }
          });
        }
      },
      shouldShowUnsavedChangesModal,
      getUnsavedChangesModalPromise,
      showUnsavedChangesModal,
      showAlert,
      prepareInternalData,
      dispatch
    };
  };

  const enableRouting = (node, config) => {
    // initial route handling
    StateHelpers.doOnStoreChange(store, () => {
      const wc_container = document.querySelector('.wcContainer');
      if (wc_container) wc_container.configChangedRequest = true;

      NodeDataManagementStorage.deleteCache();
      const currentPath = Routing.getCurrentPath();
      Routing.handleRouteChange(currentPath, getComponentWrapper(), node, config);
    }, ['navigation.nodes']);

    // subsequential route handling
    RoutingHelpers.addRouteChangeListener((path, eventDetail) => {
      const { withoutSync, preventContextUpdate } = eventDetail || {};
      const pv = preservedViews;
      // TODO: check if bookmarkable modal is interferring here
      if (!isValidBackRoute(pv, path)) {
        preservedViews = [];
        Iframe.removeInactiveIframes(node);
      }
      for (let i = mfModalList.length; i--; ) {
        closeModal(i);
      }

      // remove backdrop
      LuigiUX.removeBackdrop();

      closeSplitView();

      Routing.handleRouteChange(path, getComponentWrapper(), node, config, withoutSync, preventContextUpdate);
    });
  };

  const getSubPath = (node, nodePathParams) => {
    return GenericHelpers.replaceVars(Routing.getNodePath(node), nodePathParams, ':', false);
  };

  const buildPath = (params, srcNode, srcNodePathParams) => {
    const localNode = srcNode || currentNode;
    const localPathParams = srcNodePathParams || pathParams;
    let localNavPath = navigationPath;
    if (srcNode) {
      let parent = srcNode.parent;
      localNavPath = [srcNode];
      while (parent) {
        localNavPath.push(parent);
        parent = parent.parent;
      }
      localNavPath = [...localNavPath].reverse();
    }
    let path = params.link;
    if (params.fromVirtualTreeRoot) {
      // from a parent node specified with virtualTree: true
      const node = [...localNavPath].reverse().find((n) => n.virtualTree);
      if (!node) {
        console.error(
          'LuigiClient Error: fromVirtualTreeRoot() is not possible because you are not inside a Luigi virtualTree navigation node.'
        );
        return;
      }
      path = Routing.concatenatePath(getSubPath(node, localPathParams), params.link);
    } else if (params.fromParent) {
      // from direct parent
      path = Routing.concatenatePath(getSubPath(localNode.parent, localPathParams), params.link);
    } else if (params.fromClosestContext) {
      // from the closest navigation context
      const node = [...localNavPath].reverse().find((n) => n.navigationContext && n.navigationContext.length > 0);
      path = Routing.concatenatePath(getSubPath(node, localPathParams), params.link);
    } else if (params.fromContext) {
      // from a given navigation context
      const navigationContext = params.fromContext;
      const node = [...localNavPath].reverse().find((n) => navigationContext === n.navigationContext);
      path = Routing.concatenatePath(getSubPath(node, localPathParams), params.link);
    } else if (params.intent) {
      path = RoutingHelpers.getIntentPath(params.link);
    } else if (params.relative) {
      // relative
      path = Routing.concatenatePath(getSubPath(localNode, localPathParams), params.link);
    }
    if (params.nodeParams && Object.keys(params.nodeParams).length > 0) {
      path += path.includes('?') ? '&' : '?';
      Object.entries(params.nodeParams).forEach((entry, index) => {
        path +=
          encodeURIComponent(RoutingHelpers.getContentViewParamPrefix() + entry[0]) +
          '=' +
          encodeURIComponent(entry[1]) +
          (index < Object.keys(params.nodeParams).length - 1 ? '&' : '');
      });
    }
    return path;
  };

  const handleNavClick = (event) => {
    const node = event.detail.node;
    getUnsavedChangesModalPromise().then(
      () => {
        closeLeftNav();
        if (node.openNodeInModal) {
          const route = RoutingHelpers.buildRoute(node, `/${node.pathSegment}`);
          openViewInModal(route, node.openNodeInModal === true ? {} : node.openNodeInModal);
        } else if (node.drawer) {
          const route = RoutingHelpers.buildRoute(node, `/${node.pathSegment}`);
          node.drawer.isDrawer = true;
          openViewInDrawer(route, node.drawer);
        } else {
          getComponentWrapper().set({ isNavigationSyncEnabled: true });
          Routing.handleRouteClick(node, getComponentWrapper());
        }
      },
      () => {}
    );
  };

  const onResizeTabNav = () => {
    resizeTabNavToggle = !resizeTabNavToggle;
  };

  setContext('handleNavigation', handleNavigation);

  ////GLOBALSEARCH

  const checkSearchProvider = (searchProvider) => {
    if (!searchProvider) {
      console.warn('No search provider defined.');
      return false;
    } else {
      return true;
    }

    // check for required searchProvider keys here.
  };
  export const closeSearchField = () => {
    if (checkSearchProvider(searchProvider)) {
      isSearchFieldVisible = false;
    }
  };

  export const openSearchField = () => {
    if (checkSearchProvider(searchProvider)) {
      if (inputElem) {
        isSearchFieldVisible = true;
        inputElem.focus();
      }
    }
  };

  export const clearSearchField = () => {
    if (checkSearchProvider(searchProvider)) {
      if (inputElem) {
        inputElem.value = '';
        closeSearchResult();
      }
    }
  };

  export const toggleSearch = () => {
    isSearchFieldVisible = !isSearchFieldVisible;
    LuigiGlobalSearch.clearSearchField();
  };

  export const getGlobalSearchString = () => {
    if (checkSearchProvider(searchProvider)) {
      if (inputElem) {
        return inputElem.value;
      }
    }
  };

  export const setGlobalSearchString = (searchString) => {
    if (checkSearchProvider(searchProvider)) {
      if (inputElem) {
        inputElem.value = searchString;
        if (GenericHelpers.isFunction(searchProvider.onInput)) {
          searchProvider.onInput();
        } else {
          console.error('onInput is not a function. Please check the global search configuration.');
        }
      }
    }
  };

  export const setSearchInputPlaceholder = (placeholderString) => {
    if (checkSearchProvider(searchProvider) && inputElem) {
      inputElem.placeholder = placeholderString;
    }
  };

  export const showSearchResult = (arr) => {
    if (checkSearchProvider(searchProvider)) {
      if (arr && arr.length > 0) {
        if (GenericHelpers.isFunction(searchProvider.customSearchResultRenderer)) {
          let searchApiObj = {
            fireItemSelected: (item) => {
              searchProvider.onSearchResultItemSelected(item);
            }
          };
          searchProvider.customSearchResultRenderer(arr, customSearchItemRendererSlot, searchApiObj);
        } else {
          displaySearchResult = true;
          searchResult = arr;
        }
      } else {
        console.warn('Search result array is empty.');
      }
    }
  };

  export const closeSearchResult = () => {
    if (checkSearchProvider(searchProvider)) {
      displaySearchResult = false;
      searchResult = [];
      if (customSearchItemRendererSlot) {
        while (customSearchItemRendererSlot.lastElementChild) {
          customSearchItemRendererSlot.removeChild(customSearchItemRendererSlot.lastElementChild);
        }
      }
    }
  };

  export const handleSearchNavigation = (event) => {
    let node = event.detail.node;
    let data = {
      params: {
        link: node.link,
        nodeParams: node.params
      }
    };
    handleNavigation(data);
  };
  //// SPLIT VIEW
  export const openSplitView = (nodepath, settings) => {
    if (mfSplitView.displayed) {
      console.warn('Only one splitview can be opened at a time');
      return;
    }
    mfSplitView = SplitViewSvc.getDefaultData().mfSplitView;
    SplitViewSvc.open(getComponentWrapper(), nodepath, settings);
  };

  export const closeSplitView = () => {
    SplitViewSvc.close(getComponentWrapper());
  };

  export const collapseSplitView = () => {
    SplitViewSvc.collapse(getComponentWrapper());
    mfSplitView.collapsed = true;
  };

  export const expandSplitView = () => {
    SplitViewSvc.expand(getComponentWrapper());
    mfSplitView.collapsed = false;
  };

  export const isSplitViewCollapsed = () => {
    if (mfSplitView.displayed) {
      return mfSplitView.collapsed;
    }
    return false;
  };

  export const isSplitViewExpanded = () => {
    if (mfSplitView.displayed) {
      return !mfSplitView.collapsed;
    }
    return false;
  };

  export const existsSplitView = () => {
    return mfSplitView.displayed;
  };

  const splitViewIframeCreated = (event) => {
    splitViewIframe = event.detail.splitViewIframe;
    splitViewIframeData = event.detail.splitViewIframeData;
    mfSplitView.collapsed = event.detail.collapsed;
  };

  const splitViewStatusChanged = (event) => {
    if (event.detail.displayed !== undefined) {
      mfSplitView.displayed = event.detail.displayed;
    }
    if (event.detail.collapsed !== undefined) {
      mfSplitView.collapsed = event.detail.collapsed;
    }
  };

  const splitViewWCCreated = (event) => {
    splitViewWC = event.detail.splitViewWC;
    splitViewWCData = event.detail.splitViewWCData;
    mfSplitView.collapsed = event.detail.collapsed;
  };

  /// RESIZING

  let hideNav;
  let hideGlobalSearch;
  let hideSideNav;
  let noAnimation;
  let previousWindowWidth;
  let configTag;
  let isHeaderDisabled;

  const closeLeftNav = () => {
    document.body.classList.remove('lui-leftNavToggle');
  };

  const onResize = () => {
    resizeMicrofrontendIframe();

    const isMobileToDesktop =
      window.innerWidth >= CSS_BREAKPOINTS.desktopMinWidth && previousWindowWidth < CSS_BREAKPOINTS.desktopMinWidth;
    const isDesktopToMobile =
      window.innerWidth < CSS_BREAKPOINTS.desktopMinWidth && previousWindowWidth >= CSS_BREAKPOINTS.desktopMinWidth;

    if (isMobileToDesktop || isDesktopToMobile) {
      closeLeftNav();
    }
    previousWindowWidth = window.innerWidth;
  };

  //// ALERTS

  let alerts = [];

  const getAlertWithId = (alertQueue, id) => {
    if (!alertQueue || !(alertQueue.length > 0)) return;
    return alertQueue.filter((alert) => alert.settings.id === id)[0];
  };

  export const showAlert = (settings, openFromClient = false) => {
    const customAlertHandler = LuigiConfig.getConfigValue('settings.customAlertHandler');
    if (GenericHelpers.isFunction(customAlertHandler)) {
      const customReturnValue = customAlertHandler(settings, openFromClient);
      if (customReturnValue !== false) {
        return customReturnValue;
      }
    }
    const currentAlerts = alerts;

    if (!settings.id) {
      //generate the ID in case it hasn't came from an old version of LuigiClient
      settings.id = GenericHelpers.getRandomId();
    }

    if (settings.id && currentAlerts && getAlertWithId(currentAlerts, settings.id)) {
      console.error(`The alert with id '${settings.id}' already exists in a queue, therefore it won't be displayed `);
      return Promise.reject();
    }

    if (settings.closeAfter) {
      setTimeout(() => {
        if (getAlertWithId(alerts, settings.id)) {
          //check if alert hasn't already been closed manually
          handleAlertDismiss(settings.id);
        }
      }, settings.closeAfter);
    }

    return new Promise((resolve, reject) => {
      alerts = [
        ...(currentAlerts || []),
        {
          displayed: true,
          settings,
          openFromClient,
          promise: { resolve }
        }
      ];
    });
  };

  const handleAlertDismiss = (id, dismissKey) => {
    const alert = getAlertWithId(alerts, id);

    if (!alert) {
      console.error('An unexisting alert has been dismissed.', alerts, id);
      return;
    }

    alerts = alerts.filter((a) => a.settings.id !== id);

    if (alert.openFromClient) {
      const iframe = Iframe.getActiveIframe(contentNode);
      const message = {
        msg: 'luigi.ux.alert.hide',
        id,
        dismissKey
      };
      IframeHelpers.sendMessageToIframe(iframe, message);
    } else if (alert.promise) {
      alert.promise.resolve(dismissKey || id);
    }
  };

  const handleAlertDismissExternal = (event) => {
    handleAlertDismiss(event.detail.id, event.detail.dismissKey);
  };

  //// CONFIRMATION MODAL

  let confirmationModal;

  const resetConfirmationModalData = () => {
    confirmationModal = {
      displayed: false,
      content: {},
      openFromClient: false,
      promise: null
    };
  };

  resetConfirmationModalData();

  export const showModal = (settings, openFromClient = false, targetIframe) => {
    return new Promise((resolve, reject) => {
      confirmationModal = {
        displayed: true,
        settings,
        openFromClient,
        promise: { resolve, reject },
        targetIframe
      };
    });
  };

  const handleModalResult = (result) => {
    const { promise, openFromClient, targetIframe } = confirmationModal;

    resetConfirmationModalData();

    if (result) {
      promise.resolve();
    } else {
      promise.reject();
    }

    if (openFromClient && targetIframe) {
      const message = {
        msg: 'luigi.ux.confirmationModal.hide',
        data: { confirmed: result }
      };
      IframeHelpers.sendMessageToIframe(targetIframe, message);
    }
  };

  const shouldShowUnsavedChangesModal = (source) => {
    if (
      //TODO GenericHelpers.canComponentHandleModal(this) &&
      unsavedChanges.dirtySet
    ) {
      if (source) {
        return unsavedChanges.dirtySet.has(source);
      } else if (unsavedChanges.dirtySet.size > 0) {
        return true;
      }
    }
    return false;
  };

  const showUnsavedChangesModal = () => {
    const customHandler = LuigiConfig.getConfigValue('settings.unsavedChangesHandler');
    if (customHandler) {
      return customHandler();
    } else {
      return showModal({
        header: LuigiI18N.getTranslation('luigi.unsavedChangesAlert.header'),
        body: LuigiI18N.getTranslation('luigi.unsavedChangesAlert.body'),
        buttonDismiss: LuigiI18N.getTranslation('luigi.button.dismiss'),
        buttonConfirm: LuigiI18N.getTranslation('luigi.button.confirm')
      });
    }
  };

  export const getDirtyStatus = () => {
    return unsavedChanges.dirtySet ? unsavedChanges.dirtySet.size > 0 : unsavedChanges.isDirty;
  };

  setContext('getUnsavedChangesModalPromise', getUnsavedChangesModalPromise);

  //// MICRO-FRONTEND MODAL
  // list containing the opened modals
  let mfModalList = [];

  /**
   * Resets the mf modal data given the index and updates the 'mfModalList'. If no index given, resets the whole list instead
   * @param index {number|undefined}  the index of the modal to reset
   */
  const resetMicrofrontendModalData = (index, goBackContext) => {
    if (typeof index === 'undefined') {
      // reset all modal list
      mfModalList = [];
      return;
    }
    // remove the item with specified index from the list
    let removedModal;
    mfModalList = mfModalList.filter((item, i) => {
      if (index === i) {
        removedModal = item;
      }
      return index !== i;
    });
    if (removedModal?.mfModal?.openerIframe) {
      const message = {
        msg: 'luigi.navigation.modal.close',
        data: goBackContext
      };
      IframeHelpers.sendMessageToIframe(removedModal.mfModal.openerIframe, message);
    }
  };

  resetMicrofrontendModalData();

  /**
   * Opens the (iframe/wc) view in a modal given in the nodepath
   * @param nodepath {string} the path of the view to open
   * @param settings {Object} the respective modal settings
   */
  const openViewInModal = async (nodepath, settings, openerIframe) => {
    // check if navigation to this path is allowed or not
    if (await NavigationHelpers.shouldPreventNavigationForPath(nodepath)) {
      return;
    }
    // insert modal into the modals list to be viewed on top of other modals
    const newModal = {
      mfModal: {
        displayed: true,
        nodepath,
        settings,
        openerIframe
      }
    };
    mfModalList = [...mfModalList, newModal];

    // check if modalPath feature enable and set URL accordingly
    const showModalPathInUrl = LuigiConfig.getConfigBooleanValue('routing.showModalPathInUrl');

    //  only show the modal path in the URL when the first modal is opened.
    if (showModalPathInUrl && mfModalList.length === 1) {
      Routing.appendModalDataToUrl(nodepath, settings);
    }
  };

  /**
   * Event handler called when the iframe of the modal is created inside Modal component
   * @param event {Object} event data of the instantiated Modal component instance
   * @param index {number} the index of the modal to be instantiated
   */
  const modalIframeCreated = (event, index) => {
    mfModalList[index].modalIframe = event.detail.modalIframe;
    mfModalList[index].modalIframeData = event.detail.modalIframeData;
  };

  /**
   * Event handler called when the web component of the modal is created inside Modal component
   * @param event {Object} event data of the instantiated Modal component instance
   * @param index {number} the index of the modal to be instantiated
   */
  const modalWCCreated = (event, index) => {
    mfModalList[index].modalWC = event.detail.modalWC;
    mfModalList[index].modalWCData = event.detail.modalWCData;
  };

  /**
   * Closes the modal given the respective modal index. Index is used due to multiple modals functionality
   * @param index the index of the modal to be closed corresponding to the 'mfModalList' array
   * @param isClosedInternal flag if the modal is closed via close button or internal back navigation instead of changing browser URL manually or browser back button
   * @param goBackContext the goBack context that is passed through when closing the modal
   */
  const closeModal = (index, isClosedInternal, goBackContext) => {
    const resetModalData = (index, isClosedInternal) => {
      const showModalPathInUrl = LuigiConfig.getConfigBooleanValue('routing.showModalPathInUrl');
      // only remove the modal path in URL when closing the first modal
      if (showModalPathInUrl && mfModalList.length === 1) {
        Routing.removeModalDataFromUrl(isClosedInternal);
      }
      resetMicrofrontendModalData(index, goBackContext);
    };
    const targetModal = mfModalList[index];
    const rp = GenericHelpers.getRemotePromise(targetModal.mfModal.settings.onClosePromiseId);
    if (targetModal && targetModal.modalIframe) {
      getUnsavedChangesModalPromise(targetModal.modalIframe.contentWindow).then(
        () => {
          resetModalData(index, isClosedInternal);
          rp && rp.doResolve(goBackContext);
        },
        () => {}
      );
    } else if (targetModal && targetModal.modalWC) {
      resetModalData(index, isClosedInternal);
      rp && rp.doResolve(goBackContext);
    }
  };

  setContext('openViewInModal', openViewInModal);

  ///
  let mfDrawer = {};

  const resetMicrofrontendDrawerData = () => {
    mfDrawer.displayed = false;
    mfDrawer.nodepath = undefined;
    mfDrawer.settings = {};
    disableBackdrop = false;
  };

  resetMicrofrontendDrawerData();

  const openViewInDrawer = async (nodepath, settings) => {
    if (await NavigationHelpers.shouldPreventNavigationForPath(nodepath)) {
      return;
    }
    mfDrawer.displayed = true;
    mfDrawer.nodepath = nodepath;
    mfDrawer.settings = settings;
    if (mfDrawer.settings && mfDrawer.settings.backdrop) {
      disableBackdrop = true;
    }
  };

  const isResizeMF = () => {
    return (
      window.innerWidth >= CSS_BREAKPOINTS.desktopMinWidth &&
      mfDrawer.displayed &&
      mfDrawer.settings &&
      !mfDrawer.settings.overlap
    );
  };

  const resizeMicrofrontendIframe = (resetSize = false) => {
    if (!isResizeMF()) return;

    const drawer = document.querySelector('.iframeModalCtn._drawer');

    if (!drawer) return;

    const containers = [
      document.querySelector('div.iframeContainer'),
      document.getElementById('splitViewContainer'),
      document.getElementById('splitViewDragger'),
      document.getElementById('splitViewDraggerBackdrop'),
      document.getElementById('tabsContainer')
    ];

    if (resetSize) {
      containers.forEach((container) => {
        container?.style.removeProperty('width');
      });
    } else {
      const { width: drawerWidth } = getComputedStyle(drawer);

      containers.forEach((container) => {
        setContainerWidth(container, drawerWidth);
      });
    }
  };

  const setContainerWidth = (containerElement, drawerWidth) => {
    if (
      containerElement &&
      // Only change the width if it is not already resized due to a
      // drawer being opened earlier.
      !containerElement.style.getPropertyValue('width').includes('calc(')
    ) {
      containerElement.style.setProperty('width', `calc(${containerElement.clientWidth}px - ${drawerWidth})`);
    }
  };

  const drawerIframeCreated = (event) => {
    drawerIframe = event.detail.modalIframe;
    drawerIframeData = event.detail.modalIframeData;
    resizeMicrofrontendIframe();
  };

  const drawerWCCreated = (event) => {
    drawerWC = event.detail.modalWC;
    drawerWCData = event.detail.modalWCData;
    resizeMicrofrontendIframe();
  };

  const setDrawerState = (event) => {
    activeDrawer = event.detail.activeDrawer;
  };

  const closeDrawer = (event) => {
    if (event && event.detail && event.detail.activeDrawer !== undefined) {
      activeDrawer = event.detail.activeDrawer;
    }
    if (!activeDrawer || (event && event.detail && event.detail.type !== 'modal')) {
      try {
        if (drawerIframe) {
          getUnsavedChangesModalPromise(drawerIframe.contentWindow).then(
            () => {
              resetMicrofrontendDrawerData();
            },
            () => {}
          );
        } else if (drawerWC) {
          getUnsavedChangesModalPromise().then(
            () => {
              resetMicrofrontendDrawerData();
            },
            () => {}
          );
        }
        resizeMicrofrontendIframe(true);
      } catch (e) {
        console.log(e);
      }
    }
  };

  //Dialog Box
  export const openUserSettings = () => {
    //check if empty array
    const userSettingGroups = UserSettingsHelper.processUserSettingGroups();
    if (Array.isArray(userSettingGroups) && userSettingGroups.length > 0) {
      internalUserSettingsObject.userSettingGroups = [...userSettingGroups];
      internalUserSettingsObject.displayed = true;
    } else {
      console.info('There are no user setting groups in the settings section of the luigi config defined.');
    }
  };

  export const closeUserSettings = () => {
    internalUserSettingsObject.displayed = false;
  };

  // Open View in New Tab

  const openViewInNewTab = async (nodepath) => {
    if (await NavigationHelpers.shouldPreventNavigationForPath(nodepath)) {
      return;
    }

    const hashRouting = LuigiConfig.getConfigValue('routing.useHashRouting');
    if (hashRouting) {
      nodepath = '#' + nodepath;
    }

    /*'noopener,noreferrer' required to disable XSS injections*/
    window.open(nodepath, '_blank', 'noopener,noreferrer');
  };

  /**
   * Builds the current path based on the navigation params received
   * @param params {Object} navigation options
   * @returns {string} the path built
   */
  export const buildPathForGetCurrentRoute = (params) => {
    let localNavPath = navigationPath;
    if (currentNode) {
      let parent = currentNode.parent;
      localNavPath = [currentNode];
      while (parent) {
        localNavPath.push(parent);
        parent = parent.parent;
      }
      localNavPath = [...localNavPath].reverse();
    }

    let path = params.link;
    let currentNodeViewUrl = getSubPath(currentNode, pathParams);

    if (params.fromVirtualTreeRoot) {
      // from a parent node specified with virtualTree: true
      const virtualTreeNode = [...localNavPath].reverse().find((n) => n.virtualTree);
      if (!virtualTreeNode) {
        console.error(
          'LuigiClient Error: fromVirtualTreeRoot() is not possible because you are not inside a Luigi virtualTree navigation node.'
        );
        return;
      }
      // build virtualPath if there is any
      const virtualTreeNodeViewUrl = getSubPath(virtualTreeNode, pathParams);
      path = currentNodeViewUrl.split(virtualTreeNodeViewUrl).join('');
    } else if (params.fromParent) {
      const parentNodeViewUrl = getSubPath(currentNode.parent, pathParams);
      path = currentNodeViewUrl.split(parentNodeViewUrl).join('');
    } else if (params.fromClosestContext) {
      // from the closest navigation context
      const navContextNode = [...localNavPath]
        .reverse()
        .find((n) => n.navigationContext && n.navigationContext.length > 0);
      const navContextNodeViewUrl = getSubPath(navContextNode, pathParams);
      path = currentNodeViewUrl.split(navContextNodeViewUrl).join('');
    } else if (params.fromContext) {
      // from a given navigation context
      const navigationContext = params.fromContext;
      const navContextNode = [...localNavPath].reverse().find((n) => navigationContext === n.navigationContext);
      const navContextNodeViewUrl = getSubPath(navContextNode, pathParams);
      path = currentNodeViewUrl.split(navContextNodeViewUrl).join('');
    } else {
      // retrieve path for getCurrentPath method when no options used
      path = currentNodeViewUrl;
    }
    return path;
  };

  function init(node) {
    // remove historyState if modal is closed by entering a new luigi route in url bar
    sessionStorage.removeItem('historyState');
    ViewGroupPreloading.shouldPreload = true;
    ViewGroupPreloading.preload(true);
    ViewGroupPreloading.shouldPreload = false;

    const isolateAllViews = LuigiConfig.getConfigValue('navigation.defaults.isolateView');
    const defaultPageErrorHandler = LuigiConfig.getConfigValue('navigation.defaults.pageErrorHandler');
    const defaultRunTimeErrorHandler = LuigiConfig.getConfigValue('navigation.defaults.runTimeErrorHandler');
    const config = {
      iframe: null,
      navigateOk: null,
      builderCompatibilityMode: Boolean(window.builderCompatibilityMode),
      isolateAllViews,
      defaultPageErrorHandler
    };
    LuigiI18N.addCurrentLocaleChangeListener((locale) => {
      const message = {
        msg: 'luigi.current-locale-changed',
        currentLocale: locale
      };
      IframeHelpers.broadcastMessageToAllIframes(message);
    });

    EventListenerHelpers.addEventListener('popstate', async (e) => {
      const alertQueue = alerts;
      if (!alertQueue || !(alertQueue.length > 0)) return;

      const updatedAlerts = alertQueue
        .map((a) => {
          if (a && !a.openFromClient && typeof a.settings.ttl === 'number') {
            //alert has some TTL set
            if (a.settings.ttl === 0) {
              //the TTL value dropped down to 0, remove this alert
              return null;
            } else {
              //TTL is not 0, reduce it
              a.settings.ttl--;
            }
          }
          //return either unchanged Alert or the one with reduced TTL value
          return a;
        })
        .filter((a) => a); //remove empty alerts from array

      alerts = updatedAlerts;
    });

    EventListenerHelpers.addEventListener('message', async (e) => {
      const iframe = IframeHelpers.getValidMessageSource(e);
      const topMostModal = mfModalList[mfModalList.length - 1];
      const modalIframe = topMostModal && topMostModal.modalIframe;
      const modalIframeData = topMostModal && topMostModal.modalIframeData;

      const specialIframeProps = {
        modalIframe,
        modalIframeData,
        drawerIframe,
        drawerIframeData,
        drawer,
        modal,
        splitViewIframe,
        splitViewIframeData,
        splitView
      };

      if (!iframe) return;
      iframe._ready = true;

      const specialIframeMessageSource = IframeHelpers.getSpecialIframeMessageSource(e, specialIframeProps);
      const isSpecialIframe = specialIframeMessageSource && specialIframeMessageSource.length > 0;

      const skipInactiveConfig = LuigiConfig.getConfigValue('communication.skipEventsWhenInactive');

      if (
        skipInactiveConfig &&
        skipInactiveConfig.length > 0 &&
        !isSpecialIframe &&
        iframe.contentWindow !== window &&
        !GenericHelpers.isElementVisible(iframe) &&
        skipInactiveConfig.includes(e.data.msg)
      ) {
        console.debug(`EVENT '${e.data.msg}' from inactive iframe -> SKIPPED`);
        return;
      }

      if ('custom' === e.data.msg) {
        const customMessagesListeners = LuigiConfig.getConfigValue('communication.customMessagesListeners') || {};
        const message = MessagesListeners.convertCustomMessageInternalToUser(e.data);
        const customMessageListener = customMessagesListeners[message.id];
        const userSettingsCMKey = 'luigi.updateUserSettings';
        if (internalUserSettingsObject && message.id === userSettingsCMKey) {
          if (customMessageListener) {
            console.warn(`The key "${userSettingsCMKey}" is not allowed to use for custom messages.`);
          }
          return;
        }
        if (typeof customMessageListener === 'function') {
          const microfrontend = LuigiElements.getMicrofrontends().find((mf) =>
            IframeHelpers.isMessageSource(e, mf.container)
          );

          customMessageListener(
            message,
            microfrontend,
            GenericHelpers.removeInternalProperties(iframe.luigi.currentNode)
          );
        } else {
          console.warn(
            `Warning: Custom message with id: '${message.id}' does not exist. Make sure you provided the same id as in the config file.`
          );
        }
      }

      /**
       * Persist the answer of the init handshake
       * to prevent half-initialized clients
       */
      if ('luigi.init.ok' === e.data.msg) {
        iframe.luigi.initOk = true;
      }

      if ('luigi.navigate.ok' === e.data.msg) {
        iframe.luigi.viewUrl = iframe.luigi.nextViewUrl;
        iframe.luigi.nextViewUrl = '';
        iframe.luigi.clientPermissions = iframe.luigi.nextClientPermissions;
        delete iframe.luigi.nextClientPermissions;
        config.navigateOk = true;

        ViewGroupPreloading.preload();
      }

      if ('luigi.get-context' === e.data.msg) {
        contextRequested = true;
        iframe.luigi.clientVersion = e.data.clientVersion; // undefined for v0.x clients
        iframe.luigi.initOk = false; // get-context indication. used for handshake verification

        if (isSpecialIframe) {
          specialIframeMessageSource.forEach(async (typ) => {
            let ctx = specialIframeProps[typ.dataKey].context;
            const conf = {
              ...config,
              iframe: specialIframeProps[typ.iframeKey],
              context: ctx,
              pathParams: specialIframeProps[typ.dataKey].pathParams,
              nodeParams: specialIframeProps[typ.dataKey].nodeParams,
              searchParams: RoutingHelpers.prepareSearchParamsForClient(
                specialIframeProps[typ.iframeKey].luigi.currentNode
              ),
              modal: typ.iframeKey.startsWith('modal'),
              drawer: typ.iframeKey.startsWith('drawer'),
              splitView: typ.iframeKey.startsWith('splitView')
            };
            await sendContextToClient(conf, {});
          });
        } else if (config.iframe && IframeHelpers.isMessageSource(e, config.iframe)) {
          await sendContextToClient(config, {});
          const loadingIndicatorAutoHideEnabled =
            !currentNode || !currentNode.loadingIndicator || currentNode.loadingIndicator.hideAutomatically !== false;
          if (loadingIndicatorAutoHideEnabled) {
            fadeOutAppLoadingIndicator();
          }
          ViewGroupPreloading.preload();
        } else if (iframe.luigi.preloading) {
          // set empty context to an existing but inactive iframe; this is a valid use case (view group pre-loading)
          await sendContextToClient(
            {
              iframe: iframe,
              context: {},
              nodeParams: {},
              pathParams: {},
              internal: {}
            },
            {}
          );
        } else {
          let userSettingsIframe = UserSettingsHelper.findActiveCustomUserSettingsIframe(e.source);
          if (userSettingsIframe) {
            let userSettingsGroupKey = userSettingsIframe.getAttribute('userSettingsGroup');
            let config = {
              context: {
                userSettingsData: storedUserSettings[userSettingsGroupKey]
              }, // nur für spezielen Iframe
              iframe: userSettingsIframe
            };
            await sendContextToClient(config);
          }
        }
        ViewGroupPreloading.viewGroupLoaded(iframe);
      }

      if ('luigi.show-loading-indicator' === e.data.msg && !e.data.nestedScope) {
        showLoadingIndicator = true;
      }

      if ('luigi.hide-loading-indicator' === e.data.msg && !e.data.nestedScope) {
        clearTimeout(loadingIndicatorTimeout);
        showLoadingIndicator = false;
      }

      if ('luigi.navigation.open' === e.data.msg) {
        isNavigateBack = false;

        const previousUrl = window.location.href;

        const srcNode = isSpecialIframe ? iframe.luigi.currentNode : undefined;
        const srcPathParams = isSpecialIframe ? iframe.luigi.pathParams : undefined;
        const params = e.data.params;
        const { intent, newTab, modal, splitView, drawer, withoutSync } = params;
        let isSpecial = newTab || modal || splitView || drawer;

        const resolveRemotePromise = () => {
          const remotePromise = GenericHelpers.getRemotePromise(e.data.remotePromiseId);
          if (remotePromise) {
            remotePromise.doResolve();
          }
        };

        const rejectRemotePromise = () => {
          const remotePromise = GenericHelpers.getRemotePromise(e.data.remotePromiseId);
          if (remotePromise) {
            remotePromise.doReject();
          }
        };

        const checkResolve = (checkLocationChange) => {
          if (!checkLocationChange || previousUrl !== window.location.href) {
            resolveRemotePromise();
          } else {
            rejectRemotePromise();
          }
        };

        if (e.source !== window && !intent && params.link) {
          params.link = params.link.split('?')[0];
        }

        let path = buildPath(e.data.params, srcNode, srcPathParams);
        isSpecial = isSpecial || (intent && path.external);

        if (!isSpecial) {
          getUnsavedChangesModalPromise()
            .then(() => {
              isNavigationSyncEnabled = !e.data.params.withoutSync;
              handleNavigation(e.data, config, srcNode, srcPathParams)
                .then(() => {
                  checkResolve(true);
                })
                .catch(() => {
                  rejectRemotePromise();
                });
              // close all modals to allow navigation to the non-special view
              mfModalList.forEach((m, index) => {
                // close modals
                closeModal(index);
              });

              closeSplitView();
              closeDrawer();
              isNavigationSyncEnabled = true;
            })
            .catch(() => {
              rejectRemotePromise();
            });
        } else {
          // navigate to external link if external intent link detected
          if (intent && path.external) {
            Routing.navigateToExternalLink({
              url: path.url,
              sameWindow: !path.openInNewTab
            });
            return;
          }

          path = GenericHelpers.addLeadingSlash(path);
          if (newTab) {
            await openViewInNewTab(path);
            checkResolve();
            return;
          }

          const pathExist = await pathExists(path);
          path = await RoutingHelpers.handlePageNotFoundAndRetrieveRedirectPath(getComponentWrapper(), path, pathExist);

          if (!path) {
            rejectRemotePromise();
            return;
          }

          contentNode = node;

          if (modal !== undefined) {
            !modal.keepPrevious && resetMicrofrontendModalData();
            await openViewInModal(path, modal === true ? {} : modal, iframe);
            checkResolve();
          } else if (splitView !== undefined) {
            await openSplitView(path, splitView);
            checkResolve();
          } else if (drawer !== undefined) {
            resetMicrofrontendDrawerData();
            drawer.isDrawer = true;
            await openViewInDrawer(path, drawer);
            checkResolve();
          }
        }
      }

      if ('luigi.navigation.back' === e.data.msg) {
        const mfModalTopMostElement = mfModalList[mfModalList.length - 1];
        const mfModalPreviousElement = mfModalList.length > 1 && mfModalList[mfModalList.length - 2];
        const _goBackContext = e.data.goBackContext && JSON.parse(e.data.goBackContext);
        if (IframeHelpers.isMessageSource(e, mfModalTopMostElement && mfModalTopMostElement.modalIframe)) {
          closeModal(mfModalList.length - 1, true, _goBackContext);
          let modalConfig = config;
          // special case if going back with multiple modals, context should go back to previous modal, not main iframe
          if (mfModalPreviousElement && mfModalPreviousElement.modalIframeData && mfModalPreviousElement.modalIframe) {
            const topMostModal = mfModalPreviousElement;
            const topMostModalData = topMostModal.modalIframeData;
            modalConfig = {
              pathParams: topMostModalData.pathParams,
              context: topMostModalData.context,
              iframe: topMostModal.modalIframe
            };
          }
          modalConfig.iframe &&
            (await sendContextToClient(modalConfig, {
              goBackContext: _goBackContext
            }));
        } else if (IframeHelpers.isMessageSource(e, splitViewIframe)) {
          closeSplitView();
          config.iframe &&
            (await sendContextToClient(config, {
              goBackContext: _goBackContext
            }));
        } else if (IframeHelpers.isMessageSource(e, drawerIframe)) {
          if (activeDrawer) {
            activeDrawer = !activeDrawer;
          }
          closeDrawer();
          config.iframe &&
            (await sendContextToClient(config, {
              goBackContext: _goBackContext
            }));
        } else {
          // go back: context from the view
          if (preservedViews && preservedViews.length > 0) {
            getUnsavedChangesModalPromise().then(
              () => {
                // remove current active iframe and data
                Iframe.setActiveIframeToPrevious(node);
                const previousActiveIframeData = preservedViews.pop();
                // set new active iframe and preservedViews
                config.iframe = Iframe.getActiveIframe(node);
                isNavigateBack = true;
                preservedViews = preservedViews;
                goBackContext = _goBackContext;
                // TODO: check if getNavigationPath or history pop to update hash / path
                handleNavigation({ params: { link: previousActiveIframeData.path } }, config);
              },
              () => {}
            );
          } else {
            if (_goBackContext) {
              console.warn(
                `Warning: goBack() does not support goBackContext value. This is available only when using the Luigi preserveView feature.`
              );
            }
            // TODO: does not work with default child node behavior, fixed by #216
            window.history.back();
          }
        }
      }

      // handle getCurrentRoute message coming from client
      if ('luigi.navigation.currentRoute' === e.data.msg) {
        const data = e.data.data;
        const path = buildPathForGetCurrentRoute(data);

        // send answer back to client
        const message = {
          msg: 'luigi.navigation.currentRoute.answer',
          data: {
            route: path,
            correlationId: data.id
          }
        };
        IframeHelpers.sendMessageToIframe(iframe, message);
      }

      if ('luigi.auth.tokenIssued' === e.data.msg) {
        sendAuthDataToClient(e.data.authData);
      }

      if ('luigi.navigation.updateModalDataPath' === e.data.msg) {
        if (!LuigiConfig.getConfigBooleanValue('routing.showModalPathInUrl')) {
          return;
        }
        if (isSpecialIframe) {
          const route = GenericHelpers.addLeadingSlash(
            buildPath(e.data.params, iframe.luigi.currentNode, iframe.luigi.pathParams)
          );
          Routing.updateModalDataInUrl(route, e.data.params.modal, e.data.params.history);
        } else {
          console.warn('updateModalDataPath can only be called from modal, ignoring.');
        }
      }

      if ('luigi.navigation.pathExists' === e.data.msg) {
        const srcNode = iframe.luigi.currentNode;
        const srcPathParams = iframe.luigi.pathParams;
        const data = e.data.data;
        const path = buildPath(data, srcNode, srcPathParams);
        const pathData = path
          ? await Navigation.getNavigationPath(LuigiConfig.getConfigValueAsync('navigation.nodes'), path)
          : false;
        const message = {
          msg: 'luigi.navigation.pathExists.answer',
          data: {
            correlationId: data.id,
            pathExists: pathData ? pathData.isExistingRoute : false
          }
        };
        IframeHelpers.sendMessageToIframe(iframe, message);
      }

      if ('luigi.set-page-dirty' === e.data.msg) {
        if (!unsavedChanges.dirtySet) {
          const dirtySet = new Set();
          dirtySet.add(e.source);
          unsavedChanges = {
            dirtySet: dirtySet
          };
        }
        unsavedChanges.persistUrl = window.location.href;
        if (e.data.dirty) {
          unsavedChanges.dirtySet.add(e.source);
        } else {
          unsavedChanges.dirtySet.delete(e.source);
        }
      }

      if ('luigi.ux.confirmationModal.show' === e.data.msg) {
        const settings = e.data.data.settings;
        contentNode = node;
        resetConfirmationModalData();
        showModal(settings, true, iframe).catch(() => {
          /* keep it to avoid runtime errors in browser console */
        });
      }

      if ('luigi.ux.alert.show' === e.data.msg) {
        const { settings } = e.data.data;
        if (!settings.text && !GenericHelpers.isFunction(LuigiConfig.getConfigValue('settings.customAlertHandler'))) {
          console.error(
            "Luigi Client alert: 'text' field for alert is empty or not present, therefore alert will not be displayed"
          );
          return;
        }
        contentNode = node;
        showAlert(settings, true).catch(() => {
          /* keep it to avoid runtime errors in browser console */
        });
      }

      if ('luigi.ux.set-current-locale' === e.data.msg) {
        if (iframe.luigi.clientPermissions && iframe.luigi.clientPermissions.changeCurrentLocale) {
          const { currentLocale } = e.data.data;
          if (currentLocale) {
            LuigiI18N.setCurrentLocale(currentLocale);
          }
        } else {
          console.error(
            'Current local change from client declined because client permission changeCurrentLocale is not set for this view.'
          );
        }
      }
      if (
        thirdPartyCookiesCheck &&
        !thirdPartyCookiesCheck.thirdPartyCookieScriptLocation &&
        'luigi.third-party-cookie' === e.data.msg
      ) {
        if (e.data.tpc === 'disabled') {
          tpcErrorHandling(thirdPartyCookiesCheck);
        }
      }

      if ('storage' === e.data.msg) {
        StorageHelper.process(iframe.luigi.id, e.origin, e.data.data.id, e.data.data.operation, e.data.data.params);
      }

      if ('luigi-runtime-error-handling' === e.data.msg) {
        let currentNode = iframe.luigi.currentNode;
        if (
          currentNode &&
          currentNode.runTimeErrorHandler &&
          GenericHelpers.isFunction(currentNode.runTimeErrorHandler.errorFn)
        ) {
          currentNode.runTimeErrorHandler.errorFn(e.data.errorObj, currentNode);
        } else if (defaultRunTimeErrorHandler && GenericHelpers.isFunction(defaultRunTimeErrorHandler.errorFn)) {
          defaultRunTimeErrorHandler.errorFn(e.data.errorObj, currentNode);
        }
      }

      if ('luigi.addSearchParams' === e.data.msg) {
        if (iframe.luigi.currentNode.clientPermissions && iframe.luigi.currentNode.clientPermissions.urlParameters) {
          const { data, keepBrowserHistory } = e.data;
          RoutingHelpers.addSearchParamsFromClient(iframe.luigi.currentNode, data, keepBrowserHistory);
        } else {
          console.warn('No client permissions to add url parameter for this node.');
        }
      }

      if ('luigi.addNodeParams' === e.data.msg) {
        if (isSpecialIframe) return;

        const { data, keepBrowserHistory } = e.data;
        LuigiRouting.addNodeParams(data, keepBrowserHistory);
      }

      if ('luigi.setAnchor' === e.data.msg) {
        const { anchor } = e.data;
        LuigiRouting.setAnchor(anchor);
      }

      if ('luigi.setVGData' === e.data.msg) {
        const vgData = e.data;
        const vg = NavigationHelpers.findViewGroup(iframe.luigi.currentNode);
        if (vg) {
          const vgSettings = NavigationHelpers.getViewGroupSettings(vg);
          vgSettings._liveCustomData = vgData.data;
          LuigiConfig.configChanged('navigation.viewgroupdata');
        }
      }
    });

    // listeners are not automatically removed — cancel
    // them to prevent memory leaks
    // this.on('destroy', storeListener.cancel);
    enableRouting(node, config);
  }

  setContext('store', store);
  setContext('getTranslation', getTranslation);

  const tpcErrorHandling = (thirdpartycookiecheck) => {
    if (
      thirdPartyCookiesCheck &&
      thirdPartyCookiesCheck.thirdPartyCookieErrorHandling &&
      GenericHelpers.isFunction(thirdPartyCookiesCheck.thirdPartyCookieErrorHandling)
    ) {
      thirdPartyCookiesCheck.thirdPartyCookieErrorHandling();
    }
  };

  /**
   * This function will be called if the LuigiClient requested the context.
   * That means spinner can fade out in order to display the mf.
   * After 250 ms the spinner will be removed from DOM.
   */
  function fadeOutAppLoadingIndicator() {
    const spinnerContainer = document.querySelector('.spinnerContainer.appSpinner');
    if (spinnerContainer && spinnerContainer.classList.contains('fade-out')) {
      spinnerContainer.classList.remove('fade-out');
      setTimeout(() => {
        clearTimeout(loadingIndicatorTimeout);
        showLoadingIndicator = false;
      }, 250);
    } else {
      clearTimeout(loadingIndicatorTimeout);
    }
  }

  export const pathExists = async (path) => {
    const data = {
      link: path,
      relative: path[0] !== '/',
      intent: RoutingHelpers.hasIntent(path)
    };
    const builtPath = buildPath(data);
    const pathData = builtPath
      ? await Navigation.getNavigationPath(LuigiConfig.getConfigValueAsync('navigation.nodes'), builtPath)
      : false;
    return pathData ? pathData.isExistingRoute : false;
  };

  export const hasBack = () => {
    return mfModalList.length > 0 || preservedViews.length !== 0;
  };

  onMount(() => {
    LuigiTheming._init();
    searchProvider = LuigiConfig.getConfigValue('globalSearch.searchProvider');
    responsiveNavSetting = LuigiConfig.getConfigValue('settings.responsiveNavigation');
    previousWindowWidth = window.innerWidth;
    if (responsiveNavSetting === 'simple') {
      document.body.classList.add('lui-simpleSlideInNav');
      simpleSlideInNav = true;
      if (NavigationHelpers.getBurgerTooltipConfig()) {
        const [collapseNavTooltip, expandNavTooltip] = NavigationHelpers.getBurgerTooltipConfig();
        if (collapseNavTooltip && expandNavTooltip) {
          burgerTooltip = document.body.classList.contains('lui-leftNavToggle') ? collapseNavTooltip : expandNavTooltip;
        }
      }
    } else if (responsiveNavSetting === 'simpleMobileOnly') {
      document.body.classList.add('lui-simpleSlideInNav', 'lui-mobileOnly');
      simpleSlideInNav = true;
    } else if (responsiveNavSetting === 'semiCollapsible' || 'Fiori3') {
      if (NavigationHelpers.getBurgerTooltipConfig()) {
        const [collapseNavTooltip, expandNavTooltip] = NavigationHelpers.getBurgerTooltipConfig();
        if (collapseNavTooltip && expandNavTooltip) {
          const collapsedNavState = JSON.parse(localStorage.getItem(NavigationHelpers.COL_NAV_KEY));
          burgerTooltip = collapsedNavState ? collapseNavTooltip : expandNavTooltip;
        }
      }
      document.body.classList.add('lui-semiCollapsible');
    }
    thirdPartyCookiesCheck = LuigiConfig.getConfigValue('settings.thirdPartyCookieCheck');
    if (thirdPartyCookiesCheck && thirdPartyCookiesCheck.thirdPartyCookieScriptLocation) {
      setTimeout(() => {
        let thirdPartyCookieCheckIframe = document.createElement('iframe');
        thirdPartyCookieCheckIframe.width = '0px';
        thirdPartyCookieCheckIframe.height = '0px';
        thirdPartyCookieCheckIframe.src = thirdPartyCookiesCheck.thirdPartyCookieScriptLocation;
        document.body.appendChild(thirdPartyCookieCheckIframe);
        thirdPartyCookieCheckIframe.onload = function () {
          setTimeout(() => {
            if (thirdPartyCookiesStatus() === 'disabled') {
              tpcErrorHandling(thirdPartyCookiesCheck);
            }
          });
          document.body.removeChild(thirdPartyCookieCheckIframe);
        };
      });
    }
  });

  afterUpdate(() => {
    resizeMicrofrontendIframe();
  });

  beforeUpdate(() => {
    breadcrumbsEnabled = LuigiConfig.getConfigValue('navigation.breadcrumbs');
    searchProvider = LuigiConfig.getConfigValue('globalSearch.searchProvider');
    configTag = LuigiConfig.getConfigValue('tag');
    isHeaderDisabled = LuigiConfig.getConfigValue('settings.header.disabled');
  });

  const handleKeyDown = (event) => {
    if (event.keyCode === KEYCODE_ESC && mfModalList && mfModalList.length > 0) {
      closeModal(mfModalList.length - 1);
    }
  };
</script>

<svelte:window on:resize={onResize} on:keydown={handleKeyDown} />
<div
  id="app"
  class:vega={vegaLayout}
  class:no-nav={hideNav}
  class:no-side-nav={hideSideNav}
  class:no-top-nav={isHeaderDisabled}
  class:no-animation={noAnimation}
  class:btp-layout={btpToolLayout}
  configversion={configTag}
>
  {#if alerts && alerts.length}
    <Alerts alertQueue={alerts} on:alertDismiss={handleAlertDismissExternal} />
  {/if}

  {#each mfModalList as modalItem, index}
    {#if modalItem.mfModal.displayed}
      <Modal
        settings={modalItem.mfModal.settings}
        nodepath={modalItem.mfModal.nodepath}
        modalIndex={index}
        on:close={() => closeModal(index, true)}
        on:iframeCreated={(event) => modalIframeCreated(event, index)}
        on:wcCreated={(event) => modalWCCreated(event, index)}
        {disableBackdrop}
      />
    {/if}
  {/each}
  {#if mfDrawer.displayed && mfDrawer.settings.isDrawer}
    <Modal
      settings={mfDrawer.settings}
      nodepath={mfDrawer.nodepath}
      on:close={closeDrawer}
      on:drawerState={setDrawerState}
      on:iframeCreated={drawerIframeCreated}
      on:wcCreated={drawerWCCreated}
    >
      <Backdrop area="drawer" disable={disableBackdrop} />
    </Modal>
  {/if}
  {#if confirmationModal.displayed}
    <ConfirmationModal
      settings={confirmationModal.settings}
      on:modalConfirm={() => handleModalResult(true)}
      on:modalDismiss={() => handleModalResult(false)}
    />
  {/if}
  {#if internalUserSettingsObject.displayed}
    <UserSettingsDialog
      on:close={closeUserSettings}
      userSettingGroups={internalUserSettingsObject.userSettingGroups}
      bind:storedUserSettings
    />
  {/if}

  {#if btpToolLayout}
    <Backdrop disable={disableBackdrop}></Backdrop>
    <div class="lui-core-layout">
      <div class="fd-tool-layout fd-tool-layout--sticky">
        <div class="fd-tool-layout__container">
          <div class="fd-tool-layout__header-container">
            {#if !isHeaderDisabled}
              <TopNav
                hideSearchComponent={hideGlobalSearch}
                pathData={navigationPath}
                {pathParams}
                on:handleClick={handleNavClick}
                on:resizeTabNav={onResizeTabNav}
                on:toggleSearch={toggleSearch}
                on:closeSearchResult={closeSearchResult}
                on:handleSearchNavigation={handleSearchNavigation}
                bind:isSearchFieldVisible
                bind:displaySearchResult
                bind:searchResult
                bind:inputElem
                bind:customSearchItemRendererSlot
                {burgerTooltip}
              />
            {/if}
          </div>
        </div>
        <div class="fd-tool-layout__container lui-main-content">
          {#if !(hideNav || hideSideNav)}
            <div class="fd-tool-layout__navigation-container">
              <div class="lui-box">
                <LeftNav
                  pathData={navigationPath}
                  {pathParams}
                  on:handleClick={handleNavClick}
                  on:resizeTabNav={onResizeTabNav}
                  {burgerTooltip}
                />
              </div>
            </div>
          {/if}
          <div class="fd-tool-layout__content-container">
            {#if breadcrumbsEnabled}
              <Breadcrumb pathData={navigationPath} {pathParams} on:handleClick={handleNavClick} />
            {/if}
            <div class="lui-box">
              <Backdrop disable={disableBackdrop}>
                <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
                <div
                  class="fd-page iframeContainer"
                  class:lui-split-view={mfSplitView.displayed}
                  class:lui-collapsed={mfSplitView.collapsed}
                  tabindex="0"
                  use:init
                >
                  <Backdrop area="main" disable={disableBackdrop} />
                  <div class="wcContainer" />
                </div>
                {#if tabNav && !hideNav}
                  <TabNav pathData={navigationPath} {pathParams} on:handleClick={handleNavClick} {resizeTabNavToggle} />
                {/if}
                {#if mfSplitView.displayed}
                  <SplitView
                    splitViewSettings={mfSplitView.settings}
                    collapsed={mfSplitView.collapsed}
                    nodepath={mfSplitView.nodepath}
                    on:iframeCreated={splitViewIframeCreated}
                    on:statusChanged={splitViewStatusChanged}
                    on:wcCreated={splitViewWCCreated}
                    {disableBackdrop}
                  />
                {/if}
              </Backdrop>
              {#if showLoadingIndicator}
                <div class="fd-page spinnerContainer appSpinner fade-out" aria-hidden="false" aria-label="Loading">
                  <div
                    class="fd-busy-indicator fd-busy-indicator--m"
                    aria-hidden="false"
                    aria-label="Loading"
                    data-testid="luigi-loading-spinner"
                  >
                    <div class="fd-busy-indicator__circle" />
                    <div class="fd-busy-indicator__circle" />
                    <div class="fd-busy-indicator__circle" />
                  </div>
                </div>
              {/if}
            </div>
          </div>
        </div>
      </div>
    </div>
  {:else}
    {#if !isHeaderDisabled}
      <TopNav
        hideSearchComponent={hideGlobalSearch}
        pathData={navigationPath}
        {pathParams}
        on:handleClick={handleNavClick}
        on:resizeTabNav={onResizeTabNav}
        on:toggleSearch={toggleSearch}
        on:closeSearchResult={closeSearchResult}
        on:handleSearchNavigation={handleSearchNavigation}
        bind:isSearchFieldVisible
        bind:displaySearchResult
        bind:searchResult
        bind:inputElem
        bind:customSearchItemRendererSlot
        {burgerTooltip}
      />
    {/if}
    {#if !(hideNav || hideSideNav)}
      <LeftNav
        pathData={navigationPath}
        {pathParams}
        on:handleClick={handleNavClick}
        on:resizeTabNav={onResizeTabNav}
        {burgerTooltip}
      />
    {/if}
    <Backdrop disable={disableBackdrop}>
      <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
      <div
        class="fd-page iframeContainer"
        class:lui-split-view={mfSplitView.displayed}
        class:lui-collapsed={mfSplitView.collapsed}
        tabindex="0"
        use:init
      >
        <Backdrop area="main" disable={disableBackdrop} />
        <div class="wcContainer" />
      </div>
      {#if mfSplitView.displayed}
        <SplitView
          splitViewSettings={mfSplitView.settings}
          collapsed={mfSplitView.collapsed}
          nodepath={mfSplitView.nodepath}
          on:iframeCreated={splitViewIframeCreated}
          on:statusChanged={splitViewStatusChanged}
          on:wcCreated={splitViewWCCreated}
          {disableBackdrop}
        />
      {/if}
    </Backdrop>
    {#if showLoadingIndicator}
      <div class="fd-page spinnerContainer appSpinner fade-out" aria-hidden="false" aria-label="Loading">
        <div
          class="fd-busy-indicator fd-busy-indicator--m"
          aria-hidden="false"
          aria-label="Loading"
          data-testid="luigi-loading-spinner"
        >
          <div class="fd-busy-indicator__circle" />
          <div class="fd-busy-indicator__circle" />
          <div class="fd-busy-indicator__circle" />
        </div>
      </div>
    {/if}

    {#if !hideNav}
      <GlobalNav pathData={navigationPath} {pathParams} on:handleClick={handleNavClick} />
      {#if breadcrumbsEnabled}
        <Breadcrumb pathData={navigationPath} {pathParams} on:handleClick={handleNavClick} />
      {/if}
    {/if}

    {#if tabNav && !hideNav}
      <TabNav pathData={navigationPath} {pathParams} on:handleClick={handleNavClick} {resizeTabNavToggle} />
    {/if}
  {/if}
</div>

<style lang="scss">
  /* custom width of left side nav, single App title width or Multiple-App dropdown width*/
  :root {
    --luigi__left-sidenav--width: 15rem;
    --luigi__app-title--width: 60vw;
    --luigi__multi-app-dropdown--width: 60vw;
    --luigi__breadcrumb--height: 2.75rem;
    --luigi__shellbar--height: 2.75rem;
    --luigi__horizontal-nav--height: 2.75rem;
  }

  .vega {
    --luigi__leftnav_collapsed--width: var(--fdSideNav_Width, 4rem);
  }

  .fd-tool-layout {
    --fdToolLayout_Background: var(--sapBackgroundColor);
  }

  :global(html) {
    box-sizing: border-box;
    position: fixed;
    width: 100%;
    min-height: 100%;
  }
  :global(body) {
    -webkit-font-smoothing: antialiased;
    margin: 0;
    line-height: 1.42857;
    overflow: hidden;
    background-color: var(--sapBackgroundColor);
  }

  :global(.fioriScrollbars) {
    scrollbar-color: var(--sapScrollBar_FaceColor) var(--sapScrollBar_TrackColor);
    & :global(::-webkit-scrollbar:horizontal) {
      height: var(--sapScrollBar_Dimension);
    }
    & :global(::-webkit-scrollbar:vertical) {
      width: var(--sapScrollBar_Dimension);
    }
    & :global(::-webkit-scrollbar) {
      background-color: var(--sapScrollBar_TrackColor);
    }
    & :global(::-webkit-scrollbar-thumb) {
      background-color: var(--sapScrollBar_FaceColor);
    }
    & :global(::-webkit-scrollbar-thumb:hover) {
      background-color: var(--sapScrollBar_Hover_FaceColor);
    }
    & :global(::-webkit-scrollbar-corner) {
      background-color: var(--sapScrollBar_TrackColor);
    }
    & :global(::-webkit-scrollbar-thumb) {
      border-radius: var(--sapElement_BorderCornerRadius);
    }
  }

  :global(*) {
    box-sizing: inherit;
  }
  :global(*:before),
  :global(*:after) {
    box-sizing: inherit;
  }
  :global(body) {
    font-family: '72', sans-serif;
  }

  :global(a) {
    cursor: pointer;
  }
  :global([luigi-app-loading-indicator]) {
    z-index: 10;
    background-color: var(--fd-background-color);
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  :global([luigi-app-loading-indicator].hidden) {
    visibility: hidden;
    opacity: 0;
    @include transition(visibility 0s 0.3s, opacity 0.3s linear);
  }

  :global(.lui-breadcrumb) .iframeContainer,
  :global(.lui-breadcrumb) .spinnerContainer {
    top: calc(#{$topNavHeight} + var(--luigi__breadcrumb--height));
  }

  :global(.lui-breadcrumb #tabsContainer) {
    top: calc(var(--luigi__shellbar--height) + var(--luigi__breadcrumb--height));
  }

  :global(.lui-breadcrumb .fd-tool-layout #tabsContainer) {
    top: 0;
  }

  :global(.lui-breadcrumb .iframeContainer.iframeContainerTabNav) {
    top: calc(
      var(--luigi__shellbar--height) + var(--luigi__breadcrumb--height) +
        var(--luigi__horizontal-nav--live-height, var(--luigi__horizontal-nav--height))
    );
  }
  .iframeContainer,
  .spinnerContainer {
    position: absolute;
    top: $topNavHeight;
    left: var(--luigi__left-sidenav--width);
    bottom: 0;
    right: 0;
    width: auto;
    min-width: auto;
    min-height: auto;
    display: block;
  }

  /** TOOL LAYOUT */
  .lui-core-layout {
    position: absolute;
    width: 100%;
    height: 100%;
  }

  :global(.fd-tool-layout .fd-app__sidebar) {
    position: relative;
    height: 100%;
    top: 0;
    left: 0;
  }

  .fd-tool-layout {
    .iframeContainer,
    .spinnerContainer {
      top: 0;
      left: 0;
    }
  }

  :global(.lui-breadcrumb) .fd-tool-layout__content-container {
    margin-top: var(--luigi__breadcrumb--height);
    height: calc(100% - var(--luigi__breadcrumb--height));
  }
  .lui-box {
    height: 100%;
    position: relative;
  }

  /** Tool layout fd styles adjustments */

  .fd-tool-layout--sticky .fd-tool-layout__content-container {
    overflow: auto;
  }
  .fd-tool-layout--sticky .fd-tool-layout__navigation-container {
    overflow: visible;
    z-index: 1;
  }

  :global(.fd-navigation:not(.fd-navigation--snapped) .fd-navigation__container--top.fd-navigation__container--top) {
    overflow: auto;
  }

  :global(.fd-navigation--snapped .lui-hideOnHover:not(:hover) > :not(.lui-hideOnHover-show)) {
    display: none;
  }
  /** END: TOOL LAYOUT */

  .spinnerContainer {
    opacity: 0;
    transition: opacity 0.25s;
  }

  .fade-out {
    opacity: 1;
  }

  .iframeContainer {
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    line-height: initial; /*disable the double-scroll when zooming out the browser*/
  }

  .iframeContainer :global(iframe) {
    border: none;
    width: 100%;
    height: 100%;
    overflow: hidden;
    margin-bottom: -5px;
  }
  :global(.iframeContainerNoNav) {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
  }
  :global(.iframeContainerNoNav iframe) {
    border: none;
    width: 100%;
    height: 100%;
  }

  :global(.iframeContainer.iframeContainerTabNav) {
    top: calc(
      var(--luigi__shellbar--height) + var(--luigi__horizontal-nav--live-height, var(--luigi__horizontal-nav--height))
    );
  }
  :global(.fd-tool-layout .lui-main-content .iframeContainer.iframeContainerTabNav) {
    top: var(--luigi__horizontal-nav--live-height, var(--luigi__horizontal-nav--height));
  }

  :global(.no-top-nav .iframeContainer.iframeContainerTabNav) {
    top: calc(var(--luigi__horizontal-nav--live-height, var(--luigi__horizontal-nav--height)));
  }

  :global(.lui-breadcrumb .fd-tool-layout .iframeContainer.iframeContainerTabNav) {
    top: var(--luigi__shellbar--height);
  }

  :global(.lui-breadcrumb .fd-tool-layout .iframeContainer.iframeContainerTabNav.lui-tab-header__active) {
    top: var(--luigi__horizontal-nav--live-height, var(--luigi__horizontal-nav--height));
  }

  .iframeContainer:focus {
    outline: none;
  }
  .spinnerContainer {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .no-nav {
    .iframeContainer,
    .spinnerContainer {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
    }
    :global(.splitViewContainer),
    :global(#splitViewDragger),
    :global(#splitViewDraggerBackdrop) {
      left: 0;
    }
  }

  .no-side-nav {
    .iframeContainer,
    .spinnerContainer {
      left: 0;
    }
    :global(.splitViewContainer),
    :global(#splitViewDragger),
    :global(#splitViewDraggerBackdrop),
    :global(#tabsContainer) {
      left: 0;
    }

    :global(.fd-app__sidebar) {
      display: none;
    }
  }

  .no-top-nav {
    --luigi__shellbar--height: 0px;
  }

  :global(body.lui-simpleSlideInNav) {
    :global(.fd-app__sidebar) {
      @include transition(left 0.1s linear);
    }

    .iframeContainer,
    .spinnerContainer,
    :global(.splitViewContainer),
    :global(#splitViewDragger),
    :global(#splitViewDraggerBackdrop) {
      @include transition(left 0.1s linear, $spinnerOpacity);
    }
  }

  :global(.lui-semiCollapsible) {
    .iframeContainer,
    .spinnerContainer {
      @include transition(left 0.1s linear, $spinnerOpacity);
    }
    :global(.splitViewContainer),
    :global(#splitViewDragger),
    :global(#splitViewDraggerBackdrop) {
      @include transition(left 0.1s linear);
    }
  }

  :global(#app.no-animation) {
    :global(.fd-app__sidebar),
    :global(.spinnerContainer),
    :global(.iframeContainer) {
      @include transition(none);
    }
  }

  :global(.semiCollapsed) {
    :global(.iframeContainer),
    :global(.spinnerContainer) {
      left: $leftNavWidthCollapsed;
    }
    :global(.splitViewContainer),
    :global(#splitViewDragger),
    :global(#splitViewDraggerBackdrop),
    :global(#tabsContainer) {
      left: $leftNavWidthCollapsed;
    }
  }

  :global(.lui-global-nav-visible) {
    :global(.iframeContainer),
    :global(.spinnerContainer) {
      left: calc(var(--luigi__left-sidenav--width) + #{$globalNavWidth});
    }
    :global(.splitViewContainer),
    :global(#splitViewDragger),
    :global(#splitViewDraggerBackdrop),
    :global(#tabsContainer) {
      left: calc(var(--luigi__left-sidenav--width) + #{$globalNavWidth});
    }
  }

  :global(.lui-global-nav-visible > #app.no-side-nav) {
    .iframeContainer,
    .spinnerContainer,
    :global(.splitViewContainer) {
      left: $globalNavWidth;
    }

    :global(#tabsContainer) {
      left: $globalNavWidth;
    }
  }

  :global(.semiCollapsed.lui-global-nav-visible) {
    :global(.iframeContainer),
    :global(.spinnerContainer) {
      left: calc(#{$leftNavWidthCollapsed} + #{$globalNavWidth});
    }
    :global(.splitViewContainer),
    :global(#splitViewDragger),
    :global(#splitViewDraggerBackdrop),
    :global(#tabsContainer) {
      left: calc(#{$leftNavWidthCollapsed} + #{$globalNavWidth});
    }
  }

  :global(.lui-global-nav-visible.lui-simpleSlideInNav.lui-leftNavToggle) {
    :global(#tabsContainer) {
      left: $globalNavWidth;
    }
  }
  /*Block for setting up the width of reresponsive App title based on the global variables*/
  :global(.lui-shellbar-single-app-title) {
    padding: 0 0.625rem;
    text-decoration: none;
    max-width: var(--luigi__app-title--width);
    overflow: visible;

    :global(span) {
      display: block;
      max-width: inherit;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  :global(.lui-app-switch) {
    max-width: var(--luigi__multi-app-dropdown--width);
  }

  @media (max-width: $mobileMinWidth) {
    :global(.lui-shellbar-single-app-title) {
      padding-right: 0;
      padding-left: 0;
    }
    :global(.fd-shellbar__group--actions .fd-shellbar__action:first-child) {
      padding-left: 0;
    }

    .no-side-nav {
      :global(.lui-shellbar-single-app-title) {
        max-width: calc(var(--luigi__app-title--width) - 3rem);
      }
      :global(.lui-app-switch) {
        max-width: calc(var(--luigi__app-title--width) - 2.15rem);
      }
    }
    :global(.lui-shellbar-single-app-title) {
      max-width: calc(var(--luigi__app-title--width) - 5rem);
    }
    :global(.lui-app-switch) {
      max-width: calc(var(--luigi__multi-app-dropdown--width) - 4rem);
    }
  }

  @media (min-width: $mobileMinWidth) and (max-width: $desktopMinWidth) {
    .no-side-nav {
      :global(.lui-shellbar-single-app-title) {
        max-width: calc(var(--luigi__app-title--width) - 2rem);
      }
    }
    :global(.lui-shellbar-single-app-title),
    :global(.lui-app-switch) {
      max-width: calc(var(--luigi__app-title--width) - 3rem);
    }
  }
  /*Enbd of the block for resoonsive App title*/

  @media (max-width: $desktopMinWidth) {
    :global(.lui-global-nav-visible) {
      :global(#tabsContainer) {
        left: $globalNavWidth;
      }
    }
  }

  @media (min-width: $desktopMinWidth) {
    :global(.fd-shellbar__title) {
      display: inline;
    }

    :global(body.lui-simpleSlideInNav.lui-leftNavToggle) {
      .iframeContainer,
      .spinnerContainer {
        left: 0;
      }
      :global(.splitViewContainer),
      :global(#splitViewDragger),
      :global(#splitViewDraggerBackdrop),
      :global(#tabsContainer) {
        left: 0;
      }

      :global(.fd-app__sidebar) {
        left: calc(var(--luigi__left-sidenav--width) * -1);
      }
    }
  }

  @media (max-width: ($desktopMinWidth - 1)) {
    :global(body.lui-simpleSlideInNav) {
      .iframeContainer,
      .spinnerContainer {
        left: 0;
      }
      :global(.splitViewContainer),
      :global(#splitViewDragger),
      :global(#splitViewDraggerBackdrop) {
        left: 0;
      }

      :global(.fd-app__sidebar) {
        left: calc(var(--luigi__left-sidenav--width) * -1);
      }
    }

    :global(body.lui-global-nav-visible.lui-simpleSlideInNav) {
      .iframeContainer,
      .spinnerContainer {
        left: $globalNavWidth;
      }
      :global(.splitViewContainer),
      :global(#splitViewDragger),
      :global(#splitViewDraggerBackdrop) {
        left: $globalNavWidth;
      }

      :global(.fd-app__sidebar) {
        left: calc(var(--luigi__left-sidenav--width) * -1);
      }
    }

    :global(body.lui-simpleSlideInNav.lui-leftNavToggle) {
      :global(.fd-app__sidebar) {
        display: block;
        width: var(--luigi__left-sidenav--width);
        left: 0;
        @include box-shadow(6px 0px 9px 0px rgba(0, 0, 0, 0.44));
      }
    }

    :global(.lui-semiCollapsible) {
      .iframeContainer,
      .spinnerContainer {
        left: $leftNavWidthCollapsed;
      }
      :global(.splitViewContainer),
      :global(#splitViewDragger),
      :global(#splitViewDraggerBackdrop),
      :global(#tabsContainer) {
        left: $leftNavWidthCollapsed;
      }
    }
    :global(.lui-semiCollapsible.lui-global-nav-visible) {
      :global(.iframeContainer),
      :global(.spinnerContainer) {
        left: calc(#{$leftNavWidthCollapsed} + #{$globalNavWidth});
      }
      :global(.splitViewContainer),
      :global(#splitViewDragger),
      :global(#splitViewDraggerBackdrop),
      :global(#tabsContainer) {
        left: calc(#{$leftNavWidthCollapsed} + #{$globalNavWidth});
      }
    }
    :global(.lui-semiCollapsible:not(.semiCollapsed)) {
      :global(.fd-tool-layout .fd-navigation) {
        position: absolute;
      }
    }
    :global(.lui-semiCollapsible.semiCollapsed) {
      :global(.fd-tool-layout .fd-navigation) {
        display: none;
      }
    }
  }

  :global(html.luigi-app-in-custom-container) {
    position: relative;

    :global([luigi-app-root]) {
      position: relative;
      overflow: hidden;
    }

    .no-nav,
    .no-side-nav {
      .iframeContainer,
      .spinnerContainer {
        position: absolute;
      }

      :global(.splitViewContainer),
      :global(#splitViewDragger),
      :global(#splitViewDraggerBackdrop) {
        position: absolute;
      }
    }
  }

  :global(.fd-side-nav--condensed) {
    :global(.fd-nested-list__link) {
      font-size: 10px;
      &:global(.has-child:after) {
        height: 0;
      }
    }
  }

  //avatar clipping
  :global(.fd-avatar--circle) {
    background-clip: padding-box;
  }

  :global(.fd-shellbar__logo) {
    margin-right: 0px;
  }

  :global(.fd-menu__link) {
    text-decoration: none; //Remove underline from links in fd-menu
    border-radius: 0; //Remove border radius from links inside fd-menu
  }

  //This removes the border radius in nested menu inn the shellbar
  :global(.fd-menu) {
    :global(.fd-menu__list) {
      box-shadow: none;
    }
  }

  //Make border radius for links inside fd-menu only for the first and last elements
  :global(#app:not(.vega) .fd-menu) {
    :global(.fd-menu__list) {
      &:first-child {
        :global(.fd-menu__item) {
          &:first-child {
            @include luigi-menu__link--border-radius('top');
          }
        }
      }

      &:last-child {
        :global(.fd-menu__item) {
          &:last-child {
            @include luigi-menu__link--border-radius('bottom');
          }
        }
      }
    }
  }

  //Add z-index for dialogs
  :global(.fd-dialog, .fd-message-box) {
    z-index: $zindex-dialog-box;
  }

  :global(.fd-dialog__content--mobile),
  :global(.fd-message-box__content--mobile) {
    //Remove border-radius from mobile fullscreen dialog
    border-radius: 0;

    :global(.fd-dialog__header.fd-bar),
    :global(.fd-dialog__footer.fd-bar),
    :global(.fd-message-box__header.fd-bar),
    :global(.fd-message-box__footer.fd-bar) {
      border-radius: 0;
    }

    //Recalculate height for mobile devices
    height: calc(var(--vh, 1vh) * 100);
    max-height: calc(var(--vh, 1vh) * 100);
    -webkit-overflow-scrolling: touch;
  }

  //Recalculate height for mobile devices
  :global(.fd-product-switch__body) {
    max-height: calc(var(--vh, 1vh) * 100 - 76px);
  }

  .wcContainer {
    position: absolute;
    left: 0;
    top: 0;
    display: none;
    width: 100%;
    height: 100%;
    z-index: 0;
  }

  :global(.lui-webComponent) {
    .wcContainer {
      display: block;
    }

    :global(iframe) {
      display: none;
    }
  }

  /*this is required after FD Styles v0.13.0 in order to make mobile and desktop shellbar work fine*/
  @media (min-width: $desktopMaxWidth) {
    :global(.fd-shellbar__action--desktop) {
      display: inline-block;
    }
    :global(.fd-shellbar__action--mobile) {
      display: none;
    }
  }

  @media (max-width: ($desktopMaxWidth - 1)) {
    :global(.fd-shellbar__action--desktop) {
      display: none;
    }
    :global(.fd-shellbar__action--mobile) {
      display: inline-block;
    }
  }
</style>
