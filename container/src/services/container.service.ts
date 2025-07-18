/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="../../typings/constants/event-payloads.ts" />
import type {
  AlertRequestPayload,
  CheckPathPostMessageData,
  ConfirmationModalRequestPayload,
  CurrentRoutePostMessageData,
  CurrentRouteRequestPayload,
  ModalPathDataRequestPayload,
  ModalSettingsRequestPayload,
  NavigationRequestPayload,
  ParamsRequestPayload
} from 'EventPayloads';
import { Events, LuigiEvent } from '../constants/communication';
import type { ContainerElement, IframeHandle } from '../constants/container.model';
import { LuigiInternalMessageID } from '../constants/internal-communication';

export class ContainerService {
  /**
   * Checks if the given HTML element is visible in the DOM by considering both
   * its width/height and any client rectangles it may have.
   *
   * @param {HTMLElement} component - The HTML element to check for visibility.
   * @returns {boolean} Returns true if the element is visible, otherwise false.
   */
  isVisible(component: HTMLElement): boolean {
    return !!(component.offsetWidth || component.offsetHeight || component.getClientRects().length);
  }

  /**
   * Sends a message to the iframe either with the custom keyword or any other message name
   * @param iframeHandle the iframe to send the message to
   * @param msg the message to be sent
   * @param msgName the optional message name
   */
  sendCustomMessageToIframe(iframeHandle: IframeHandle | undefined, msg: object, msgName?: string) {
    const messageName = msgName || 'custom';

    if (iframeHandle?.iframe?.contentWindow) {
      const iframeUrl = new URL(iframeHandle.iframe.src);

      if (messageName === 'custom') {
        iframeHandle.iframe.contentWindow.postMessage({ msg: messageName, data: msg }, iframeUrl.origin);
      } else {
        iframeHandle.iframe.contentWindow.postMessage({ msg: messageName, ...msg }, iframeUrl.origin);
      }
    } else {
      console.error('Message target could not be resolved');
    }
  }

  /**
   * Dispatch an event to the given target container with additional payload
   * @param {string} msg the event message
   * @param {ContainerElement} targetCnt the targeted HTML element onto which the event is dispatched
   * @param {Object} data custom data added to the event to be dispatched
   * @param {Object | string} payload additional data added to the event for internal objectives
   * @param {Function} callback optional callback function
   */
  dispatchWithPayload(
    msg: string,
    targetCnt: ContainerElement,
    data: object,
    payload: object,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callback?: (arg?: any) => void
  ): void {
    this.dispatch(msg, targetCnt, data, callback, payload);
  }

  /**
   * Dispatch an event to the given target container
   * @param {string} msg the event message
   * @param {ContainerElement} targetCnt the targeted HTML element onto which the event is dispatched
   * @param {Object} data custom data added to the event to be dispatched
   * @param {Function} callback optional callback function
   */
  dispatch(
    msg: string,
    targetCnt: ContainerElement,
    data: object | string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callback?: (arg?: any) => void,
    payload?: object
  ): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const customEvent: any = new LuigiEvent(msg, data, payload, callback);

    targetCnt.dispatchEvent(customEvent);
  }

  /**
   * Retrieves the target container based on the event source.
   *
   * @param event The event object representing the source of the container.
   * @returns {ContainerElement | undefined} The target container object or undefined if not found.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getTargetContainer(event: any): ContainerElement | undefined {
    let cnt: ContainerElement | undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).__luigi_container_manager.container.forEach((element: ContainerElement) => {
      if (element.iframeHandle?.iframe && element.iframeHandle.iframe.contentWindow === event.source) {
        cnt = element;
      }
    });

    return cnt;
  }

  /**
   * Initializes the Luigi Container Manager responsible for managing communication
   * between microfrontends and dispatching events accordingly. Also adds 'message' listener to the window object with
   * the defined messageListener list
   * @returns __luigi_container_manager which has the added container array and message listeners
   */
  getContainerManager() {
    /* eslint-disable */
    if (!(globalThis as any).__luigi_container_manager) {
      (globalThis as any).__luigi_container_manager = {
        container: [],
        messageListener: (event: any) => {
          // Handle incoming messages and dispatch events based on the message type
          // (Custom messages, navigation requests, alert requests, etc.)
          const targetCnt = this.getTargetContainer(event);
          const target = targetCnt?.iframeHandle?.iframe?.contentWindow;

          if (target && target === event.source) {
            // messages emitted from microfrontends
            const msg = event.data.msg;

            // dispatch an event depending on message
            switch (msg) {
              case LuigiInternalMessageID.CUSTOM_MESSAGE:
                {
                  const evData = event.data.data;
                  const id = evData.id;

                  delete evData.id;
                  this.dispatch(Events.CUSTOM_MESSAGE, targetCnt, {
                    id: id,
                    _metaData: {},
                    data: evData
                  });
                }
                break;
              case LuigiInternalMessageID.GET_CONTEXT:
                // Automatically send a luigi.init message to complete the initial handshake with the microfrontend
                target.postMessage(
                  {
                    msg: LuigiInternalMessageID.SEND_CONTEXT_HANDSHAKE,
                    context: targetCnt.context || {},
                    internal: {
                      thirdPartyCookieCheck: {
                        disabled: targetCnt.skipCookieCheck === 'true'
                      }
                    },
                    authData: targetCnt.authData || {},
                    nodeParams: targetCnt.nodeParams || {},
                    searchParams: targetCnt.searchParams || {},
                    pathParams: targetCnt.pathParams || {}
                  },
                  event.origin
                );
                break;
              case LuigiInternalMessageID.NAVIGATION_REQUEST:
                this.dispatch(Events.NAVIGATION_REQUEST, targetCnt, event.data.params as NavigationRequestPayload);
                break;
              case LuigiInternalMessageID.ALERT_REQUEST:
                this.dispatchWithPayload(
                  Events.ALERT_REQUEST,
                  targetCnt,
                  event,
                  event.data?.data?.settings as AlertRequestPayload,
                  (dismissKey?: boolean | string) => {
                    targetCnt.notifyAlertClosed(event.data?.data?.settings?.id, dismissKey);
                  }
                );
                break;
              case LuigiInternalMessageID.INITIALIZED:
                this.dispatch(Events.INITIALIZED, targetCnt, event.data?.params || {});
                break;
              case LuigiInternalMessageID.ADD_SEARCH_PARAMS_REQUEST:
                this.dispatch(
                  Events.ADD_SEARCH_PARAMS_REQUEST,
                  targetCnt,
                  {
                    data: event.data.data,
                    keepBrowserHistory: event.data.keepBrowserHistory
                  } as ParamsRequestPayload
                );
                break;
              case LuigiInternalMessageID.ADD_NODE_PARAMS_REQUEST:
                this.dispatch(
                  Events.ADD_NODE_PARAMS_REQUEST,
                  targetCnt,
                  {
                    data: event.data.data,
                    keepBrowserHistory: event.data.keepBrowserHistory
                  } as ParamsRequestPayload
                );
                break;
              case LuigiInternalMessageID.SHOW_CONFIRMATION_MODAL_REQUEST:
                this.dispatchWithPayload(
                  Events.SHOW_CONFIRMATION_MODAL_REQUEST,
                  targetCnt,
                  event.data.data,
                  event.data.data?.settings as ConfirmationModalRequestPayload,
                  (modalResult: boolean) => {
                    targetCnt.notifyConfirmationModalClosed(modalResult);
                  }
                );
                break;
              case LuigiInternalMessageID.SHOW_LOADING_INDICATOR_REQUEST:
                this.dispatch(Events.SHOW_LOADING_INDICATOR_REQUEST, targetCnt, event);
                break;
              case LuigiInternalMessageID.HIDE_LOADING_INDICATOR_REQUEST:
                this.dispatch(Events.HIDE_LOADING_INDICATOR_REQUEST, targetCnt, event);
                break;
              case LuigiInternalMessageID.SET_CURRENT_LOCALE_REQUEST:
                this.dispatchWithPayload(Events.SET_CURRENT_LOCALE_REQUEST, targetCnt, event, event.data.data);
                break;
              case LuigiInternalMessageID.LOCAL_STORAGE_SET_REQUEST:
                this.dispatchWithPayload(Events.LOCAL_STORAGE_SET_REQUEST, targetCnt, event, event.data.data?.params);
                break;
              case LuigiInternalMessageID.RUNTIME_ERROR_HANDLING_REQUEST:
                this.dispatch(Events.RUNTIME_ERROR_HANDLING_REQUEST, targetCnt, event);
                break;
              case LuigiInternalMessageID.SET_ANCHOR_LINK_REQUEST:
                this.dispatchWithPayload(Events.SET_ANCHOR_LINK_REQUEST, targetCnt, event, event.data.anchor);
                break;
              case LuigiInternalMessageID.SET_THIRD_PARTY_COOKIES_REQUEST:
                this.dispatch(Events.SET_THIRD_PARTY_COOKIES_REQUEST, targetCnt, event);
                break;
              case LuigiInternalMessageID.BACK_NAVIGATION_REQUEST:
                {
                  let gbctx = event.data?.goBackContext || {};
                  if (typeof gbctx === 'string') {
                    try {
                      gbctx = JSON.parse(gbctx);
                    } catch (e) {
                      console.warn(e);
                    }
                  }
                  this.dispatch(Events.GO_BACK_REQUEST, targetCnt, gbctx);
                  this.dispatch(Events.BACK_NAVIGATION_REQUEST, targetCnt, event); // for BW compatibility
                }
                break;
              case LuigiInternalMessageID.GET_CURRENT_ROUTE_REQUEST:
                this.dispatchWithPayload(
                  Events.GET_CURRENT_ROUTE_REQUEST,
                  targetCnt,
                  event,
                  event.data.data as CurrentRouteRequestPayload,
                  (route: string) => {
                    target.postMessage(
                      {
                        msg: LuigiInternalMessageID.SEND_CURRENT_ROUTE_ANSWER,
                        data: {
                          correlationId: event.data?.data?.id,
                          route
                        } as CurrentRoutePostMessageData
                      },
                      event.origin
                    );
                  }
                );
                break;
              case LuigiInternalMessageID.NAVIGATION_COMPLETED_REPORT:
                this.dispatch(Events.NAVIGATION_COMPLETED_REPORT, targetCnt, event);
                break;
              case LuigiInternalMessageID.UPDATE_MODAL_PATH_DATA_REQUEST:
                this.dispatchWithPayload(
                  Events.UPDATE_MODAL_PATH_DATA_REQUEST,
                  targetCnt,
                  event,
                  event.data.params as ModalPathDataRequestPayload
                );
                break;
              case LuigiInternalMessageID.UPDATE_MODAL_SETTINGS:
                this.dispatchWithPayload(Events.UPDATE_MODAL_SETTINGS_REQUEST, targetCnt, event, {
                  addHistoryEntry: event.data.addHistoryEntry,
                  updatedModalSettings: event.data.updatedModalSettings
                } as ModalSettingsRequestPayload);
                break;
              case LuigiInternalMessageID.CHECK_PATH_EXISTS_REQUEST:
                this.dispatchWithPayload(
                  Events.CHECK_PATH_EXISTS_REQUEST,
                  targetCnt,
                  event,
                  event.data.data,
                  (pathExists: boolean) => {
                    target.postMessage(
                      {
                        msg: LuigiInternalMessageID.SEND_PATH_EXISTS_ANSWER,
                        data: {
                          correlationId: event.data?.data?.id,
                          pathExists
                        } as CheckPathPostMessageData
                      },
                      event.origin
                    );
                  }
                );
                break;
              case LuigiInternalMessageID.SET_DIRTY_STATUS_REQUEST:
                this.dispatchWithPayload(Events.SET_DIRTY_STATUS_REQUEST, targetCnt, event, {
                  dirty: event.data.dirty
                });
                break;
              case LuigiInternalMessageID.SET_VIEW_GROUP_DATA_REQUEST:
                this.dispatch(Events.SET_VIEW_GROUP_DATA_REQUEST, targetCnt, event.data.data);
                break;
              case LuigiInternalMessageID.ADD_BACKDROP_REQUEST:
                this.dispatch(Events.ADD_BACKDROP_REQUEST, targetCnt, event);
                break;
              case LuigiInternalMessageID.REMOVE_BACKDROP_REQUEST:
                this.dispatch(Events.REMOVE_BACKDROP_REQUEST, targetCnt, event);
                break;
            }
          }
        }
      };
      window.addEventListener('message', (globalThis as any).__luigi_container_manager.messageListener);
    }

    return (globalThis as any).__luigi_container_manager;
    /* eslint-enable */
  }

  /**
   * Adds thisComponent's object reference the the __luigi_container_manager container list
   *
   * @param {HTMLElement} thisComponent - The HTML element that represents the current rendered container (thisComponent)
   */
  registerContainer(thisComponent: HTMLElement): void {
    this.getContainerManager().container.push(thisComponent);
  }
}

export const containerService = new ContainerService();
