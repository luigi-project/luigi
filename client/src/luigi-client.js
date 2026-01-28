import { lifecycleManager } from './lifecycleManager';
import { linkManager } from './linkManager';
import { uxManager } from './uxManager';
import { storageManager } from './storageManager';
import { helpers } from './helpers';

/**
 * @name LuigiClient
 * @private
 */
class LuigiClient {
  constructor() {
    if (window !== window.top) {
      if (window.document.head.getAttribute('disable-luigi-history-handling') !== 'true') {
        history.pushState = history.replaceState.bind(history);
      }
      if (window.document.head.getAttribute('disable-luigi-runtime-error-handling') !== 'true') {
        window.addEventListener('error', ({ filename, message, lineno, colno, error }) => {
          const msg = {
            msg: 'luigi-runtime-error-handling',
            errorObj: { filename, message, lineno, colno, error }
          };
          helpers.sendPostMessageToLuigiCore(msg);
        });
      }
    }
  }

  addInitListener(initFn, disableTpcCheck) {
    return lifecycleManager.addInitListener(initFn, disableTpcCheck);
  }
  removeInitListener(id) {
    return lifecycleManager.removeInitListener(id);
  }
  addContextUpdateListener(contextUpdatedFn) {
    return lifecycleManager.addContextUpdateListener(contextUpdatedFn);
  }
  removeContextUpdateListener(id) {
    return lifecycleManager.removeContextUpdateListener(id);
  }
  getToken() {
    return lifecycleManager.getToken();
  }
  getEventData() {
    return lifecycleManager.getEventData();
  }
  getContext() {
    return lifecycleManager.getContext();
  }
  addNodeParams(params, keepBrowserHistory) {
    return lifecycleManager.addNodeParams(params, keepBrowserHistory);
  }
  getNodeParams(shouldDesanitise) {
    return lifecycleManager.getNodeParams(shouldDesanitise);
  }
  getActiveFeatureToggles() {
    return lifecycleManager.getActiveFeatureToggles();
  }
  getPathParams() {
    return lifecycleManager.getPathParams();
  }
  getCoreSearchParams() {
    return lifecycleManager.getCoreSearchParams();
  }
  addCoreSearchParams(searchParams, keepBrowserHistory) {
    return lifecycleManager.addCoreSearchParams(searchParams, keepBrowserHistory);
  }
  getClientPermissions() {
    return lifecycleManager.getClientPermissions();
  }
  sendCustomMessage(message) {
    return lifecycleManager.sendCustomMessage(message);
  }
  addCustomMessageListener(messageId, listener) {
    return lifecycleManager.addCustomMessageListener(messageId, listener);
  }
  removeCustomMessageListener(listenerId) {
    return lifecycleManager.removeCustomMessageListener(listenerId);
  }
  addInactiveListener(messageId, listener) {
    return lifecycleManager.addInactiveListener(messageId, listener);
  }
  removeInactiveListener(listenerId) {
    return lifecycleManager.removeInactiveListener(listenerId);
  }
  setTargetOrigin(origin) {
    return lifecycleManager.setTargetOrigin(origin);
  }
  getUserSettings() {
    return lifecycleManager.getUserSettings();
  }
  isLuigiClientInitialized() {
    return lifecycleManager.isLuigiClientInitialized();
  }
  luigiClientInit() {
    return lifecycleManager.luigiClientInit();
  }
  getAnchor() {
    return lifecycleManager.getAnchor();
  }
  setAnchor(value) {
    return lifecycleManager.setAnchor(value);
  }
  setViewGroupData(value) {
    return lifecycleManager.setViewGroupData(value);
  }

  /**
   * @private
   */
  linkManager() {
    return new linkManager({
      currentContext: lifecycleManager.currentContext
    });
  }
  /**
   * @private
   */
  uxManager() {
    return uxManager;
  }
  /**
   * @private
   */
  lifecycleManager() {
    return lifecycleManager;
  }
  /**
   * @private
   */
  storageManager() {
    return storageManager;
  }
}
export default LuigiClient = new LuigiClient();
