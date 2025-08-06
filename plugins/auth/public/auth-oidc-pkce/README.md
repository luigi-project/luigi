<!-- meta
{
  "node": {
    "label": "OpenID Connect PKCE Plugin",
    "category": {
      "label": "Authorization",
      "collapsible": true
    },
    "metaData": {
      "categoryPosition": 4,
      "position": 4
    }
  }
}
meta -->

# OpenID Connect with PKCE - Authorization Plugin for Luigi Core

## Overview

This [authorization plugin](https://github.com/luigi-project/luigi/tree/main/plugins/auth/public/auth-oidc-pkce) contains a library that allows your application to extend the [Luigi framework](https://github.com/luigi-project/luigi/tree/main/core) with an OpenID Connect authorization provider.
Further configuration details can be found in the [main documentation](https://docs.luigi-project.io/docs/authorization-configuration#openid-connect-configuration). The plugin supports only Authorization Code flow with PKCE - for Implict flow please check [older OIDC plugin](https://github.com/luigi-project/luigi/tree/main/plugins/auth/public/auth-oidc).

## Installation

Install the plugin in your project using npm:
```bash
npm install @luigi-project/plugin-auth-oidc-pkce
```

Import the plugin in places where you want to use it, depending on the environment of your choice:
```javascript
var OpenIdConnect = require('@luigi-project/plugin-auth-oidc-pkce');
```
or
```javascript
import OpenIdConnect from '@luigi-project/plugin-auth-oidc-pkce';
```

Then, integrate it as an authorization provider in your Luigi configuration file:
```javascript
Luigi.setConfig({
  auth: {
    use: 'myProviderConfig',
    myProviderConfig: {
      idpProvider: OpenIdConnect,
      authority: 'http://authority.server',
      post_logout_redirect_uri: 'http://authority.server/connect/endsession',
      scope: 'openid profile email',

      // for PKCE flow
      client_id: 'authorisation-code-pkce-mock-client', // example oidc-mockserver client id
      response_type: "code", // for PKCE
      response_mode: "fragment", // change between `query` and `fragment`

      // ... further configuration data comes here
    }
  }
})
```

If you want to use the silent token renewal feature, the `silent-callback.html` needs to be copied to a folder in your Luigi Core installation,
which is the return path for the IdP provider, configured through the `silent_redirect_uri` setting. The default location of `silent_redirect_uri` is `/assets/auth-oidc-pkce/silent-callback.html`.

Next, you must install `oidc-client-ts` in your project as a dev dependency:

```javascript
npm i -save-dev oidc-client-ts
```

Then, you need to copy certain auxiliary plugin files and the callback file, as they are needed for the initial setup.

Respectively from `oidc-client-ts` library you need:
- `oidc-client-ts.min.js` which normally resides in `node_modules/oidc-client-ts/dist/browser`

and from our library `@luigi-project/plugin-auth-oidc-pkce` you need:
- `plugin.js`
- `silent-callback.html`
which all reside under `node_modules/@luigi-project/plugin-auth-oidc-pkce/plugin.js`.

The above mentioned files should be copied to `assets/auth-oidc-pkce` as the default location.

Below we give some alternatives on how to easily copy these files in your project. However, you may choose your own way of copying these files depending on your environment.

For applications involving a webpack configuration, one way to copy files is using packages such as [copy-webpack-plugin](https://www.npmjs.com/package/copy-webpack-plugin) and then including the following in your webpack configuration file:



```javascript
const CopyWebpackPlugin = require('copy-webpack-plugin');

{
  plugins: [
    new CopyWebpackPlugin([
     {
         from: 'node_modules/@luigi-project/plugin-auth-oidc-pkce/plugin.js',
         to: 'assets/auth-oidc-pkce'
     },
     {
         from: 'node_modules/@luigi-project/plugin-auth-oidc-pkce/silent-callback.html',
         to: 'assets/auth-oidc-pkce'
     },
     {
         from: 'node_modules/oidc-client-ts/dist/browser/oidc-client-ts.min.js',
         to: 'assets/auth-oidc-pkce'
     }
    ])
  ]
}
```

If your application does not use webpack or you installed Luigi without a framework, you can use an alternative way of copying the `silent-callback.html` file. You can use any copy plugin to copy the file and then modify the `package.json` script to copy the file when building. One package that could be helpful is [copyfiles](https://www.npmjs.com/package/copyfiles). Below is an example:

```javascript
"buildConfig": "webpack --entry ./src/luigi-config/luigi-config.es6.js --output-path ./public/assets --output-filename luigi-config.js --mode production",
"build": "npm run buildConfig && npm run copyCallbackOIdc",
"copyCallbackOidc": "copyfiles -f node_modules/@luigi-project/plugin-auth-oidc-pkce/silent-callback.html node_modules/@luigi-project/plugin-auth-oidc-pkce/plugin.js node_modules/oidc-client-ts/dist/browser/oidc-client-ts.min.js public/assets/auth-oidc-pkce"
```

Running `npm run build` should then suffice to bundle the config and also copy the callback file.
