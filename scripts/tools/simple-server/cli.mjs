#!/usr/bin/env node
/**
 * CLI shim over `startSimpleServer`. Supports a sirv-compatible subset of
 * flags so bash callers (e.g. `scripts/shared/bashHelpers.sh:runWebserver`)
 * can invoke the helper without a JS launcher file.
 *
 * Usage:
 *   node cli.mjs [<folder>] [--port <n>] [--host <s>] [--single]
 *                [--cors] [--quiet] [--no-reload]
 *                [--mount <urlPath>=<fsPath>]...
 *                [--proxy <urlPrefix>=<targetUrl>]...
 *                [--watch <path>]...
 *
 * Notes:
 *   - `--cors` is accepted for compatibility with sirv but is a no-op:
 *     the helper always sends `Access-Control-Allow-Origin: *`.
 *   - `--no-reload` disables browser live-reload (both the SSE endpoint and
 *     HTML injection). Use for CI/E2E servers where reload adds nothing and
 *     nested-iframe tests can saturate the browser's per-origin connection cap.
 *   - `--proxy` reverse-proxies matching requests. Matches Netlify _redirects
 *     splat semantics: `--proxy /luigi-cdn=https://unpkg.com/@luigi-project`
 *     sends `/luigi-cdn/core/luigi.js` to `https://unpkg.com/@luigi-project/core/luigi.js`.
 *   - Positional folder defaults to `.` (current working directory).
 *   - Unknown flags cause a hard error naming the flag.
 */
import { parseArgs } from 'node:util';
import { startSimpleServer } from './index.mjs';

let parsed;
try {
  parsed = parseArgs({
    args: process.argv.slice(2),
    allowPositionals: true,
    options: {
      port: { type: 'string' },
      host: { type: 'string' },
      single: { type: 'boolean', default: false },
      cors: { type: 'boolean', default: false },
      quiet: { type: 'boolean', default: false },
      'no-reload': { type: 'boolean', default: false },
      mount: { type: 'string', multiple: true, default: [] },
      proxy: { type: 'string', multiple: true, default: [] },
      watch: { type: 'string', multiple: true, default: [] }
    }
  });
} catch (err) {
  console.error(`simple-server: ${err.message}`);
  console.error('Usage: node cli.mjs [<folder>] [--port <n>] [--host <s>] [--single] [--cors] [--quiet] [--no-reload] [--mount url=path]... [--proxy prefix=target]... [--watch path]...');
  process.exit(2);
}

const { values, positionals } = parsed;

if (!values.port) {
  console.error('simple-server: --port is required');
  process.exit(2);
}
const port = Number(values.port);
if (!Number.isInteger(port) || port <= 0) {
  console.error(`simple-server: invalid --port value "${values.port}"`);
  process.exit(2);
}

const root = positionals[0] || '.';

const splitPair = (spec, flag) => {
  const eq = spec.indexOf('=');
  if (eq === -1) {
    console.error(`simple-server: --${flag} must be key=value, got "${spec}"`);
    process.exit(2);
  }
  return [spec.slice(0, eq), spec.slice(eq + 1)];
};

const mounts = values.mount.map(s => splitPair(s, 'mount'));
const proxy = values.proxy.map(s => splitPair(s, 'proxy'));

startSimpleServer({
  port,
  host: values.host,
  root,
  mounts,
  proxy,
  watch: values.watch,
  single: values.single,
  quiet: values.quiet,
  reload: !values['no-reload']
});
