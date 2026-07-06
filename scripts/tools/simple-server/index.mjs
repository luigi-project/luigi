/**
 * Small static-file dev server used by the various `dev-server` / `simpledev`
 * scripts across the monorepo. Replaces the (unmaintained) `live-server`,
 * `alive-server`, `http-server`, and `sirv-cli` dependencies.
 *
 * Features:
 *   - serves a root folder as `/`
 *   - mounts sibling folders at custom URL paths
 *   - CORS: `Access-Control-Allow-Origin: *`
 *   - watches given paths and reloads open browsers via Server-Sent Events
 *   - injects the reload snippet into any served .html file at request time
 *     (nothing is written to disk)
 *   - optional SPA fallback (`single: true`): unmatched URLs serve
 *     `<root>/index.html`
 *
 * See: scripts/tools/simple-server/README section in the repo docs.
 */
import express from 'express';
import chokidar from 'chokidar';
import fs from 'node:fs';
import path from 'node:path';

const RELOAD_ENDPOINT = '/__reload';
const RELOAD_SNIPPET =
  `<script>new EventSource('${RELOAD_ENDPOINT}').onmessage=()=>location.reload()</script>`;

/**
 * @param {object} opts
 * @param {number} opts.port
 * @param {string} [opts.host='0.0.0.0']
 * @param {string} opts.root - path to the folder served at `/`
 * @param {Array<[string, string]>} [opts.mounts=[]] - [urlPath, fsPath] pairs
 * @param {string[]} [opts.watch=[]] - additional chokidar paths (root is included automatically)
 * @param {number} [opts.waitMs=200] - debounce window for reload broadcasts
 * @param {boolean} [opts.single=false] - SPA fallback; serve <root>/index.html for unmatched URLs
 * @param {boolean} [opts.quiet=false] - suppress the startup log line
 */
export function startSimpleServer({
  port,
  host = '0.0.0.0',
  root,
  mounts = [],
  watch = [],
  waitMs = 200,
  single = false,
  quiet = false
}) {
  const app = express();

  // CORS — matches live-server's `cors: true`.
  app.use((_req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    next();
  });

  // SSE endpoint for browser reload signalling.
  /** @type {Set<import('express').Response>} */
  const clients = new Set();
  app.get(RELOAD_ENDPOINT, (req, res) => {
    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    });
    res.flushHeaders();
    clients.add(res);
    req.on('close', () => clients.delete(res));
  });

  // HTML-injection middleware: for GETs that resolve to an .html file under
  // the root or any mount, read from disk, append the reload snippet, send
  // as text/html. Everything else passes through to express.static.
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    const htmlPath = resolveHtmlFile(req.path, root, mounts);
    if (!htmlPath) return next();
    serveHtmlWithReload(req, res, next, htmlPath);
  });

  // Mounts and root static serving.
  for (const [urlPath, fsPath] of mounts) {
    app.use(urlPath, express.static(fsPath));
  }
  app.use(express.static(root, { index: 'index.html' }));

  // SPA fallback: any unmatched GET returns <root>/index.html (with reload
  // snippet injected). Post routes / non-GET methods fall through to 404.
  if (single) {
    const spaFallback = path.resolve(root, 'index.html');
    app.use((req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') return next();
      serveHtmlWithReload(req, res, next, spaFallback);
    });
  }

  // File watching.
  const watchPaths = [root, ...watch];
  const watcher = chokidar.watch(watchPaths, { ignoreInitial: true });
  let debounce;
  const broadcast = () => {
    for (const client of clients) client.write('data: reload\n\n');
  };
  watcher.on('all', () => {
    clearTimeout(debounce);
    debounce = setTimeout(broadcast, waitMs);
  });

  const server = app.listen(port, host, () => {
    if (!quiet) {
      console.log('\x1b[32mStarting simple-server at \x1b[36m' + `http://localhost:${port}` + '\x1b[0m');
    }
  });
  server.on('error', err => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\x1b[31mPort ${port} is already in use.\x1b[0m`);
    } else {
      console.error(err);
    }
  });

  return { app, server, watcher };
}

/**
 * Read an HTML file from disk, inject the reload snippet, and send it.
 */
function serveHtmlWithReload(req, res, next, absPath) {
  fs.readFile(absPath, 'utf8', (err, body) => {
    if (err) return next(err);
    const injected = injectReloadSnippet(body);
    res.set('Content-Type', 'text/html; charset=utf-8');
    if (req.method === 'HEAD') return res.end();
    res.send(injected);
  });
}

/**
 * Given a request path, figure out which .html file on disk it resolves to
 * (if any). Returns an absolute path or null.
 */
function resolveHtmlFile(reqPath, root, mounts) {
  // Longest matching mount wins, so `/public_client/foo` doesn't leak into `/public`.
  const candidates = [...mounts].sort((a, b) => b[0].length - a[0].length);
  for (const [urlPath, fsPath] of candidates) {
    if (reqPath === urlPath || reqPath.startsWith(urlPath + '/')) {
      const rest = reqPath.slice(urlPath.length) || '/';
      return pickHtml(fsPath, rest);
    }
  }
  return pickHtml(root, reqPath);
}

function pickHtml(baseDir, subPath) {
  // Resolve `/` to `/index.html`; only serve files under baseDir.
  const rel = subPath === '/' ? 'index.html' : subPath.replace(/^\/+/, '');
  const full = path.resolve(baseDir, rel);
  const resolvedBase = path.resolve(baseDir);
  if (!full.startsWith(resolvedBase + path.sep) && full !== resolvedBase) return null;
  if (!full.toLowerCase().endsWith('.html')) return null;
  try {
    if (!fs.statSync(full).isFile()) return null;
  } catch {
    return null;
  }
  return full;
}

function injectReloadSnippet(html) {
  const closingBody = html.lastIndexOf('</body>');
  if (closingBody === -1) return html + RELOAD_SNIPPET;
  return html.slice(0, closingBody) + RELOAD_SNIPPET + html.slice(closingBody);
}
