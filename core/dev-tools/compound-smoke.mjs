// Standalone browser smoke test: node core/dev-tools/compound-smoke.mjs
// Requires Node with global WebSocket (22+) and Chrome, or CHROME_BIN.
// Uses a temporary browser profile and an in-memory build; no published files are changed.
import { rollup } from 'rollup';
import { compoundRuntime } from './compound-runtime-plugin.mjs';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const core = fileURLToPath(new URL('../', import.meta.url));
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function bundle(input, options, plugins = []) {
  const build = await rollup({ input: join(core, input), plugins });
  try {
    return (await build.generate(options)).output[0].code;
  } finally {
    await build.close();
  }
}

async function chromeBinary() {
  for (const path of [
    process.env.CHROME_BIN,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium'
  ]) {
    if (!path) continue;
    try {
      await access(path);
      return path;
    } catch {
      /* try next location */
    }
  }
  throw new Error('Set CHROME_BIN to a Chrome/Chromium executable');
}

if (!globalThis.WebSocket) throw new Error('This smoke test requires Node 22+');
const bootstrapCode = await bundle('src/services/compound-iframe-bootstrap.js', { format: 'cjs' }, [compoundRuntime()]);
const exports = {};
new Function('exports', bootstrapCode)(exports);
const bootstrap = exports.getCompoundIframeBootstrapScript([]);
const bridgeCode = await bundle('src/services/compound/bridge.js', { format: 'iife', name: 'CompoundTest' });
const component = `
export default class SmokeComponent extends HTMLElement {
  set context(value) {
    this._context = value;
    if (value.phase === 'updated' && this.getAttribute('nodeId') === 'a') {
      this.LuigiClient.publishEvent({type:'tick',detail:7});
    }
  }
  get context() { return this._context; }
  connectedCallback() {
    if (this.getAttribute('nodeId') === 'b') {
      this.addEventListener('update', e => this.LuigiClient.uxManager().setDocumentTitle('event:' + e.detail));
      return;
    }
    this.check();
  }
  async check() {
    const client = this.LuigiClient;
    try {
      let blocked = false;
      try { parent.document.body; } catch (error) { blocked = error.name === 'SecurityError'; }
      if (!blocked) throw new Error('parent DOM was accessible');
      if (client.getCoreSearchParams().allowed !== 'yes') throw new Error('synchronous snapshot failed');
      if (client.getPathParams().id !== '1') throw new Error('path parameters missing');
      const exists = await client.linkManager().fromContext('project').withParams({id:1}).pathExists('target');
      if (!exists) throw new Error('RPC result missing');
      let rejected = false;
      try { await client.uxManager().showConfirmationModal({title:'Cancel'}); }
      catch (error) { rejected = error.message === 'cancelled'; }
      if (!rejected) throw new Error('RPC error not propagated');
      client.uxManager().setDocumentTitle('checks:passed');
    } catch (error) { client.uxManager().setDocumentTitle('failure:' + error.message); }
  }
}
`;
const lazyController = `
export default class LazyController extends HTMLElement {
  set context(value) {
    this._context = value;
    if (value.phase === 'reveal') setTimeout(() => window.scrollTo(0, 2000), 0);
  }
  get context() { return this._context; }
  connectedCallback() {
    this.style.cssText = 'display:block;height:2000px';
    this.LuigiClient.uxManager().setDocumentTitle('lazy:controller-ready');
  }
}
`;
const lazyChild = `
export default class LazyChild extends HTMLElement {
  connectedCallback() {
    const client = this.LuigiClient;
    if (this.context.shared !== 'latest') {
      client.uxManager().setDocumentTitle('failure:lazy context was stale');
      return;
    }
    client.setViewGroupData({label:'from lazy child'});
    client.uxManager().setDocumentTitle('lazy:loaded');
  }
}
`;
let lazyImports = 0;
const page = `<!doctype html><html><body><script>${bridgeCode.replace(/<\/script/gi, '<\\/script')}</script><script>
window.__compoundSmoke = {checks:false,event:false,rendered:false,lazyDeferred:false,lazyLoaded:false,viewGroup:false};
const iframe = document.createElement('iframe');
iframe.sandbox = 'allow-scripts';
iframe.srcdoc = ${JSON.stringify(bootstrap).replace(/<\/script/gi, '<\\/script')};
document.body.appendChild(iframe);
const bridge = new CompoundTest.CompoundBridge({peer:iframe.contentWindow,handlers:{
  ready:async()=>{
    const nodes={a:{searchParams:{allowed:'yes'}},b:{}};
    const config={navNode:{compound:{renderer:{use:'grid',config:{columns:'1fr 1fr'}},children:[
      {id:'a',viewUrl:location.origin+'/component.js'},
      {id:'b',viewUrl:location.origin+'/component.js',eventListeners:[{source:'a',name:'tick',action:'update'}]}
    ]}},context:{phase:'initial'},pathParams:{id:'1'},nodeParams:{},snapshot:{nodes,locale:'en',featureToggles:[],anchor:'',route:'/current'}};
    await bridge.request('init',config);
    window.__compoundSmoke.rendered=true;
    bridge.notify('context.update',{context:{phase:'updated'}});
  },
  'navigation.pathExists':params=>{
    if(params.options.fromContext!=='project'||params.options.nodeParams.id!==1)throw new Error('options missing');
    return true;
  },
  'ux.showConfirmationModal':()=>{throw new Error('cancelled');},
  'ux.setDocumentTitle':({title})=>{
    if(title==='checks:passed')window.__compoundSmoke.checks=true;
    else if(title==='event:7')window.__compoundSmoke.event=true;
    else window.__compoundSmoke.failure=title;
  }
},onError:error=>window.__compoundSmoke.failure=error.message});
const lazyFrame = document.createElement('iframe');
lazyFrame.sandbox = 'allow-scripts';
lazyFrame.style.height = '200px';
lazyFrame.srcdoc = ${JSON.stringify(bootstrap).replace(/<\/script/gi, '<\\/script')};
document.body.appendChild(lazyFrame);
const lazyBridge = new CompoundTest.CompoundBridge({peer:lazyFrame.contentWindow,handlers:{
  ready:async()=>{
    await lazyBridge.request('init',{
      navNode:{compound:{lazyLoadingOptions:{enabled:true,temporaryContainerHeight:'2000px'},children:[
        {id:'controller',viewUrl:location.origin+'/lazy-controller.js'},
        {id:'lazy',viewUrl:location.origin+'/lazy-child.js',layoutConfig:{temporaryContainerHeight:'100px'}}
      ]}},context:{phase:'initial',shared:'initial'},pathParams:{},nodeParams:{},
      snapshot:{nodes:{controller:{},lazy:{}},locale:'en',featureToggles:[],anchor:'',route:'/current'}
    });
  },
  'navigation.setViewGroupData':({nodeId,data})=>{
    if(nodeId!=='lazy'||data.label!=='from lazy child')throw new Error('view-group payload incorrect');
    window.__compoundSmoke.viewGroup=true;
  },
  'render.failed':({message})=>{window.__compoundSmoke.failure=message;},
  'ux.setDocumentTitle':async({title})=>{
    if(title==='lazy:controller-ready'){
      await new Promise(resolve=>setTimeout(resolve,250));
      const imports=await (await fetch('/lazy-status')).json();
      if(imports!==0){window.__compoundSmoke.failure='offscreen child imported before scrolling';return;}
      window.__compoundSmoke.lazyDeferred=true;
      lazyBridge.notify('context.update',{context:{phase:'reveal',shared:'latest'}});
    }else if(title==='lazy:loaded')window.__compoundSmoke.lazyLoaded=true;
    else window.__compoundSmoke.failure=title;
  }
},onError:error=>window.__compoundSmoke.failure=error.message});
</script></body></html>`;
const server = createServer((request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  if (request.url === '/lazy-status') {
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(lazyImports));
    return;
  }
  const scripts = { '/component.js': component, '/lazy-controller.js': lazyController, '/lazy-child.js': lazyChild };
  if (request.url === '/lazy-child.js') lazyImports++;
  response.setHeader('Content-Type', scripts[request.url] ? 'text/javascript' : 'text/html');
  response.end(scripts[request.url] || page);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const profile = await mkdtemp(join(tmpdir(), 'luigi-compound-smoke-'));
let browser, socket;
try {
  browser = spawn(
    await chromeBinary(),
    [
      '--headless=new',
      '--no-first-run',
      '--no-default-browser-check',
      '--remote-debugging-port=0',
      `--user-data-dir=${profile}`,
      'about:blank'
    ],
    { stdio: 'ignore' }
  );
  let port;
  for (let attempt = 0; attempt < 100 && !port; attempt++) {
    try {
      port = Number((await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]);
    } catch {
      await delay(100);
    }
  }
  assert.ok(port, 'Chrome did not start');
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const target = targets.find((target) => target.type === 'page');
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.onopen = resolve;
    socket.onerror = reject;
  });
  const pending = new Map();
  let id = 0;
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    const callback = pending.get(message.id);
    if (callback) {
      pending.delete(message.id);
      callback(message);
    }
  };
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const requestId = ++id;
      const timer = setTimeout(() => {
        pending.delete(requestId);
        reject(new Error(`Chrome command timed out: ${method}`));
      }, 10000);
      pending.set(requestId, (response) => {
        clearTimeout(timer);
        if (response.error) reject(new Error(response.error.message));
        else resolve(response);
      });
      socket.send(JSON.stringify({ id: requestId, method, params }));
    });
  await send('Page.navigate', { url: `http://127.0.0.1:${server.address().port}/` });
  let result;
  for (let attempt = 0; attempt < 100; attempt++) {
    await delay(100);
    const response = await send('Runtime.evaluate', { expression: 'window.__compoundSmoke', returnByValue: true });
    result = response.result?.result?.value;
    if (result?.failure || (result && Object.values(result).every((value) => value === true))) break;
  }
  assert.deepEqual(result, {
    checks: true,
    event: true,
    rendered: true,
    lazyDeferred: true,
    lazyLoaded: true,
    viewGroup: true
  });
  assert.equal(lazyImports, 1, 'Lazy child must be imported exactly once');
  console.log(
    'Chrome compound smoke passed: sandbox isolation, dynamic import/CORS, RPC options/errors, synchronous getters, rendering, context update, local events, viewport lazy loading and view-group messages.'
  );
} finally {
  socket?.close();
  if (browser && browser.exitCode === null) {
    const exited = new Promise((resolve) => browser.once('exit', resolve));
    browser.kill();
    await Promise.race([exited, delay(5000)]);
  }
  await new Promise((resolve) => server.close(resolve));
  await rm(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
}
