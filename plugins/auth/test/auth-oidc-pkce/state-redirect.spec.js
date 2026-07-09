import openIdConnect from '../../src/auth-oidc-pkce/index.js';

// Mock oidc-client-ts so the login callback path in `_processLoginResponse()`
// can be driven end-to-end. We want the `state`-handling branch in
// `setTimeout` to run, so `signinRedirectCallback` resolves with a chosen
// state value. The `mock` prefix is required by jest's mock-factory hoisting
// rule (see the "Invalid variable access" error otherwise).
let mockSigninResult;

jest.mock('oidc-client-ts', () => ({
  UserManager: jest.fn().mockImplementation((settings) => ({
    settings,
    events: {
      addUserLoaded: jest.fn(),
      addAccessTokenExpired: jest.fn(),
      addAccessTokenExpiring: jest.fn(),
      addSilentRenewError: jest.fn(),
    },
    signinRedirectCallback: jest.fn(() => Promise.resolve(mockSigninResult)),
    signinSilent: jest.fn().mockResolvedValue({}),
  })),
  WebStorageStateStore: jest.fn(),
  InMemoryWebStorage: jest.fn(),
}));

describe('auth-oidc-pkce state handling in _processLoginResponse', () => {
  const originalLocation = window.location;
  let pushStateSpy;

  beforeEach(() => {
    global.Luigi.auth = jest.fn(() => ({
      store: { setAuthData: jest.fn(), removeAuthData: jest.fn() },
      handleAuthEvent: jest.fn(),
    }));
    // The plugin gates on `window.location[fromWhere].indexOf(toCheck)`; for
    // `response_type: 'code'` with no `response_mode`, that's
    // `window.location.search.indexOf('code')`. Provide a URL that matches.
    delete window.location;
    window.location = new URL('https://app.example.com/dashboard?code=abc');
    pushStateSpy = jest
      .spyOn(history, 'pushState')
      .mockImplementation(() => {});
  });

  afterEach(() => {
    pushStateSpy.mockRestore();
    window.location = originalLocation;
  });

  const buildPluginAndFlush = async (state) => {
    mockSigninResult = { state };
    // The plugin's constructor returns Promise.all([...]) so awaiting the
    // `new` gives us a resolved plugin instance. `_processLoginResponse`
    // internally defers `history.pushState` via setTimeout(50) — wait past
    // that boundary with real timers before asserting.
    await new openIdConnect({});
    await new Promise((r) => setTimeout(r, 80));
  };

  it('accepts a same-origin absolute URL and reduces it to path+search+hash', async () => {
    await buildPluginAndFlush(
      encodeURIComponent('https://app.example.com/settings?tab=profile#top'),
    );
    expect(pushStateSpy).toHaveBeenCalledWith(
      '',
      document.title,
      '/settings?tab=profile#top',
    );
  });

  it('accepts a relative path unchanged', async () => {
    await buildPluginAndFlush(encodeURIComponent('/inner/page?x=1'));
    expect(pushStateSpy).toHaveBeenCalledWith(
      '',
      document.title,
      '/inner/page?x=1',
    );
  });

  it('rejects a cross-origin absolute URL and falls back to current pathname', async () => {
    await buildPluginAndFlush(
      encodeURIComponent('https://attacker.example/steal'),
    );
    expect(pushStateSpy).toHaveBeenCalledWith('', document.title, '/dashboard');
  });

  it('rejects a protocol-relative URL (//attacker.example) and falls back', async () => {
    // `//attacker.example/path` resolves against the base origin's scheme —
    // `new URL('//attacker.example/x', 'https://app.example.com')` → https://attacker.example/x.
    // Different origin → must be rejected.
    await buildPluginAndFlush(encodeURIComponent('//attacker.example/steal'));
    expect(pushStateSpy).toHaveBeenCalledWith('', document.title, '/dashboard');
  });

  it('rejects a javascript: URL and falls back', async () => {
    await buildPluginAndFlush(encodeURIComponent('javascript:alert(1)'));
    // The URL constructor accepts `javascript:` but its origin is 'null',
    // which is not equal to the current origin — so we fall back.
    expect(pushStateSpy).toHaveBeenCalledWith('', document.title, '/dashboard');
  });
});
