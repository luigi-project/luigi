import 'mock-local-storage';
import { StorageHelpers } from '../../../src/utilities/helpers/storage-helpers';

const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');

describe('Storage-helpers', () => {
  describe('process', () => {
    const microfrontendId = 'mockMicroId';
    const hostname = 'luigi.core.test';
    let key = 'key_';
    let value = 'value_';
    let id = 'messageId_';
    let sendBackOperationSpy;
    const buildLuigiKey = () => {
      return 'Luigi#' + hostname + '#' + key;
    };
    const assertSendMessage = (status, result) => {
      assert(sendBackOperationSpy.calledOnce);
      let args = sendBackOperationSpy.getCalls()[0].args;
      assert(sendBackOperationSpy.calledOnce);
      assert.equal(args[0], microfrontendId, 'sendBackOperation argument microfrontendId is different from  expected');
      assert.equal(args[1], id, 'sendBackOperation argument id is different from  expected');
      assert.equal(args[2], status, 'sendBackOperation argument status is different from  expected');
      if (!result) {
        assert.isTrue(!args[3], 'sendBackOperation argument result shuld be undefined for this operation');
        return;
      }
      if (Array.isArray(result)) {
        assert.deepEqual(args[3], result, 'sendBackOperation argument result is different from  expected');
        return;
      }
      assert.equal(args[3], result, 'sendBackOperation argument result is different from  expected');
    };

    beforeEach(() => {
      key = 'key_' + Math.random();
      value = 'value_' + Math.random();
      id = 'messageId_' + Math.random();
      sendBackOperationSpy = sinon.spy(StorageHelpers, 'sendBackOperation');
      window.localStorage.clear();
    });

    afterEach(() => {
      sinon.restore();
    });

    it('setItem', () => {
      StorageHelpers.process(microfrontendId, hostname, id, 'setItem', {
        key,
        value
      });
      const luigiKey = buildLuigiKey();
      assert.equal(window.localStorage.getItem(luigiKey), value, 'Luigi value is different for setItem');
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
      assert.isTrue(!window.localStorage.getItem(luigiKey), 'After clear, item should not be present');
      assertSendMessage('OK', undefined);
    });

    it('removeItem', () => {
      const luigiKey = buildLuigiKey();
      window.localStorage.setItem(luigiKey, value);
      StorageHelpers.process(microfrontendId, hostname, id, 'removeItem', {
        key
      });
      assert.isTrue(!window.localStorage.getItem(luigiKey), 'After removed, item should not be present');
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
