export namespace LuigiInternalMessageID {
  /**
   * A message emmitted from the Microfrontend when a custom message is sent
   */
  export const CUSTOM_MESSAGE = 'custom';
  /**
   * A message emmitted from the Microfrontend when the context data is sent
   */
  export const GET_CONTEXT = 'luigi.get-context';
  /**
   * A message sent to the microfrontend from parent with the context upon init
   */
  export const SEND_CONTEXT_HANDSHAKE = 'luigi.init';

  /**
   * A message sent from the Microfrontend when the context data has been received properly
   */
  export const CONTEXT_RECEIVED = 'luigi.init.ok';
  /**
   * A message emmitted from the Microfrontend when a navigation request is sent
   */
  export const NAVIGATION_REQUEST = 'luigi.navigation.open';
  /**
   * A message emmitted from the Microfrontend when a request to show an alert is sent
   */
  export const ALERT_REQUEST = 'luigi.ux.alert.show';
  /**
   * A message sent to the microfrontend to notify closing of a particular alert
   */
  export const ALERT_CLOSED = 'luigi.ux.alert.hide';
  /**
   * A message emmitted from the Microfrontend when it is first initialized
   */
  export const INITIALIZED = 'luigi.init.ok';
  /**
   * A message emmitted from the Microfrontend to request adding search parameters to the URL
   */
  export const ADD_SEARCH_PARAMS_REQUEST = 'luigi.addSearchParams';
  /**
   * A message emmitted from the Microfrontend to request adding node parameters to the URL
   */
  export const ADD_NODE_PARAMS_REQUEST = 'luigi.addNodeParams';
  /**
   * A message emmitted from the Microfrontend when a request to show an confirmation modal is sent
   */
  export const SHOW_CONFIRMATION_MODAL_REQUEST = 'luigi.ux.confirmationModal.show';
  /**
   * A message sent to the microfrontend to notify closing of a particular confirmation modal
   */
  export const CONFIRMATION_MODAL_CLOSED = 'luigi.ux.confirmationModal.hide';
  /**
   * A message emmitted from the Microfrontend when a request to show loading indicator is sent
   */
  export const SHOW_LOADING_INDICATOR_REQUEST = 'luigi.show-loading-indicator';
  /**
   * A message emmitted from the Microfrontend when a request to hide the loading indicator is sent
   */
  export const HIDE_LOADING_INDICATOR_REQUEST = 'luigi.hide-loading-indicator';

  /**
   * A message emmitted from the Microfrontend when a request to set the current locale is sent
   */
  export const SET_CURRENT_LOCALE_REQUEST = 'luigi.ux.set-current-locale';

  /**
   * A message emmitted from the Microfrontend when a request to modify the local storage is sent
   */
  export const LOCAL_STORAGE_SET_REQUEST = 'storage';

  /**
   * A message emmitted from the Microfrontend when a request to handle an error that happened during the runtime on the microfrontend is sent
   */
  export const RUNTIME_ERROR_HANDLING_REQUEST = 'luigi-runtime-error-handling';

  /**
   * A message emmitted from the Microfrontend when a request to set the anchor of the URL is sent
   */
  export const SET_ANCHOR_LINK_REQUEST = 'luigi.setAnchor';

  /**
   * A message emmitted from the Microfrontend when a request to set third party cookies is sent
   */
  export const SET_THIRD_PARTY_COOKIES_REQUEST = 'luigi.third-party-cookie';

  /**
   * A message emmitted from the Microfrontend when a request to navigate back is sent
   */
  export const BACK_NAVIGATION_REQUEST = 'luigi.navigation.back';

  /**
   * A message emmitted from the Microfrontend when a request to receive the current app route is sent
   */
  export const GET_CURRENT_ROUTE_REQUEST = 'luigi.navigation.currentRoute';

  /**
   * A message sent to the microfrontend from parent with the current app route
   */
  export const SEND_CURRENT_ROUTE_ANSWER = 'luigi.navigation.currentRoute.answer';

  /**
   * A message sent to the Microfrontend with the payload being the context being sent
   */
  export const SEND_CONTEXT_OBJECT = 'luigi.navigate';

  /**
   * A message emmitted from the Microfrontend to report that the navigation is completed is sent
   */
  export const NAVIGATION_COMPLETED_REPORT = 'luigi.navigate.ok';

  /**
   * A message sent to the microfronted from parent that the modal has been closed
   */
  export const CLOSE_MODAL_ANSWER = 'luigi.navigation.modal.close';

  /**
   * A message emmitted from the Microfrontend when a request to update the modal path parameters is sent
   */
  export const UPDATE_MODAL_PATH_DATA_REQUEST = 'luigi.navigation.updateModalDataPath';

  /**
   * A message emmitted from the Microfrontend when a request to update the modal settings is sent
   */
  export const UPDATE_MODAL_SETTINGS = 'luigi.navigation.updateModalSettings';

  /**
   * A message emmitted from the Microfrontend when a request to check on the validity of a path is sent
   */
  export const CHECK_PATH_EXISTS_REQUEST = 'luigi.navigation.pathExists';

  /**
   * A message sent to the microfrontend from parent with the result of checking validity of a path
   */
  export const SEND_PATH_EXISTS_ANSWER = 'luigi.navigation.pathExists.answer';

  /**
   * A message emmitted from the Microfrontend when a request to set the 'dirty status' (ex: avoid closing if usaved changes) is sent
   */
  export const SET_DIRTY_STATUS_REQUEST = 'luigi.set-page-dirty';

  /**
   * A message emmitted from the Microfrontend when a request to set the 'token auth' is sent
   */
  export const AUTH_SET_TOKEN = 'luigi.auth.tokenIssued';

  /**
   * A message emmitted from the Microfrontend when a request to set backdrop is sent
   */
  export const ADD_BACKDROP_REQUEST = 'luigi.add-backdrop';

  /**
   * A message emmitted from the Microfrontend when a request to remove backdrop is sent
   */
  export const REMOVE_BACKDROP_REQUEST = 'luigi.remove-backdrop';

  /**
   * A message emmitted from the Microfrontend when a request to set the viewgroup data is sent
   */
  export const SET_VIEW_GROUP_DATA_REQUEST = 'luigi.setVGData';

  /**
   * A message emmitted from the Microfrontend when a request to close the current modal is sent
   */
  export const CLOSE_CURRENT_MODAL_REQUEST = 'luigi.close-modal';
}
