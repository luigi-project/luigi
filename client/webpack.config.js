const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = [
  {
    devtool: 'source-map',
    entry: {
      'luigi-client': './src/luigi-client.ts'
    },
    module: {
      rules: [
        {
          exclude: /node_modules/,
          loader: 'ts-loader',
          test: /\.ts$/
        }
      ]
    },
    output: {
      filename: '[name].js',
      library: {
        export: 'default',
        type: 'umd'
      },
      path: path.join(path.resolve(__dirname), 'public'),
      umdNamedDefine: true,
      uniqueName: 'LuigiClient'
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'luigi-client.d.ts',
            to: '.'
          }
        ]
      })
    ],
    resolve: {
      extensions: ['.ts', '.js']
    },
    stats: {
      errorDetails: true
    }
  },
  {
    devtool: 'source-map',
    entry: {
      'luigi-element': './src/luigi-element.ts'
    },
    experiments: {
      outputModule: true
    },
    module: {
      rules: [
        {
          exclude: /node_modules/,
          loader: 'ts-loader',
          test: /\.ts$/
        }
      ]
    },
    output: {
      filename: '[name].js',
      library: {
        type: 'module'
      },
      path: path.join(path.resolve(__dirname), 'public'),
      uniqueName: 'LuigiElement'
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'luigi-element.d.ts',
            to: '.'
          }
        ]
      })
    ],
    resolve: {
      extensions: ['.ts', '.js']
    },
    stats: {
      errorDetails: true
    }
  }
];
