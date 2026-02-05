const path = require('path');
const { globSync } = require('glob');
const merge = require('lodash.merge');

const { readFileSync } = require('fs');

const babelSettings = JSON.parse(readFileSync('.babelrc'));

const config = {
  entry: globSync('./auth/src/**/index.js').reduce((acc, path) => {
    const entry = path.replace('/index.js', '').replace('./auth/src/', '');
    acc[entry] = './' + path;
    return acc;
  }, {}),
  output: {
    filename: './[name]/plugin.js',
    libraryExport: 'default',
    library: 'LuigiPlugin-[name]',
    libraryTarget: 'umd',
    path: path.join(path.resolve(__dirname), 'auth', 'public')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: babelSettings
        }
      }
    ]
  },
  stats: {
    errorDetails: true
  }
};

// Extend with custom webpack configuration:
globSync('./auth/src/**/webpack-extra.config.js').forEach(path => {
  merge(config, require('./' + path));
});

module.exports = config;
