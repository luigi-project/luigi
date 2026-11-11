import { deSanitizeParamsMap } from '../../utilities/helpers/web-component-helpers';

/** Client facade for the isolated realm. Synchronous getters read a shell-provided snapshot. */
export function createIsolatedClient({ bridge, nodeId, eventBusElement, extendedContext, state, isChild }) {
  const request = (method, params = {}, timeout) => bridge.request(method, { ...params, nodeId }, timeout);
  const notify = (method, params = {}) => bridge.notify(method, { ...params, nodeId });
  const snapshot = () => state.snapshot.nodes[nodeId] || {};
  return {
    linkManager() {
      let options = {};
      const api = {
        fromContext(context) {
          options = { ...options, fromContext: context };
          return api;
        },
        fromClosestContext() {
          options = { ...options, fromClosestContext: true };
          return api;
        },
        fromVirtualTreeRoot() {
          options = { ...options, fromVirtualTreeRoot: true };
          return api;
        },
        fromParent() {
          options = { ...options, fromParent: true };
          return api;
        },
        withParams(params) {
          options = { ...options, nodeParams: params };
          return api;
        },
        navigate(path, preserveView) {
          notify('navigation.navigate', { path, preserveView, options });
        },
        openAsModal(path, settings, callback) {
          return request('navigation.openAsModal', { path, settings, options }, 300000).then((result) => {
            if (typeof callback === 'function') callback(result.goBackValue);
            return result;
          });
        },
        openAsDrawer(path, settings) {
          notify('navigation.openAsDrawer', { path, settings, options });
        },
        openAsSplitView(path, settings) {
          const ready = request('navigation.openAsSplitView', { path, settings, options });
          // A caller may open a split view without using its controls.
          ready.catch((error) => console.error('Luigi compound split view:', error));
          return Object.fromEntries(
            ['close', 'collapse', 'expand', 'isCollapsed', 'isExpanded', 'exists'].map((action) => [
              action,
              () => ready.then(() => request('navigation.splitView', { action }))
            ])
          );
        },
        goBack(value) {
          notify('navigation.goBack', { value });
        },
        pathExists(path) {
          return request('navigation.pathExists', { path, options });
        },
        getCurrentRoute() {
          const result = request('navigation.getCurrentRoute', { options });
          result.toString = () => state.snapshot.route;
          return result;
        }
      };
      return api;
    },
    uxManager() {
      return {
        showAlert: (settings) => request('ux.showAlert', { settings }, 300000),
        showConfirmationModal: (settings) => request('ux.showConfirmationModal', { settings }, 300000),
        showLoadingIndicator: () => notify('ux.showLoadingIndicator'),
        hideLoadingIndicator: () => notify('ux.hideLoadingIndicator'),
        closeCurrentModal: () => notify('ux.closeCurrentModal'),
        setDocumentTitle: (title) => notify('ux.setDocumentTitle', { title }),
        setDirtyStatus: (dirty) => notify('ux.setDirtyStatus', { dirty })
      };
    },
    publishEvent: (event) => eventBusElement.eventBus?.onPublishEvent(event, nodeId),
    getCurrentLocale: () => state.snapshot.locale,
    getActiveFeatureToggleList: () => state.snapshot.featureToggles,
    getActiveFeatureToggles: () => state.snapshot.featureToggles,
    getPathParams: () => extendedContext.pathParams || {},
    getCoreSearchParams: () => snapshot().searchParams || {},
    getClientPermissions: () => snapshot().clientPermissions || {},
    addCoreSearchParams: (searchParams, keepBrowserHistory = true, preventLuigiConfigUpdate = false) =>
      notify('routing.addCoreSearchParams', { searchParams, keepBrowserHistory, preventLuigiConfigUpdate }),
    addNodeParams: (params, keepBrowserHistory) => {
      if (!isChild) notify('routing.addNodeParams', { params, keepBrowserHistory });
    },
    getNodeParams: (desanitize) =>
      isChild
        ? {}
        : desanitize
          ? deSanitizeParamsMap(extendedContext.nodeParams || {})
          : extendedContext.nodeParams || {},
    setAnchor: (anchor) => {
      if (!isChild) notify('routing.setAnchor', { anchor });
    },
    getAnchor: () => state.snapshot.anchor,
    getUserSettings: () => request('settings.getUserSettings'),
    setViewGroupData: (data) => notify('navigation.setViewGroupData', { data })
  };
}
