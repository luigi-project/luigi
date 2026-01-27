import { LuigiConfig } from '../../src/core-api';

const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');

import { AuthStoreSvc } from '../../src/services';

describe('AuthStore', () => {
  beforeEach(() => {
    sinon.stub(AuthStoreSvc, '_setStore');
    sinon.stub(AuthStoreSvc, '_getStore');

    console.error = sinon.spy();
  });
  afterEach(() => {
    sinon.restore();
  });
  describe('Internal fns', () => {
    let sessionStorageSpy;
    let localStorageSpy;

    beforeEach(() => {
      AuthStoreSvc._setStore.restore();
      AuthStoreSvc._getStore.restore();
      const sstorageMock = {
        getItem: sinon.stub(),
        setItem: sinon.stub()
      };
      const lstorageMock = {
        getItem: sinon.stub(),
        setItem: sinon.stub()
      };
      sessionStorageSpy = jest.spyOn(global, 'sessionStorage', 'get');
      localStorageSpy = jest.spyOn(global, 'localStorage', 'get');
      sessionStorageSpy.mockImplementation(() => {
        return sstorageMock;
      });
      localStorageSpy.mockImplementation(() => {
        return lstorageMock;
      });
      sinon.stub(AuthStoreSvc, 'getStorageType').returns('localStorage');
    });
    afterEach(() => {
      sinon.restore();
      sessionStorageSpy.mockRestore();
      localStorageSpy.mockRestore();
    });

    describe('_setStore', () => {
      xit('default: stores a value in localStorage', () => {
        const mockKey = 'mock.auth';
        const mockData = { key: 'something' };

        // ERROR opaque origins
        AuthStoreSvc._setStore(mockKey, mockData);

        sinon.assert.calledWithExactly(global.localStorage.setItem, mockKey, JSON.stringify(mockData));
      });
      xit('sessionStorage: stores a value in sessionStorage', () => {
        // ERROR opaque origins
      });
      it('none: stores a value in memory', () => {
        const mockKey = 'mock.auth';
        const mockData = 'something';
        AuthStoreSvc.getStorageType.returns('none');

        AuthStoreSvc._setStore(mockKey, mockData);

        sinon.assert.notCalled(global.localStorage.setItem);
        assert.equal(AuthStoreSvc[mockKey], mockData);
      });
      it('invalid: shows console.error on wrong setting', () => {
        console.error.resetHistory();
        const mockKey = 'mock.auth';
        const mockData = 'something';
        AuthStoreSvc.getStorageType.returns('invalid');

        AuthStoreSvc._setStore(mockKey, mockData);

        sinon.assert.calledOnce(console.error);
      });
    });
    describe('_getStore', () => {
      xit('default: localStorage', () => {
        // ERROR opaque origins
      });
      xit('sessionStorage', () => {
        AuthStoreSvc.getStorageType.returns('sessionStorage');
        // ERROR opaque origins
      });
      it('none: from memory', () => {
        AuthStoreSvc.getStorageType.returns('none');
        const mockKey = 'mock.auth';
        const mockData = 'something';
        AuthStoreSvc[mockKey] = mockData;

        const result = AuthStoreSvc._getStore(mockKey);

        sinon.assert.notCalled(global.localStorage.getItem);
        sinon.assert.notCalled(global.sessionStorage.getItem);
        assert.equal(result, mockData);
      });
      it('invalid: shows console.error on wrong setting', () => {
        console.error.resetHistory();
        const mockKey = 'mock.auth';
        AuthStoreSvc.getStorageType.returns('invalid');

        AuthStoreSvc._getStore(mockKey);

        sinon.assert.calledOnce(console.error);
      });
    });
  });

  describe('Methods', () => {
    describe('getStorageKey', () => {
      it('retrieves the internal key', () => {
        assert.equal(AuthStoreSvc.getStorageKey(), 'luigi.auth');
      });
    });
    describe('getStorageType', () => {
      beforeEach(() => {
        AuthStoreSvc._storageType = undefined;
        sinon.stub(LuigiConfig, 'getConfigValue');
        sinon.stub(LuigiConfig, 'initialized').value(true);
      });
      it('no config', () => {
        assert.equal(AuthStoreSvc.getStorageType(), 'localStorage');
        sinon.assert.calledOnce(LuigiConfig.getConfigValue);
      });
      it('config defined', () => {
        LuigiConfig.getConfigValue.returns('sessionStorage');
        assert.equal(AuthStoreSvc.getStorageType(), 'sessionStorage');
        sinon.assert.calledOnce(LuigiConfig.getConfigValue);
      });
      it('subsequent calls with cached config value', () => {
        AuthStoreSvc._storageType = 'localStorage';
        assert.equal(AuthStoreSvc.getStorageType(), 'localStorage');
        assert.equal(AuthStoreSvc.getStorageType(), 'localStorage');
        sinon.assert.notCalled(LuigiConfig.getConfigValue);
      });
    });
    describe('storageKey and -type based methods', () => {
      beforeEach(() => {
        // sinon.stub(AuthStoreSvc, '_setStore'); // WHY does it not work if this is defined here
        sinon.stub(AuthStoreSvc, 'getStorageKey').returns('luigi.auth');
        sinon.stub(AuthStoreSvc, 'getStorageType').returns('localStorage');
      });
      afterEach(() => {
        sinon.restore();
      });

      describe('getAuthData', () => {
        it('calls the store with the internal storage key', () => {
          const mockKey = 'some.key';
          AuthStoreSvc.getStorageKey.returns(mockKey);

          AuthStoreSvc.getAuthData();

          sinon.assert.calledWithExactly(AuthStoreSvc._getStore, mockKey);
        });
      });
      describe('setAuthData', () => {
        sinon.stub(AuthStoreSvc, '_setStore'); // WHY definition required?
        const mockData = { key: 'something' };

        AuthStoreSvc.setAuthData(mockData);

        sinon.assert.calledWithExactly(AuthStoreSvc._setStore, 'luigi.auth', mockData);
        sinon.restore();
      });
      describe('removeAuthData', () => {
        sinon.stub(AuthStoreSvc, '_setStore'); // WHY definition required?

        AuthStoreSvc.removeAuthData();

        sinon.assert.calledWithExactly(AuthStoreSvc._setStore, 'luigi.auth', undefined);
        sinon.restore();
      });
      describe('isNewlyAuthorized', () => {
        it('gets boolean false from undefined store', () => {
          AuthStoreSvc._getStore.returns(undefined);

          const result = AuthStoreSvc.isNewlyAuthorized();

          sinon.assert.alwaysCalledWithExactly(AuthStoreSvc._getStore, 'luigi.newlyAuthorized');
          assert.isFalse(result);
        });
        it('gets true from defined value', () => {
          AuthStoreSvc._getStore.returns(true);

          const result = AuthStoreSvc.isNewlyAuthorized();

          sinon.assert.alwaysCalledWithExactly(AuthStoreSvc._getStore, 'luigi.newlyAuthorized');
          assert.isTrue(result);
        });
      });
      describe('setNewlyAuthorized', () => {
        sinon.stub(AuthStoreSvc, '_setStore'); // WHY definition required?

        AuthStoreSvc.setNewlyAuthorized();

        sinon.assert.alwaysCalledWithExactly(AuthStoreSvc._setStore, 'luigi.newlyAuthorized', true);
        sinon.restore();
      });
      describe('removeNewlyAuthorized', () => {
        sinon.stub(AuthStoreSvc, '_setStore'); // WHY definition required?

        AuthStoreSvc.removeNewlyAuthorized();

        sinon.assert.alwaysCalledWithExactly(AuthStoreSvc._setStore, 'luigi.newlyAuthorized', undefined);
        sinon.restore();
      });
    });
  });
});
