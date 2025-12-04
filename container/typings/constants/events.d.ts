/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="../../typings/constants/event-payloads.ts" />
import type {
  AlertRequestPayload,
  ConfirmationModalRequestPayload,
  CurrentRouteRequestPayload,
  ModalPathDataRequestPayload,
  ModalSettingsRequestPayload,
  NavigationRequestPayload,
  ParamsRequestPayload
} from 'EventPayloads';

/* eslint-disable @typescript-eslint/no-unsafe-function-type */
export namespace Events {
  /**
   * Event fired when the micro frontend sends a custom message.
   * @type {Object}
   * @property {object} data - event data
   * @property {string} id - event ID
   * @example
   * {
   *  data: {},
   *  id: 'some-id'
   * }
   * @returns {void}
   *
   * <br>
   */
  export const CUSTOM_MESSAGE = 'custom-message';

  /**
   * Event left due to historical reasons - do not use.
   * @deprecated
   * @ignore
   */
  export const GET_CONTEXT_REQUEST = 'get-context-request';

  /**
   * Event fired when a navigation has been requested by the micro frontend. <br><br>
   * Payload: {@link https://github.com/luigi-project/luigi/blob/main/container/typings/constants/event-payloads.ts|NavigationRequestPayload}
   * @type {NavigationRequestPayload}
   * @example
   * {
   *  fromClosestContext: false,
   *  fromContext: null,
   *  fromParent: true,
   *  fromVirtualTreeRoot: false,
   *  link: '/test/route',
   *  nodeParams: {}
   * }
   * @returns {void}
   *
   * <br>
   */
  export const NAVIGATION_REQUEST = 'navigation-request';

  /**
   * Event fired when the micro frontend requests to show an alert. <br>
   * Read more about `showAlert` params [here](https://docs.luigi-project.io/docs/luigi-core-api?section=showalert). <br><br>
   * Payload: {@link https://github.com/luigi-project/luigi/blob/main/container/typings/constants/event-payloads.ts|AlertRequestPayload}
   * @type {AlertRequestPayload}
   * @example
   * {
   *  text: 'Custom alert message',
   *  type: 'info',
   *  links: {
   *   goToHome: { text: 'Homepage', url: '/overview' },
   *   goToOtherProject: { text: 'Other project', url: '/projects/pr2' },
   *   relativePath: { text: 'Hide side nav', url: 'hideSideNav' },
   *   neverShowItAgain: { text: 'Never show it again', dismissKey: 'neverShowItAgain' }
   *  },
   *  closeAfter: 3000
   * }
   * @returns {void}
   *
   * <br>
   */
  export const ALERT_REQUEST = 'show-alert-request';

  /**
   * Event left due to historical reasons - do not use.
   * @deprecated
   * @ignore
   */
  export const ALERT_CLOSED = 'close-alert-request';

  /**
   * Event fired when the micro frontend has been initialized.
   * @type {unspecified} (type is not relevant in this case)
   * @returns {void}
   *
   * <br>
   */
  export const INITIALIZED = 'initialized';

  /**
   * Event fired when the micro frontend requests the addition of search parameters to the URL. <br><br>
   * Payload: {@link https://github.com/luigi-project/luigi/blob/main/container/typings/constants/event-payloads.ts|ParamsRequestPayload}
   * @type {ParamsRequestPayload}
   * @example
   * {
   *  data: {},
   *  keepBrowserHistory: false
   * }
   * @returns {void}
   *
   * <br>
   */
  export const ADD_SEARCH_PARAMS_REQUEST = 'add-search-params-request';

  /**
   * Event fired when the micro frontend requests the addition of node parameters to the URL. <br><br>
   * Payload: {@link https://github.com/luigi-project/luigi/blob/main/container/typings/constants/event-payloads.ts|ParamsRequestPayload}
   * @type {ParamsRequestPayload}
   * @example
   * {
   *  data: {},
   *  keepBrowserHistory: false
   * }
   * @returns {void}
   *
   * <br>
   */
  export const ADD_NODE_PARAMS_REQUEST = 'add-node-params-request';

  /**
   * Event fired when the micro frontend requests to show a confirmation modal. <br>
   * Read more about `showConfirmationModal` params [here](https://docs.luigi-project.io/docs/luigi-core-api?section=showconfirmationmodal). <br><br>
   * Payload: {@link https://github.com/luigi-project/luigi/blob/main/container/typings/constants/event-payloads.ts|ConfirmationModalRequestPayload}
   * @type {ConfirmationModalRequestPayload}
   * @example
   * {
   *  header: 'Confirmation',
   *  body: 'Are you sure you want to do this?',
   *  buttonConfirm: 'Yes',
   *  buttonDismiss: 'No'
   * }
   * @returns {void}
   *
   * <br>
   */
  export const SHOW_CONFIRMATION_MODAL_REQUEST = 'show-confirmation-modal-request';

  /**
   * Event fired when the micro frontend requests to show a loading indicator.
   * @type {unspecified} (type is not relevant in this case)
   * @returns {void}
   *
   * <br>
   */
  export const SHOW_LOADING_INDICATOR_REQUEST = 'show-loading-indicator-request';

  /**
   * Event fired when the micro frontend requests to hide the loading indicator.
   * @type {unspecified} (type is not relevant in this case)
   * @returns {void}
   *
   * <br>
   */
  export const HIDE_LOADING_INDICATOR_REQUEST = 'hide-loading-indicator-request';

  /**
   * Event fired when the micro frontend requests to set the current locale.
   * @type {Object.<string, string>}
   * @example
   * {
   *  currentLocale: 'en'
   * }
   * @returns {void}
   *
   * <br>
   */
  export const SET_CURRENT_LOCALE_REQUEST = 'set-current-locale-request';

  /**
   * Event fired when the micro frontend requests to modify the local storage.
   * @type {Object.<string, string>}
   * @example
   * {
   *  key: 'luigi-version',
   *  value: '2.21.0'
   * }
   * @returns {void}
   *
   * <br>
   */
  export const LOCAL_STORAGE_SET_REQUEST = 'set-storage-request';

  /**
   * Event fired when the micro frontend requests to handle errors that might happen during the runtime of the micro frontend.
   * @type {unspecified} (type is not relevant in this case)
   * @returns {void}
   *
   * <br>
   */
  export const RUNTIME_ERROR_HANDLING_REQUEST = 'runtime-error-handling-request';

  /**
   * Event fired when the micro frontend requests to set the anchor of the URL.
   * @type {string}
   * @example 'some-anchor'
   * @returns {void}
   *
   * <br>
   */
  export const SET_ANCHOR_LINK_REQUEST = 'set-anchor-request';

  /**
   * Event fired when the micro frontend requests to set third-party cookies.
   * @type {unspecified} (type is not relevant in this case)
   * @returns {void}
   *
   * <br>
   */
  export const SET_THIRD_PARTY_COOKIES_REQUEST = 'set-third-party-cookies-request';

  /**
   * Event left due to historical reasons - use 'GO_BACK_REQUEST' instead.
   * @deprecated
   * @ignore
   */
  export const BACK_NAVIGATION_REQUEST = 'navigate-back-request';

  /**
   * Event fired when the micro frontend requests the current app route. <br><br>
   * Payload: {@link https://github.com/luigi-project/luigi/blob/main/container/typings/constants/event-payloads.ts|CurrentRouteRequestPayload}
   * @type {CurrentRouteRequestPayload}
   * @example
   * {
   *  fromClosestContext: false,
   *  fromContext: null,
   *  fromParent: true,
   *  fromVirtualTreeRoot: false,
   *  nodeParams: {}
   * }
   * @returns {void}
   *
   * <br>
   */
  export const GET_CURRENT_ROUTE_REQUEST = 'get-current-route-request';

  /**
   * Event fired to report that the micro frontend's navigation has completed.
   * @type {unspecified} (type is not relevant in this case)
   * @returns {void}
   *
   * <br>
   */
  export const NAVIGATION_COMPLETED_REPORT = 'report-navigation-completed-request';

  /**
   * Event fired when the micro frontend requests to update the modal path parameters. <br><br>
   * Payload: {@link https://github.com/luigi-project/luigi/blob/main/container/typings/constants/event-payloads.ts|ModalPathDataRequestPayload}
   * @type {ModalPathDataRequestPayload}
   * @example
   * {
   *  fromClosestContext: false,
   *  fromContext: null,
   *  fromParent: true,
   *  fromVirtualTreeRoot: false,
   *  history: true,
   *  link: '/test/route',
   *  modal: { title: 'Some modal' },
   *  nodeParams: {}
   * }
   * @returns {void}
   *
   * <br>
   */
  export const UPDATE_MODAL_PATH_DATA_REQUEST = 'update-modal-path-data-request';

  /**
   * Event fired when the micro frontend requests to update the modal settings. <br>
   * Read more about `updateModalSettings` params [here](https://docs.luigi-project.io/docs/luigi-client-api?section=updatemodalsettings). <br><br>
   * Payload: {@link https://github.com/luigi-project/luigi/blob/main/container/typings/constants/event-payloads.ts|ModalSettingsRequestPayload}
   * @type {ModalSettingsRequestPayload}
   * @example
   * {
   *  addHistoryEntry: true,
   *  updatedModalSettings: {}
   * }
   * @returns {void}
   *
   * <br>
   */
  export const UPDATE_MODAL_SETTINGS_REQUEST = 'update-modal-settings-request';

  /**
   * Event fired when the micro frontend requests to check the validity of a path.
   * @type {Object.<string, string>}
   * @example
   * {
   *  link: '/test/route'
   * }
   * @returns {void}
   *
   * <br>
   */
  export const CHECK_PATH_EXISTS_REQUEST = 'check-path-exists-request';

  /**
   * Event fired when the micro frontend requests to set the 'dirty status' which, for example, avoids closing when there are any unsaved changes.
   * @type {Object.<string, boolean>}
   * @example
   * {
   *  dirty: true
   * }
   * @returns {void}
   *
   * <br>
   */
  export const SET_DIRTY_STATUS_REQUEST = 'set-dirty-status-request';

  /**
   * Event fired when the micro frontend requests to set the view group data.
   * @type {Object.<string, unknown>}
   * @example
   * {
   *  vg: 'some data'
   * }
   * @returns {void}
   *
   * <br>
   */
  export const SET_VIEW_GROUP_DATA_REQUEST = 'set-viewgroup-data-request';

  /**
   * Event left due to historical reasons - do not use.
   * @deprecated
   * @ignore
   */
  export const SET_DOCUMENT_TITLE_REQUEST = 'set-document-title-request';

  /**
   * Event left due to historical reasons - do not use.
   * @deprecated
   * @ignore
   */
  export const OPEN_USER_SETTINGS_REQUEST = 'open-user-settings-request';

  /**
   * Event left due to historical reasons - do not use.
   * @deprecated
   * @ignore
   */
  export const CLOSE_USER_SETTINGS_REQUEST = 'close-user-settings-request';

  /**
   * Event left due to historical reasons - do not use.
   * @deprecated
   * @ignore
   */
  export const COLLAPSE_LEFT_NAV_REQUEST = 'collapse-leftnav-request';

  /**
   * Event left due to historical reasons - do not use.
   * @deprecated
   * @ignore
   */
  export const UPDATE_TOP_NAVIGATION_REQUEST = 'update-top-navigation-request';

  /**
   * Event left due to historical reasons - use 'CHECK_PATH_EXISTS_REQUEST' instead.
   * @deprecated
   * @ignore
   */
  export const PATH_EXISTS_REQUEST = 'path-exists-request';

  /**
   * Event fired when the micro frontend requests to navigate back.
   * @type {Object.<string, unknown>}
   * @example
   * {
   *  ctx: 'some context'
   * }
   * @returns {void}
   *
   * <br>
   */
  export const GO_BACK_REQUEST = 'go-back-request';

  /**
   * Event left due to historical reasons - do not use.
   * @deprecated
   * @ignore
   */
  export const HAS_BACK_REQUEST = 'has-back-request';

  /**
   * Event fired when the micro frontend requests to display the backdrop.
   * @type {unspecified} (type is not relevant in this case)
   * @returns {void}
   *
   * <br>
   */
  export const ADD_BACKDROP_REQUEST = 'add-backdrop-request';

  /**
   * Event fired when the micro frontend requests to remove the backdrop.
   * @type {unspecified} (type is not relevant in this case)
   * @returns {void}
   */
  export const REMOVE_BACKDROP_REQUEST = 'remove-backdrop-request';

  /**
   * Event fired when the micro frontend requests to close the current modal.
   * @type {unspecified} (type is not relevant in this case)
   * @returns {void}
   */
  export const CLOSE_CURRENT_MODAL_REQUEST = 'close-current-modal-request';
}

export class LuigiEvent extends Event {
  payload?: unknown;
  detail: unknown;
  private callbackFn: Function | undefined;

  constructor(type: string, data: unknown, payload?: unknown, callback?: Function) {
    super(type);
    this.detail = data;
    this.payload = payload || data || {};
    this.callbackFn = callback;
  }

  callback(data: unknown): void {
    if (this.callbackFn) {
      this.callbackFn(data);
    }
  }
}

export { Events as LuigiEvents };
