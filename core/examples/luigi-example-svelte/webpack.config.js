const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

const commonRules = require('./webpack-common-rules');
const commonPlugins = require('./webpack-common-plugins');

const mode = process.env.NODE_ENV || 'development';
const prod = mode === 'production';

module.exports = {
  entry: {
    app: ['./src/main.js']
  },
  resolve: {
    conditionNames: ['svelte', 'browser'],
    extensions: ['.mjs', '.js', '.svelte'],
    mainFields: ['svelte', 'browser', 'module', 'main']
  },
  output: {
    path: __dirname + '/public',
    filename: '[name].js',
    chunkFilename: '[name].[id].js'
  },
  module: {
    rules: [commonRules.svelte, commonRules.css, commonRules.urls]
  },
  mode,
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),
    commonPlugins.copyWebpackPlugin
  ],
  devtool: prod ? false : 'source-map',
  stats: {
    warnings: false
  }
};
