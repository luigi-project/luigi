import { LuigiCompoundContainer, LuigiContainer } from '@luigi-project/container';
import { LuigiContainerHelpers } from '../utilities/helpers/luigi-container-helpers';
import type { Luigi } from './luigi';
import { CustomMessagesHelpers } from '../utilities/helpers/custom-messages-helpers';

export class CustomMessages {
  luigi: Luigi;

  constructor(luigi: Luigi) {
    this.luigi = luigi;
  }

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
