import {
  AuthData,
  ClientPermissions,
  Context,
  CoreSearchParams,
  LinkManager,
  NodeParams,
  PathParams,
  StorageManager,
  UserSettings,
  UxManager
} from '../luigi-client';
import { helpers } from './helpers';
import _lifecycleManager from './lifecycleManager';
import _linkManager from './linkManager';
import _storageManager from './storageManager';
import _uxManager from './uxManager';

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
        window.addEventListener('error', ({ filename, message, lineno, colno, error }: ErrorEvent) => {
          const msg: Record<string, any> = {
            errorObj: { filename, message, lineno, colno, error },
            msg: 'luigi-runtime-error-handling'
          };

          helpers.sendPostMessageToLuigiCore(msg);
        });
      }
    }
  }

  addInitListener(initFn: (context: Context, origin?: string) => void, disableTpcCheck: boolean): number {
    return _lifecycleManager.addInitListener(initFn, disableTpcCheck);
  }

  removeInitListener(id: string): boolean {
    return _lifecycleManager.removeInitListener(id);
  }

  addContextUpdateListener(contextUpdatedFn: (context: Context) => void): string {
    return _lifecycleManager.addContextUpdateListener(contextUpdatedFn);
  }

  removeContextUpdateListener(id: string): boolean {
    return _lifecycleManager.removeContextUpdateListener(id);
  }

  getToken(): AuthData['accessToken'] {
    return _lifecycleManager.getToken();
  }

  getEventData(): Context {
    return _lifecycleManager.getEventData();
  }

  getContext(): Context {
    return _lifecycleManager.getContext();
  }

  addNodeParams(params: NodeParams, keepBrowserHistory: boolean): void {
    return _lifecycleManager.addNodeParams(params, keepBrowserHistory);
  }

  getNodeParams(shouldDesanitise?: boolean): NodeParams {
    return _lifecycleManager.getNodeParams(shouldDesanitise);
  }

  getActiveFeatureToggles(): string[] {
    return _lifecycleManager.getActiveFeatureToggles();
  }

  getPathParams(): PathParams {
    return _lifecycleManager.getPathParams();
  }

  getCoreSearchParams(): CoreSearchParams {
    return _lifecycleManager.getCoreSearchParams();
  }

  addCoreSearchParams(searchParams: CoreSearchParams, keepBrowserHistory: boolean): void {
    return _lifecycleManager.addCoreSearchParams(searchParams, keepBrowserHistory);
  }

  getClientPermissions(): ClientPermissions {
    return _lifecycleManager.getClientPermissions();
  }

  sendCustomMessage(message: Object): void {
    return _lifecycleManager.sendCustomMessage(message);
  }

  addCustomMessageListener(messageId: string, listener: (customMessage: Object, listenerId: string) => void): string {
    return _lifecycleManager.addCustomMessageListener(messageId, listener);
  }

  removeCustomMessageListener(listenerId: string): boolean {
    return _lifecycleManager.removeCustomMessageListener(listenerId);
  }

  addInactiveListener(inactiveFn: () => void): string {
    return _lifecycleManager.addInactiveListener(inactiveFn);
  }

  removeInactiveListener(listenerId: string): boolean {
    return _lifecycleManager.removeInactiveListener(listenerId);
  }

  setTargetOrigin(origin: string): void {
    return _lifecycleManager.setTargetOrigin(origin);
  }

  getUserSettings(): UserSettings {
    return _lifecycleManager.getUserSettings();
  }

  isLuigiClientInitialized(): boolean {
    return _lifecycleManager.isLuigiClientInitialized();
  }

  luigiClientInit(): void {
    return _lifecycleManager.luigiClientInit();
  }

  getAnchor(): string {
    return _lifecycleManager.getAnchor();
  }

  setAnchor(value: string): void {
    return _lifecycleManager.setAnchor(value);
  }

  setViewGroupData(value: Object): void {
    return _lifecycleManager.setViewGroupData(value);
  }

  /**
   * @private
   */
  linkManager(): LinkManager {
    return _linkManager;
  }

  /**
   * @private
   */
  uxManager(): UxManager {
    return _uxManager;
  }

  /**
   * @private
   */
  lifecycleManager(): any {
    return _lifecycleManager;
  }

  /**
   * @private
   */
  storageManager(): StorageManager {
    return _storageManager;
  }
}

const _luigiClient = new LuigiClient();

(window as any).LuigiClient = _luigiClient || {};

export default _luigiClient;
