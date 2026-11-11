import { LuigiCompoundContainer, LuigiContainer } from '@luigi-project/container';
import { LuigiContainerHelpers } from '../utilities/helpers/luigi-container-helpers';
import type { Luigi } from './luigi';
import { CustomMessagesHelpers } from '../utilities/helpers/custom-messages-helpers';

export class CustomMessages {
  luigi: Luigi;

  constructor(luigi: Luigi) {
    this.luigi = luigi;
  }

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
   */
  sendToAll(message: Record<string, any>) {
    const containers = LuigiContainerHelpers.getAllLuigiContainerIframe(this.luigi);
    if (!containers) {
      console.warn('No Luigi containers found to send the message to.');
      return;
    }
    const { id: filteredId, messageWithoutId } = CustomMessagesHelpers.filterIdFromMessageObject(message);
    if (!filteredId) {
      console.warn('Message object must contain an "id" property to specify the message type.');
      return;
    }
    for (const container of containers) {
      if (container.sendCustomMessage) {
        container.sendCustomMessage(filteredId, messageWithoutId);
      } else {
        console.warn('Container does not support sending custom messages:', container);
      }
    }
  }

  /**
   * Sends a message to specific micro frontend identified with an id.
   * Use Luigi.elements().getMicrofrontends() to get the iframe id.
   * @param {string} microfrontendId - the id of the micro frontend
   * @param {Object} message - an object containing data to be sent to the micro frontend to process it further. This object is set as an input parameter of the custom message listener on the micro frontend side
   * @param {string} message.id - the id of the message
   * @param {*} message.MY_DATA_FIELD - any other message data field
   * @example
   * Luigi.customMessages().send(microfrontend.id, {
   *     id: 'myprefix.my-custom-message-for-client',
   *     dataField1: 'here goes some data',
   *     moreData: 'here goes some more'
   * });
   */
  send(microfrontendId: string, message: Record<string, any>) {
    const containers = LuigiContainerHelpers.getAllLuigiContainerIframe(this.luigi);
    if (!containers) {
      console.warn('No Luigi containers found to send the message to.');
      return;
    }
    const { id: filteredId, messageWithoutId } = CustomMessagesHelpers.filterIdFromMessageObject(message);
    if (!filteredId) {
      console.warn('Message object must contain an "id" property to specify the message type.');
      return;
    }
    for (const container of containers) {
      if ((container as any).luigiMfId === microfrontendId) {
        if (container.sendCustomMessage) {
          container.sendCustomMessage(filteredId, messageWithoutId);
        } else {
          console.warn('Container does not support sending custom messages:', container);
        }
        return;
      }
    }
    console.warn(`No container found with microfrontend ID: ${microfrontendId}`);
  }
}
