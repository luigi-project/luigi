const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');

import { AuthHelpers, GenericHelpers } from '../../../src/utilities/helpers';
import { AuthStoreSvc } from '../../../src/services';
import { LuigiAuth } from '../../../src/core-api';

describe('Auth-helpers', function() {
  jest.retryTimes(2);

  afterEach(() => {
    sinon.restore();
  });

  describe('getStoredAuthData', () => {
    beforeEach(() => {
      sinon.stub(AuthStoreSvc, 'getAuthData');
    });

    it('return message from getAuthData()', () => {
      AuthStoreSvc.getAuthData.returns('Stored data');
      const result = AuthHelpers.getStoredAuthData();
      assert.equal(result, 'Stored data');
    });
  });

  describe('isLoggedIn', () => {
    beforeEach(() => {
      sinon.stub(AuthHelpers, 'getStoredAuthData');
    });
    it('return true if token expiration date is valid', () => {
      AuthHelpers.getStoredAuthData.returns({
        accessToken: 'thisisanaccesstoken',
        accessTokenExpirationDate: Date.now() + 3600000,
        idToken: '123'
      });
      const result = AuthHelpers.isLoggedIn();
      assert.equal(result, true);
    });
    it('return false if token expiration date is not valid', () => {
      AuthHelpers.getStoredAuthData.returns({
        accessToken: 'thisisanaccesstoken',
        accessTokenExpirationDate: 1575035663808,
        idToken: '123'
      });
      const result = AuthHelpers.isLoggedIn();
      assert.equal(result, false);
    });
  });

  describe('parseUrlAuthErrors', () => {
    it('returns complete error object', () => {
      sinon
        .stub(GenericHelpers, 'getUrlParameter')
        .onFirstCall()
        .returns('mockError')
        .onSecondCall()
        .returns('an error description');

      const err = AuthHelpers.parseUrlAuthErrors();
      assert.equal(err.error, 'mockError');
      assert.equal(err.errorDescription, 'an error description');

      GenericHelpers.getUrlParameter.restore();
    });

    it('returns only error without description', () => {
      sinon
        .stub(GenericHelpers, 'getUrlParameter')
        .onFirstCall()
        .returns('mockError')
        .onSecondCall()
        .returns(undefined);

      const err = AuthHelpers.parseUrlAuthErrors();
      assert.equal(err.error, 'mockError');
      assert.equal(err.errorDescription, undefined);

      GenericHelpers.getUrlParameter.restore();
    });

    it('without error', () => {
      sinon
        .stub(GenericHelpers, 'getUrlParameter')
        .onFirstCall()
        .returns(undefined)
        .onSecondCall()
        .returns(undefined);

      assert.equal(AuthHelpers.parseUrlAuthErrors(), undefined);

      GenericHelpers.getUrlParameter.restore();
    });
  });

  describe('handleUrlAuthErrors', () => {
    beforeEach(() => {
      sinon.spy(LuigiAuth, 'handleAuthEvent');
    });
    afterEach(() => {
      sinon.restore();
    });

    const mockProviderInstanceSettings = {
      logoutUrl: 'http://auth.luigi.domain/api/logout',
      post_logout_redirect_uri: 'http://luigi.domain/logout.html'
    };

    it('without error', async () => {
      assert.isTrue(await AuthHelpers.handleUrlAuthErrors({}));
      assert.isTrue(LuigiAuth.handleAuthEvent.notCalled);
    });

    it('with error param', async () => {
      await AuthHelpers.handleUrlAuthErrors(mockProviderInstanceSettings, 'mockError');
      assert.isTrue(LuigiAuth.handleAuthEvent.calledOnce);
    });

    it('with error and error param', async () => {
      const error = 'mockError';
      const errorDescription = 'An error description';

      await AuthHelpers.handleUrlAuthErrors(mockProviderInstanceSettings, error, errorDescription);

      assert.isTrue(LuigiAuth.handleAuthEvent.calledOnce, 'called once');
      LuigiAuth.handleAuthEvent.calledWith(
        'onAuthError',
        mockProviderInstanceSettings,
        { error, errorDescription },
        mockProviderInstanceSettings.logoutUrl +
          '?post_logout_redirect_uri=' +
          mockProviderInstanceSettings.post_logout_redirect_uri +
          '&error=' +
          error +
          '&errorDescription=' +
          error,
        'called with valid data'
      );
    });
  });
});
