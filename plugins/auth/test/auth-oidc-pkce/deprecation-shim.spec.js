import openIdConnect from '../../src/auth-oidc-pkce/index.js';

jest.mock('oidc-client-ts', () => ({
  UserManager: jest.fn().mockImplementation((settings) => ({
    settings,
    events: {
      addUserLoaded: jest.fn(),
      addAccessTokenExpired: jest.fn(),
      addAccessTokenExpiring: jest.fn(),
      addSilentRenewError: jest.fn()
    },
    signinRedirectCallback: jest.fn().mockRejectedValue(new Error('no response')),
    signinSilent: jest.fn().mockResolvedValue({})
  })),
  WebStorageStateStore: jest.fn(),
  InMemoryWebStorage: jest.fn()
}));

const { UserManager } = require('oidc-client-ts');

const RENAMES = [
  ['accessTokenExpiringNotificationTime', 'accessTokenExpiringNotificationTimeInSeconds'],
  ['silentRequestTimeout', 'silentRequestTimeoutInSeconds'],
  ['checkSessionInterval', 'checkSessionIntervalInSeconds'],
  ['revokeAccessTokenOnSignout', 'revokeTokensOnSignout'],
  ['clockSkew', 'clockSkewInSeconds'],
  ['staleStateAge', 'staleStateAgeInSeconds']
];

describe('auth-oidc-pkce deprecation shim', () => {
  let warnSpy;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    UserManager.mockClear();
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  describe.each(RENAMES)('rename %s → %s', (oldKey, newKey) => {
    it('translates old key to new key and warns', async () => {
      await new openIdConnect({ [oldKey]: 42 });

      const passedSettings = UserManager.mock.calls[0][0];
      expect(passedSettings[newKey]).toBe(42);
      expect(passedSettings[oldKey]).toBeUndefined();
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining(`"${oldKey}" has been renamed to "${newKey}"`));
    });

    it('does not warn when only the new key is set', async () => {
      await new openIdConnect({ [newKey]: 99 });

      const passedSettings = UserManager.mock.calls[0][0];
      expect(passedSettings[newKey]).toBe(99);
      expect(warnSpy).not.toHaveBeenCalledWith(expect.stringContaining(oldKey));
    });

    it('new key takes precedence when both are set', async () => {
      await new openIdConnect({ [oldKey]: 1, [newKey]: 2 });

      const passedSettings = UserManager.mock.calls[0][0];
      expect(passedSettings[newKey]).toBe(2);
      expect(passedSettings[oldKey]).toBeUndefined();
      expect(warnSpy).not.toHaveBeenCalled();
    });
  });

  it('translates multiple deprecated keys in one call', async () => {
    await new openIdConnect({
      clockSkew: 10,
      staleStateAge: 300,
      silentRequestTimeout: 5000
    });

    const passedSettings = UserManager.mock.calls[0][0];
    expect(passedSettings.clockSkewInSeconds).toBe(10);
    expect(passedSettings.staleStateAgeInSeconds).toBe(300);
    expect(passedSettings.silentRequestTimeoutInSeconds).toBe(5000);
    expect(warnSpy).toHaveBeenCalledTimes(3);
  });

  it('does not warn when no deprecated keys are used', async () => {
    await new openIdConnect({ authority: 'https://idp.example.com', client_id: 'app' });

    expect(warnSpy).not.toHaveBeenCalled();
  });
});
