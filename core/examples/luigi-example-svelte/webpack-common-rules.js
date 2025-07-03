const mode = process.env.NODE_ENV || 'development';
const prod = mode === 'production';

module.exports = {
  svelte: {
    test: /\.(html|svelte|svelte\.js)$/,
    use: {
      loader: 'svelte-loader',
      options: {
        emitCss: true,
        hotReload: true
      }
    }
  },
  // css: {
  //   test: /\.(sa|sc|c)ss$/,
  //   use: ['css-loader']
  // },
  urls: {
    test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
    loader: 'url-loader',
    options: {
      limit: 50000
    }
  }
};
