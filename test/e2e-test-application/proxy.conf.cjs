const path = require('node:path');

const shellFsPath = '/@fs/' + path.resolve(__dirname, 'src/index.html').replace(/\\/g, '/');

// @angular/build:dev-server registers the build's index (sampleapp.html) at /index.html,
// where it is shadowed by the static-asset Luigi shell. Without a proxy the Angular bundle
// is unreachable and unknown paths fall back to the shell instead of the iframe content.
// /sampleapp.html  -> rewritten to /index.html, served by Angular's index-html middleware.
// any other HTML   -> served from src/index.html via Vite's /@fs/ raw-fs middleware,
//                     skipping the html-fallback rewrite to /index.html.
module.exports = {
  '^/sampleapp\\.html$': {
    target: 'http://localhost:4200',
    bypass: () => '/index.html'
  },
  '^/.*$': {
    target: 'http://localhost:4200',
    bypass: (req) => {
      const url = req.url || '';
      if (url === '/sampleapp.html' || url.startsWith('/sampleapp.html?')) return url;
      const accept = req.headers.accept || '';
      if (!accept.includes('text/html')) return url;
      return shellFsPath;
    }
  }
};
