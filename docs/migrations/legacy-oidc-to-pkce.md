# Migration Guide: from oidc-client to oidc-client-ts

Migrating from `oidc-client` v1 (unmaintained) to `oidc-client-ts` v3 requires a dependency swap, a move from the implicit flow to authorization code + PKCE, several renamed settings, and awareness of stricter security defaults around logout and state validation.

<!-- add-attribute:class:success -->
>**TIP:** Follow official `oidc-client-ts` [documentation](https://authts.github.io/oidc-client-ts/) for up-to-date information.

## Runtime dependency swap

Replace the package and update every import path; the two libraries are not drop-in compatible despite the similar API surface.

```javascript
npm uninstall oidc-client
npm install oidc-client-ts@^3
```

|  | oidc-client v1 | oidc-client-ts v3 |
| --- | --- | --- |
| Package | oidc-client | oidc-client-ts |
| Language | JavaScript, typings via @types/oidc-client | TypeScript-native, ships its own types |
| Import | import UserManager from oidc-client | import UserManager from oidc-client-ts |
| Maintenance | Unmaintained since 2021 | Actively maintained fork |

If using redux-oidc or react-oidc-context, confirm the wrapper library has a version built against oidc-client-ts before swapping the underlying package, since older wrapper versions import from oidc-client directly and will break.

## Config: response\_type and response\_mode

oidc-client v1 configs commonly used the implicit flow, returning tokens directly in the URL fragment. oidc-client-ts still supports implicit, but the recommended and default-safe path is authorization code + PKCE, which never exposes tokens in the browser history or referrer headers.

Before:

```javascript
new UserManager({
  authority: 'https://issuer.example.com',
  client_id: 'spa-client',
  redirect_uri: 'https://app.example.com/callback',
  response_type: 'id_token token',
  scope: 'openid profile api1'
});
```

After:

```javascript
new UserManager({
  authority: 'https://issuer.example.com',
  client_id: 'spa-client',
  redirect_uri: 'https://app.example.com/callback',
  response_type: 'code',
  response_mode: 'query',
  scope: 'openid profile api1'
});
```

`response_mode` defaults to `'query'` for `code` and does not need to be set explicitly unless the authorization server requires `'fragment'`. This switch requires the identity provider's client registration to support the authorization code grant with PKCE (`code_challenge_method: S256`) — confirm that on the IdP side before deploying, since a client still registered as implicit-only will reject the new request.

## Renamed settings keys

oidc-client-ts renamed several `UserManagerSettings` keys for clarity; the old keys are silently ignored rather than erroring, so a straight copy-paste of an old config will build but misbehave at runtime.

| oidc-client v1 key | oidc-client-ts v3 key |
| --- | --- |
| `popupWindowFeatures` | `popupWindowFeatures` (unchanged, listed for contrast) |
| `automaticSilentRenew` | `automaticSilentRenew` (unchanged) |
| `accessTokenExpiringNotificationTime` | `accessTokenExpiringNotificationTimeInSeconds` |
| `checkSessionInterval` | `checkSessionIntervalInSeconds` |
| `silentRequestTimeout` | `silentRequestTimeoutInSeconds` |
| `revokeAccessTokenOnSignout` | `revokeTokensOnSignout` |

The pattern worth flagging: several timing settings gained an explicit `InSeconds` suffix. Audit any config that sets timeout or interval values and rename the key rather than assuming the old key is aliased.

## Dropped: thirdPartyCookiesScriptLocation

oidc-client v1's `thirdPartyCookiesScriptLocation` pointed at a helper iframe script used to detect whether third-party cookies were blocked, so silent renewal could fall back gracefully. oidc-client-ts removes this option entirely — it has no replacement setting because the underlying approach no longer fits how browsers handle third-party storage.

What changes in practice:

- Remove the setting from config; passing it is a silent no-op, not an error.
- Third-party cookie detection is no longer built in. Since the move to authorization code + PKCE (see above) also removes the need to renew tokens via a hidden iframe against the IdP's session cookie in most setups, silent renewal via `automaticSilentRenew` should be re-tested end to end against the actual IdP, particularly in Safari and Firefox with stricter cookie partitioning.
- If silent renewal still fails intermittently after migration, the recommended pattern is refresh-token-based renewal rather than iframe-based silent renewal, since it does not depend on third-party cookie access at all.

## New distinction: logoutUrl vs post\_logout\_redirect\_uri

oidc-client v1 treated logout as a single redirect to the IdP's end-session endpoint. oidc-client-ts splits this into two separate, non-interchangeable concepts:

| Setting | Meaning |
| --- | --- |
| `metadata.end_session_endpoint` (or the constructed `logoutUrl`) | The IdP URL the browser is sent TO in order to end the IdP session. Internal to the library; not normally set directly, it's derived from discovery metadata. |
| `post_logout_redirect_uri` | The app URL the IdP sends the browser BACK TO after the IdP session ends. Must be registered as an allowed post-logout redirect URI in the client's IdP registration, or the IdP will reject or ignore it. |

```javascript
await userManager.signoutRedirect({
  post_logout_redirect_uri: 'https://app.example.com/logged-out'
});
```

The practical migration risk: some v1 integrations passed a single `logoutUrl`-style value that conflated both directions. In v3, confirm the app's actual post-logout landing page is registered with the IdP under `post_logout_redirect_uri` — a mismatch here shows up as the IdP silently dropping the redirect and stranding the user on its own logged-out page instead of returning to the app.

## Same-origin state validation

oidc-client-ts validates that the callback processing the authorization response happens on the same origin the request was initiated from, as a defense against state being replayed or intercepted across origins. oidc-client v1 did not enforce this.

This matters for two common setups:

- **Multiple app instances on different subdomains** sharing one auth flow (e.g. staging and a preview deployment both hitting the same callback handler) will now fail validation if the origin at redirect time differs from the origin that started the sign-in.
- **Reverse proxies or CDNs that rewrite the Host header** between the sign-in request and the callback can trigger the same failure, since the library compares against `window.location.origin` at each step.

If sign-in worked before migrating and now fails only in these cross-origin or proxied setups, check for an origin mismatch first rather than assuming a token or PKCE misconfiguration — the error surfaces as a generic sign-in failure, not a labeled origin error.

## errorDescription URL-encoding

When the IdP redirects back with an error (`error` + `error_description` query/fragment params), oidc-client-ts consistently URL-decodes `error_description` before exposing it as `errorDescription` on the resulting error object. oidc-client v1 was inconsistent here — in some code paths the raw, still-encoded string leaked through.

Code that previously did its own decoding defensively will now double-decode:

```javascript
// v1 pattern — no longer needed, will corrupt messages with encoded characters
const message = decodeURIComponent(error.errorDescription);
```

```javascript
// v3 — errorDescription is already decoded
const message = error.errorDescription;
```

Search the codebase for any manual `decodeURIComponent` or `unescape` call applied to `errorDescription` (or to raw callback query strings feeding into it) and remove it, since a double-decoded string containing a literal `%` will render or log incorrectly.

## OpenID Connect configuration

This code snippet demonstrates how to configure authorization using OpenID Connect with PKCE in Luigi. Note that you must install the [Authorization Plugin](auth-oidc-pkce.md) first.

```javascript
import OpenIdConnect from '@luigi-project/plugin-auth-oidc-pkce';
auth: {
  use: 'openIdConnect',
  storage: 'localStorage',
  openIdConnect: {
    idpProvider: OpenIdConnect,
    authority: 'http://authority.server',
      clientId: 'pkce-mock-client',
      scope: 'openid profile email',
      response_type: 'code',
      redirect_uri: '/',
      silent_redirect_uri: '/auth/oidc-pkce-silent-callback.html',
      post_logout_redirect_uri: '/?logout',
      metadata: {
        issuer: 'http://authority.server',
        authorization_endpoint: 'http://authority.server/authorize',
        token_endpoint: 'http://authority.server/token',
        end_session_endpoint: 'http://authority.server/endsession'
      }
  },
  disableAutoLogin: false
}
```

You may check how it works in our [E2E Test Suite](https://github.com/luigi-project/luigi/blob/main/test/e2e-test-application/cypress/e2e/support/oidcMock.js).
