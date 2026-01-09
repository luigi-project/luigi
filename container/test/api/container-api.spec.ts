// @ts-nocheck
import { ContainerAPIFunctions } from '../../src/api/container-api';
import { LuigiInternalMessageID } from '../../src/constants/internal-communication';
import type { IframeHandle, ContainerElement } from '../../src/constants/container.model';
import { containerService } from '../../src/services/container.service';

describe('Container Service', () => {
  describe('updateContext', () => {
    const containerAPI = new ContainerAPIFunctions();

    it('iframeHandle exists, WITH internalParam', () => {
      // mock and spy
      const contextObj = {};
      const internal = { empty: false };
      const nodeParams = {};
      const pathParams = {};
      const searchParams = {};
      const iframeHandle = {
        data: 'test'
      } as unknown as IframeHandle;
      containerService.sendCustomMessageToIframe = jest.fn();
      const spy = jest.spyOn(containerService, 'sendCustomMessageToIframe');

      // act
      containerAPI.updateContext(contextObj, internal, iframeHandle, nodeParams, pathParams, searchParams);

      // assert
      expect(spy).toHaveBeenCalledWith(
        iframeHandle,
        { context: contextObj, internal: internal, withoutSync: true, nodeParams, pathParams, searchParams },
        LuigiInternalMessageID.SEND_CONTEXT_OBJECT
      );
    });

    it('iframeHandle exists, UNDEFINED internalParam ', () => {
      // mock and spy
      const contextObj = {};
      const internal = undefined;
      const nodeParams = {};
      const pathParams = {};
      const searchParams = {};
      const iframeHandle = {
        data: 'test'
      } as unknown as IframeHandle;
      containerService.sendCustomMessageToIframe = jest.fn();
      const spy = jest.spyOn(containerService, 'sendCustomMessageToIframe');

      // act
      containerAPI.updateContext(contextObj, internal, iframeHandle, nodeParams, pathParams, searchParams);

      // assert
      expect(spy).toHaveBeenCalledWith(
        iframeHandle,
        { context: contextObj, internal: {}, withoutSync: true, nodeParams, pathParams, searchParams },
        LuigiInternalMessageID.SEND_CONTEXT_OBJECT
      );
    });

    it('iframeHandle NOT exists', () => {
      // mock and spy
      const contextObj = {};
      const internal = {};
      const iframeHandle = undefined;
      containerService.sendCustomMessageToIframe = jest.fn();
      const sendCustomMSGSpy = jest.spyOn(containerService, 'sendCustomMessageToIframe');
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(jest.fn());

      // act
      containerAPI.updateContext(contextObj, internal, iframeHandle);

      // assert
      expect(sendCustomMSGSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith('Attempting to update context on inexisting iframe');
    });
  });

  describe('updateViewUrl', () => {
    const containerAPI = new ContainerAPIFunctions();

    it('iframeHandle exists, WITH internalParam', () => {
      // mock and spy
      const viewUrl = '/';
      const context = {};
      const internal = { empty: false };
      const iframeHandle = {
        data: 'test'
      } as unknown as IframeHandle;
      containerService.sendCustomMessageToIframe = jest.fn();
      const spy = jest.spyOn(containerService, 'sendCustomMessageToIframe');

      // act
      containerAPI.updateViewUrl(viewUrl, context, internal, iframeHandle);

      // assert
      expect(spy).toHaveBeenCalledWith(
        iframeHandle,
        { viewUrl, context, internal, withoutSync: false },
        LuigiInternalMessageID.SEND_CONTEXT_OBJECT
      );
    });

    it('iframeHandle exists, UNDEFINED internalParam ', () => {
      // mock and spy
      const viewUrl = '/';
      const context = {};
      const internal = undefined;
      const iframeHandle = {
        data: 'test'
      } as unknown as IframeHandle;
      containerService.sendCustomMessageToIframe = jest.fn();
      const spy = jest.spyOn(containerService, 'sendCustomMessageToIframe');

      // act
      containerAPI.updateViewUrl(viewUrl, context, internal, iframeHandle);

      // assert
      expect(spy).toHaveBeenCalledWith(
        iframeHandle,
        { viewUrl, context, internal: {}, withoutSync: false },
        LuigiInternalMessageID.SEND_CONTEXT_OBJECT
      );
    });

    it('iframeHandle NOT exists', () => {
      // mock and spy
      const viewUrl = '/';
      const context = {};
      const internal = {};
      const iframeHandle = undefined;
      containerService.sendCustomMessageToIframe = jest.fn();
      const sendCustomMSGSpy = jest.spyOn(containerService, 'sendCustomMessageToIframe');
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(jest.fn());

      // act
      containerAPI.updateViewUrl(viewUrl, context, internal, iframeHandle);

      // assert
      expect(sendCustomMSGSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith('Attempting to update route on inexisting iframe');
    });
  });

  describe('updateAuthData', () => {
    const containerAPI = new ContainerAPIFunctions();

    it('iframeHandle exists, authData exists', () => {
      // mock and spy
      const authData = { someData: 'mytoken' };
      const iframeHandle = {
        data: 'test'
      } as unknown as IframeHandle;
      containerService.sendCustomMessageToIframe = jest.fn();
      const spy = jest.spyOn(containerService, 'sendCustomMessageToIframe');

      // act
      containerAPI.updateAuthData(iframeHandle, authData);

      // assert
      expect(spy).toHaveBeenCalledWith(iframeHandle, { authData }, LuigiInternalMessageID.AUTH_SET_TOKEN);
    });

    it('iframeHandle undefined, authData exists', () => {
      // mock and spy
      const authData = { someData: 'mytoken' };
      const iframeHandle = undefined;
      containerService.sendCustomMessageToIframe = jest.fn();
      const sendCustomMSGSpy = jest.spyOn(containerService, 'sendCustomMessageToIframe');
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(jest.fn());

      // act
      containerAPI.updateAuthData(iframeHandle, authData);

      // assert
      expect(sendCustomMSGSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith('Attempting to update auth data on inexisting iframe or authData');
    });

    it('iframeHandle exists, authData undefined', () => {
      // mock and spy
      const authData = undefined;
      const iframeHandle = undefined;
      containerService.sendCustomMessageToIframe = jest.fn();
      const sendCustomMSGSpy = jest.spyOn(containerService, 'sendCustomMessageToIframe');
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(jest.fn());

      // act
      containerAPI.updateAuthData(iframeHandle, authData);

      // assert
      expect(sendCustomMSGSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith('Attempting to update auth data on inexisting iframe or authData');
    });

    it('iframeHandle undefined, authData undefined', () => {
      // mock and spy
      const authData = undefined;
      const iframeHandle = undefined;
      containerService.sendCustomMessageToIframe = jest.fn();
      const sendCustomMSGSpy = jest.spyOn(containerService, 'sendCustomMessageToIframe');
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(jest.fn());

      // act
      containerAPI.updateAuthData(iframeHandle, authData);

      // assert
      expect(sendCustomMSGSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith('Attempting to update auth data on inexisting iframe or authData');
    });
  });

  describe('closeAlert', () => {
    const containerAPI = new ContainerAPIFunctions();

    it('notifyAlertClosed method properly called', () => {
      // mock and spy
      const id = 'some-id';
      const dismissKey = 'key';
      const iframeHandle = {
        data: 'test'
      } as unknown as IframeHandle;
      containerService.sendCustomMessageToIframe = jest.fn();
      const spy = jest.spyOn(containerService, 'sendCustomMessageToIframe');

      containerAPI.notifyAlertClosed(id, dismissKey, iframeHandle);

      expect(spy).toHaveBeenCalledWith(iframeHandle, { id, dismissKey }, LuigiInternalMessageID.ALERT_CLOSED);
    });

    it('notifyAlertClosed method properly called if no dismisskey', () => {
      // mock and spy
      const id = 'some-id';
      const iframeHandle = {
        data: 'test'
      } as unknown as IframeHandle;
      containerService.sendCustomMessageToIframe = jest.fn();
      const spy = jest.spyOn(containerService, 'sendCustomMessageToIframe');

      containerAPI.notifyAlertClosed(id, undefined, iframeHandle);

      expect(spy).toHaveBeenCalledWith(iframeHandle, { id }, LuigiInternalMessageID.ALERT_CLOSED);
    });
  });

  describe('notifyConfirmationModalClosed', () => {
    const containerAPI = new ContainerAPIFunctions();

    it.each([true, false])('notifyConfirmationModalClosed method properly called', (result) => {
      // mock and spy
      const iframeHandle = {
        data: 'test'
      } as unknown as IframeHandle;
      containerService.sendCustomMessageToIframe = jest.fn();
      const spy = jest.spyOn(containerService, 'sendCustomMessageToIframe');

      containerAPI.notifyConfirmationModalClosed(result, iframeHandle);

      expect(spy).toHaveBeenCalledWith(
        iframeHandle,
        { data: { confirmed: result } },
        LuigiInternalMessageID.CONFIRMATION_MODAL_CLOSED
      );
    });
  });

  describe('sendCustomMessage', () => {
    const containerAPI = new ContainerAPIFunctions();

    beforeEach(() => {
      // jest.restoreAllMocks();
      jest.resetAllMocks();
    });

    it('isWebComponent microfrontend', () => {
      // mock and spy
      const id = 'some-id';
      const mainComponent = {
        _luigi_mfe_webcomponent: {
          testData: 'your wc data'
        }
      } as unknown as ContainerElement;
      const data = {
        sample: 'test'
      };
      const isWebComponent = true;
      const iframeHandle = {
        data: 'test'
      } as unknown as IframeHandle;

      containerService.dispatch = jest.fn();
      const spy = jest.spyOn(containerService, 'dispatch');

      containerAPI.sendCustomMessage(id, mainComponent, isWebComponent, iframeHandle, data);

      expect(spy).toHaveBeenCalledWith(id, mainComponent._luigi_mfe_webcomponent, data);
    });

    it('isWebComponent FALSE, WITH msg ID', () => {
      // mock and spy
      const id = 'some-id';
      const mainComponent = {} as unknown as ContainerElement;
      const data = {
        id: id
      };
      const isWebComponent = false;
      const iframeHandle = {
        data: 'test'
      } as unknown as IframeHandle;

      containerService.sendCustomMessageToIframe = jest.fn();
      const sendCustomMSGSpy = jest.spyOn(containerService, 'sendCustomMessageToIframe');
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(jest.fn());

      // act
      containerAPI.sendCustomMessage(id, mainComponent, isWebComponent, iframeHandle, data);

      // assert
      expect(sendCustomMSGSpy).toHaveBeenCalledWith(iframeHandle, data);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Property "id" is reserved and can not be used in custom message data'
      );
    });

    it('isWebComponent FALSE, UNDEFINED msg ID', () => {
      // mock and spy
      const id = 'some-id';
      const mainComponent = {} as unknown as ContainerElement;
      const data = {};
      const isWebComponent = false;
      const iframeHandle = {
        data: 'test'
      } as unknown as IframeHandle;

      containerService.sendCustomMessageToIframe = jest.fn();
      const sendCustomMSGSpy = jest.spyOn(containerService, 'sendCustomMessageToIframe');
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {
        jest.fn();
      });

      // act
      containerAPI.sendCustomMessage(id, mainComponent, isWebComponent, iframeHandle, data);

      // assert
      expect(sendCustomMSGSpy).toHaveBeenCalledWith(iframeHandle, { id });
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });
});
