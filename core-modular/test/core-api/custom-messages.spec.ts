import { CustomMessages } from '../../src/core-api/custom-messages';
import type { Luigi } from '../../src/core-api/luigi';
import { LuigiContainerHelpers } from '../../src/utilities/helpers/luigi-container-helpers';

jest.mock('../../src/utilities/helpers/luigi-container-helpers', () => ({
  LuigiContainerHelpers: {
    getAllLuigiContainerIframe: jest.fn()
  }
}));

const mockGetAllContainers = LuigiContainerHelpers.getAllLuigiContainerIframe as jest.Mock;

function makeLuigi(): Luigi {
  return {} as unknown as Luigi;
}

function makeContainer(overrides: { luigiMfId?: string; sendCustomMessage?: jest.Mock | null } = {}) {
  return {
    luigiMfId: overrides.luigiMfId ?? undefined,
    sendCustomMessage: overrides.sendCustomMessage !== null ? (overrides.sendCustomMessage ?? jest.fn()) : undefined
  };
}

describe('CustomMessages', () => {
  let customMessages: CustomMessages;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    customMessages = new CustomMessages(makeLuigi());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('sendToAll', () => {
    it('sends custom message to all containers', () => {
      const container1 = makeContainer();
      const container2 = makeContainer();
      mockGetAllContainers.mockReturnValue([container1, container2]);

      customMessages.sendToAll({ id: 'myEvent', data: 'hello' });

      expect(container1.sendCustomMessage).toHaveBeenCalledWith('myEvent', { data: 'hello' });
      expect(container2.sendCustomMessage).toHaveBeenCalledWith('myEvent', { data: 'hello' });
    });

    it('warns when no containers are found', () => {
      mockGetAllContainers.mockReturnValue(null);

      customMessages.sendToAll({ id: 'myEvent' });

      expect(consoleWarnSpy).toHaveBeenCalledWith('No Luigi containers found to send the message to.');
    });

    it('warns when message has no id property', () => {
      mockGetAllContainers.mockReturnValue([makeContainer()]);

      customMessages.sendToAll({ data: 'hello' });

      expect(consoleWarnSpy).toHaveBeenCalledWith('Message object must contain an "id" property to specify the message type.');
    });

    it('warns when container does not support sendCustomMessage', () => {
      const container = makeContainer({ sendCustomMessage: null });
      mockGetAllContainers.mockReturnValue([container]);

      customMessages.sendToAll({ id: 'myEvent' });

      expect(consoleWarnSpy).toHaveBeenCalledWith('Container does not support sending custom messages:', container);
    });

    it('sends message with multiple data properties', () => {
      const container = makeContainer();
      mockGetAllContainers.mockReturnValue([container]);

      customMessages.sendToAll({ id: 'update', foo: 'bar', count: 42, nested: { a: 1 } });

      expect(container.sendCustomMessage).toHaveBeenCalledWith('update', { foo: 'bar', count: 42, nested: { a: 1 } });
    });

    it('sends message with id only', () => {
      const container = makeContainer();
      mockGetAllContainers.mockReturnValue([container]);

      customMessages.sendToAll({ id: 'ping' });

      expect(container.sendCustomMessage).toHaveBeenCalledWith('ping', {});
    });
  });

  describe('send', () => {
    it('sends custom message to the matching container', () => {
      const container1 = makeContainer({ luigiMfId: 'mf1' });
      const container2 = makeContainer({ luigiMfId: 'mf2' });
      mockGetAllContainers.mockReturnValue([container1, container2]);

      customMessages.send('mf2', { id: 'myEvent', data: 'hello' });

      expect(container1.sendCustomMessage).not.toHaveBeenCalled();
      expect(container2.sendCustomMessage).toHaveBeenCalledWith('myEvent', { data: 'hello' });
    });

    it('warns when no containers are found', () => {
      mockGetAllContainers.mockReturnValue(null);

      customMessages.send('mf1', { id: 'myEvent' });

      expect(consoleWarnSpy).toHaveBeenCalledWith('No Luigi containers found to send the message to.');
    });

    it('warns when message has no id property', () => {
      mockGetAllContainers.mockReturnValue([makeContainer({ luigiMfId: 'mf1' })]);

      customMessages.send('mf1', { data: 'hello' });

      expect(consoleWarnSpy).toHaveBeenCalledWith('Message object must contain an "id" property to specify the message type.');
    });

    it('warns when no container matches the microfrontend ID', () => {
      mockGetAllContainers.mockReturnValue([makeContainer({ luigiMfId: 'mf1' })]);

      customMessages.send('nonExistent', { id: 'myEvent' });

      expect(consoleWarnSpy).toHaveBeenCalledWith('No container found with microfrontend ID: nonExistent');
    });

    it('warns when matching container does not support sendCustomMessage', () => {
      const container = makeContainer({ luigiMfId: 'mf1', sendCustomMessage: null });
      mockGetAllContainers.mockReturnValue([container]);

      customMessages.send('mf1', { id: 'myEvent' });

      expect(consoleWarnSpy).toHaveBeenCalledWith('Container does not support sending custom messages:', container);
    });

    it('stops after finding the first matching container', () => {
      const container1 = makeContainer({ luigiMfId: 'mf1' });
      const container2 = makeContainer({ luigiMfId: 'mf1' });
      mockGetAllContainers.mockReturnValue([container1, container2]);

      customMessages.send('mf1', { id: 'myEvent' });

      expect(container1.sendCustomMessage).toHaveBeenCalledTimes(1);
      expect(container2.sendCustomMessage).not.toHaveBeenCalled();
    });

    it('passes the luigi instance to getAllLuigiContainerIframe', () => {
      const luigi = makeLuigi();
      customMessages = new CustomMessages(luigi);
      mockGetAllContainers.mockReturnValue([]);

      customMessages.send('mf1', { id: 'myEvent' });

      expect(mockGetAllContainers).toHaveBeenCalledWith(luigi);
    });
  });
});
