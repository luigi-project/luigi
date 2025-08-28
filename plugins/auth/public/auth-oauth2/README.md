<!-- meta
{
  "node": {
    "label": "OAuth2 Plugin",
    "category": {
      "label": "Authorization",
      "collapsible": true
    },
    "metaData": {
      "categoryPosition": 4,
      "position": 2
    }
  }
}
meta -->

# OAuth2 - Authorization Plugin for Luigi Core

## Overview

This [authorization plugin](https://github.com/luigi-project/luigi/tree/main/plugins/auth/public/auth-oauth2) contains a library that allows your application to extend the [Luigi framework](https://github.com/luigi-project/luigi/tree/main/core) with an OAuth2 authorization provider.
Further configuration details can be found in the [main documentation](https://docs.luigi-project.io/docs/authorization-configuration#oauth2-implicit-grant-configuration).

## Installation

Install the plugin in your project using npm:
```bash
npm install @luigi-project/plugin-auth-oauth2
```

Import the plugin in places where you want to use it, depending on the environment of your choice:
```javascript
var oAuth2ImplicitGrant = require('@luigi-project/plugin-auth-oauth2');
```
or
```javascript
import oAuth2ImplicitGrant from '@luigi-project/plugin-auth-oauth2';
```

Then, integrate it as an authorization provider in your Luigi configuration file:
```javascript
Luigi.setConfig({
  auth: {
    use: 'myProviderConfig',
    myProviderConfig: {
      idpProvider: oAuth2ImplicitGrant,
      // ... configuration data comes here
      redirect_uri: '/assets/auth-oauth2/callback.html'
    }
  }
})
```

 We provide a `callback.html` file through our `plugin-auth-oauth2` package. This `callback.html` file resides in `node_modules/@luigi-project/plugin-auth-oauth2/callback.html` and needs to be copied to a folder in your Luigi Core installation, which is the return path for the IdP provider, configured through the `redirect_uri` setting. The default location of `redirect_uri` is `/assets/auth-oauth2/callback.html`.

The examples given below give some alternatives on how to copy this file in your project. However, you may choose your own way of copying the `callback.html` file to the default location depending on your environment.

For applications involving a webpack configuration, one way to copy the `callback.html` file is using packages such as [copy-webpack-plugin](https://www.npmjs.com/package/copy-webpack-plugin) and then including the following in your webpack configuration file:

```javascript
const CopyWebpackPlugin = require('copy-webpack-plugin');

{
  plugins: [
    new CopyWebpackPlugin([{
      from: 'node_modules/@luigi-project/plugin-auth-oauth2/callback.html',
      to: 'src/assets/auth-oauth2'
    }])
  ]
}
```

If your application does not use webpack or you installed Luigi without a framework, you can use any copy plugin to copy the `callback.html` file and then modify the `package.json` script to copy the file when building. One package that could be helpful is [copyfiles](https://www.npmjs.com/package/copyfiles). Following is an example:

```javascript
"buildConfig": "webpack --entry ./src/luigi-config/luigi-config.es6.js --output-path ./public/assets --output-filename luigi-config.js --mode production",
"build": "npm run buildConfig && npm run copyCallbackOAuth",
"copyCallbackOAuth": "copyfiles -f node_modules/@luigi-project/plugin-auth-oauth2/callback.html public/assets/auth-oauth2"
```

Running `npm run build` should then suffice to bundle the config and also copy the callback file.
