const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  watch: false,
  mode: 'production',
  entry: {
    extendedConfiguration: './src/luigi-config/extended/main.js',
    basicConfiguration: './src/luigi-config/basic/basicConfiguration.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'src/assets')
  },
  plugins: [
    new webpack.BannerPlugin(
      `
      Don't be afraid!
      This file was generated automatically and you should not modify it.
      The documentation (located in /docs) will tell you how to modify Luigi configuration with pleasure.
      `
    ),

    new CopyWebpackPlugin({
      patterns: [
        // idpProvider OAuth2 callback asset
        {
          from: 'node_modules/@luigi-project/plugin-auth-oauth2/callback.html',
          to: path.resolve(__dirname, 'src/assets') + '/auth-oauth2/'
        },
        // idpProvider OIDC-PKCE assets. The oidc-client-ts runtime is a peer
        // dependency of @luigi-project/plugin-auth-oidc-pkce and must be
        // copied alongside the plugin bundle so silent-callback.html can
        // load it at runtime.
        {
          from: 'node_modules/@luigi-project/plugin-auth-oidc-pkce',
          to: path.resolve(__dirname, 'src/assets') + '/auth-oidc-pkce/'
        },
        {
          from: 'node_modules/oidc-client-ts/dist/browser/oidc-client-ts.min.js',
          to: path.resolve(__dirname, 'src/assets') + '/auth-oidc-pkce/'
        },
        // idpProvider OIDC (legacy implicit-flow) assets
        {
          from: 'node_modules/@luigi-project/plugin-auth-oidc',
          to: path.resolve(__dirname, 'src/assets') + '/auth-oidc/'
        }
      ]
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          rootMode: 'root'
        }
      }
    ]
  }
};
