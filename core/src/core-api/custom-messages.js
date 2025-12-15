import { IframeHelpers } from '../utilities/helpers';
import { MessagesListeners } from '../services/messages-listeners';

/**
 * Functions related to custom messages.
 * @default Luigi.customMessages()
 * @name CustomMessages
 * @class
 */
class CustomMessagesManager {
  /**
   * Sends a custom message to all opened micro frontends.
   * @param {Object} message - an object containing data to be sent to the micro frontend to process it further. This object is set as an input parameter of the custom message listener on the micro frontend side.
   * @param {string} message.id - the id of the message
   * @param {*} message.MY_DATA_FIELD - any other message data field
   * @example
   * Luigi.customMessages().sendToAll({
   *     id: 'myprefix.my-custom-message-for-client',
   *     dataField1: 'here goes some data',
   *     moreData: 'here goes some more'
   * });
   * @memberof CustomMessages
   * @since 0.6.2
   */
  sendToAll(message) {
    const internalMessage = MessagesListeners.convertCustomMessageUserToInternal(message);
    IframeHelpers.getMicrofrontendsInDom()
      .map((microfrontendObj) => microfrontendObj.container)
      .map((mfContainer) => IframeHelpers.sendMessageToIframe(mfContainer, internalMessage));
  }

  /**
   * Sends a message to specific micro frontend identified with an id.
   * Use Luigi.elements().getMicrofrontends() to get the iframe id.
   * @param {number} microfrontendId - the id of the micro frontend
   * @param {Object} message - an object containing data to be sent to the micro frontend to process it further. This object is set as an input parameter of the custom message listener on the micro frontend side
   * @param {number} message.id - the id of the message
   * @param {*} message.MY_DATA_FIELD - any other message data field
   * @example
   * Luigi.customMessages().send(microfrontend.id, {
   *     id: 'myprefix.my-custom-message-for-client',
   *     dataField1: 'here goes some data',
   *     moreData: 'here goes some more'
   * });
   * @memberof CustomMessages
   * @since 0.6.2
   */
  send(microfrontendId, message) {
    const internalMessage = MessagesListeners.convertCustomMessageUserToInternal(message);
    IframeHelpers.getMicrofrontendsInDom()
      .filter((microfrontendObj) => microfrontendObj.id === microfrontendId)
      .map((microfrontendObj) => microfrontendObj.container)
      .map((mfContainer) => IframeHelpers.sendMessageToIframe(mfContainer, internalMessage));
  }
}

export const customMessages = new CustomMessagesManager();
