import 'mock-local-storage';
import { StorageHelpers } from '../../../src/utilities/helpers/storage-helpers';

describe('Storage-helpers', () => {
  describe('process', () => {
    const microfrontendId = 'mockMicroId';
    const hostname = 'luigi.core.test';
    let index = 0;
    let key = 'key_';
    let value = 'value_';
    let id = 'messageId_';
    let sendBackOperationSpy: any;
    const buildLuigiKey = () => {
      return 'Luigi#' + hostname + '#' + key;
    };
    const assertSendMessage = (status, result) => {
      expect(sendBackOperationSpy).toHaveBeenCalled();

      const args = sendBackOperationSpy.mock.calls[index];

      expect(args[0]).toEqual(microfrontendId);
      expect(args[1]).toEqual(id);
      expect(args[2]).toEqual(status);

      if (!result) {
        expect(!args[3]).toBe(true);
        return;
      }

      if (Array.isArray(result)) {
        expect(args[3]).toEqual(result);
        return;
      }

      expect(args[3]).toEqual(result);
    };

    beforeEach(() => {
      key = 'key_' + Math.random();
      value = 'value_' + Math.random();
      id = 'messageId_' + Math.random();
      sendBackOperationSpy = jest.spyOn(StorageHelpers, 'sendBackOperation');
      window.localStorage.clear();
    });

    afterEach(() => {
      index++;
    });

    it('setItem', () => {
      StorageHelpers.process(microfrontendId, hostname, id, 'setItem', {
        key,
        value
      });
      const luigiKey = buildLuigiKey();
      expect(window.localStorage.getItem(luigiKey)).toEqual(value);
      assertSendMessage('OK', undefined);
    });

    it('getItem', () => {
      const luigiKey = buildLuigiKey();
      window.localStorage.setItem(luigiKey, value);
      StorageHelpers.process(microfrontendId, hostname, id, 'getItem', { key });
      assertSendMessage('OK', value);
    });

    it('getItem no value', () => {
      StorageHelpers.process(microfrontendId, hostname, id, 'getItem', { key });
      assertSendMessage('OK', undefined);
    });

    it('has', () => {
      const luigiKey = buildLuigiKey();
      window.localStorage.setItem(luigiKey, value);
      StorageHelpers.process(microfrontendId, hostname, id, 'has', { key });
      assertSendMessage('OK', true);
    });

    it('has no value', () => {
      StorageHelpers.process(microfrontendId, hostname, id, 'has', { key });
      assertSendMessage('OK', false);
    });

    it('clear', () => {
      const luigiKey = buildLuigiKey();
      window.localStorage.setItem(luigiKey, value);
      StorageHelpers.process(microfrontendId, hostname, id, 'clear', {});
      expect(!window.localStorage.getItem(luigiKey)).toBe(true);
      assertSendMessage('OK', undefined);
    });

    it('removeItem', () => {
      const luigiKey = buildLuigiKey();
      window.localStorage.setItem(luigiKey, value);
      StorageHelpers.process(microfrontendId, hostname, id, 'removeItem', {
        key
      });
      expect(!window.localStorage.getItem(luigiKey)).toBe(true);
      assertSendMessage('OK', value);
    });

    it('removeItem no value', () => {
      StorageHelpers.process(microfrontendId, hostname, id, 'removeItem', {
        key
      });
      assertSendMessage('OK', undefined);
    });

    it('getAllKeys', () => {
      const luigiKey = buildLuigiKey();
      window.localStorage.setItem(luigiKey, value);
      StorageHelpers.process(microfrontendId, hostname, id, 'getAllKeys', {});
      assertSendMessage('OK', [key]);
    });
  });
});
