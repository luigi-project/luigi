import type { IframeHandle, ContainerElement } from '../constants/container.model';
import { LuigiInternalMessageID } from '../constants/internal-communication';
import { containerService } from '../services/container.service';

export class ContainerAPIFunctions {
  /**
   * Updates the context of the microfrontend by sending a message to the iframe that sets the context of the microfrontend
   * @param contextObj The context data
   * @param internal internal luigi legacy data
   * @param iframeHandle a reference to the iframe that is needed to send a message to it internally
   * @param nodeParams node parameters to be sent to the microfrontend
   * @param pathParams path parameters to be sent to the microfrontend
   * @param searchParams search parameters to be sent to the microfrontend
   */
  updateContext = (
    contextObj: object,
    internal?: object,
    iframeHandle?: IframeHandle,
    nodeParams?: object,
    pathParams?: object,
    searchParams?: object
  ) => {
    if (iframeHandle) {
      const internalParameter = internal || {};
      containerService.sendCustomMessageToIframe(
        iframeHandle,
        {
          context: contextObj,
          nodeParams: nodeParams || {},
          pathParams: pathParams || {},
          searchParams: searchParams || {},
          internal: internalParameter,
          // set withoutSync to true for the container case to avoid browser history changes from luigi client
          withoutSync: true
        },
        LuigiInternalMessageID.SEND_CONTEXT_OBJECT
      );
    } else {
      console.warn('Attempting to update context on inexisting iframe');
    }
  };

  /**
   * Updates route of the microfrontend by sending a message to the iframe that sets new view URL
   * @param viewUrl new view URL
   * @param context context data
   * @param internal internal luigi legacy data
   * @param iframeHandle a reference to the iframe that is needed to send a message to it internally
   */
  updateViewUrl = (viewUrl: string, context: object, internal?: object, iframeHandle?: IframeHandle) => {
    if (iframeHandle) {
      const internalParameter = internal || {};
      containerService.sendCustomMessageToIframe(
        iframeHandle,
        {
          context,
          internal: internalParameter,
          withoutSync: false,
          viewUrl
        },
        LuigiInternalMessageID.SEND_CONTEXT_OBJECT
      );
    } else {
      console.warn('Attempting to update route on inexisting iframe');
    }
  };

  /**
   * Updates the auth data of the microfrontend by sending a message to the iframe that sets the authData of the microfrontend
   * @param iframeHandle a reference to the iframe that is needed to send a message to it internally
   * @param authData the authData object being sent to the microfrontend
   */
  updateAuthData = (iframeHandle: IframeHandle, authData: object) => {
    if (iframeHandle && authData) {
      containerService.sendCustomMessageToIframe(iframeHandle, { authData }, LuigiInternalMessageID.AUTH_SET_TOKEN);
    } else {
      console.warn('Attempting to update auth data on inexisting iframe or authData');
    }
  };

  /**
   * Send a custom message to the referenced iframe or web component
   * @param id a string containing the message id
   * @param mainComponent a reference to the web component to be affected
   * @param isWebcomponent predicate showing if currently referencing a web component or not
   * @param iframeHandle a reference to the iframe to be affected
   * @param data data to be sent alongside the custom message
   */
  sendCustomMessage = (
    id: string,
    mainComponent: ContainerElement,
    isWebcomponent: boolean,
    iframeHandle: IframeHandle,
    data?: object
  ) => {
    if (isWebcomponent && mainComponent._luigi_mfe_webcomponent) {
      containerService.dispatch(id, mainComponent._luigi_mfe_webcomponent, data);
    } else {
      const msg = { ...data };
      if (msg['id']) {
        console.warn('Property "id" is reserved and can not be used in custom message data');
      }
      msg['id'] = id;
      containerService.sendCustomMessageToIframe(iframeHandle, msg);
    }
  };

  /**
   * Send a message to the microfrontend notifying the alert has been closed
   * @param id the id of the alert being closed
   * @param dismissKey the dismiss key being sent if any (optional)
   * @param iframeHandle the handle of the iframe to send the message to (optional)
   */
  notifyAlertClosed(id: string, dismissKey?: string, iframeHandle?: IframeHandle) {
    const message = dismissKey ? { id, dismissKey } : { id };
    containerService.sendCustomMessageToIframe(iframeHandle, message, LuigiInternalMessageID.ALERT_CLOSED);
  }

  /**
   * Send a message to the microfrontend notifying the modal has been closed
   * @param modalResult the result of the modal being closed
   * @param iframeHandle the handle of the iframe to send the message to (optional)
   */
  notifyConfirmationModalClosed = (modalResult: boolean, iframeHandle?: IframeHandle) => {
    const message = { data: { confirmed: modalResult } };
    containerService.sendCustomMessageToIframe(iframeHandle, message, LuigiInternalMessageID.CONFIRMATION_MODAL_CLOSED);
  };
}

export const ContainerAPI = new ContainerAPIFunctions();
