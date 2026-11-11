import { CompoundBridge } from './bridge';
import { createIsolatedClient } from './client';
import { LazyCompoundLoader } from './lazy-loading';
import { generateWCId, getCompoundRenderer, initializeComponent, registerModule, renderCompound } from './renderer';

export function startCompoundRuntime({
  host = window,
  importModule = (url) => import(/* webpackIgnore: true */ /* @vite-ignore */ url),
  createObserver,
  loadTimeout = 30000
} = {}) {
  const state = { snapshot: { nodes: {} } };
  const scriptLoads = new Set();
  const contexts = new Set();
  let lazyLoader;
  let initialized = false;
  let disposed = false;
  let failed = false;
  const stopped = () => disposed || failed;
  const previousLuigi = host.Luigi;
  host.Luigi = {
    _registerWebcomponent(url, component) {
      const id = generateWCId(url);
      if (!customElements.get(id)) customElements.define(id, component);
    }
  };

  const loadComponent = async (node) => {
    const id = node.webcomponent?.tagName || generateWCId(node.viewUrl);
    if (customElements.get(id)) return id;
    if (node.webcomponent?.selfRegistered) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        const finish = (error) => {
          clearTimeout(timer);
          script.onload = script.onerror = null;
          scriptLoads.delete(cancel);
          if (error) {
            script.remove();
            reject(error);
          } else resolve();
        };
        const cancel = () => finish(new Error('Compound view disposed'));
        const timer = setTimeout(() => finish(new Error(`Component load timed out: ${node.viewUrl}`)), 30000);
        scriptLoads.add(cancel);
        script.src = node.viewUrl;
        if (node.webcomponent.type === 'module') script.type = 'module';
        script.onload = () => finish();
        script.onerror = () => finish(new Error(`Could not load component: ${node.viewUrl}`));
        document.body.appendChild(script);
      });
      if (!customElements.get(id)) throw new Error(`Component did not register ${id}`);
    } else {
      const module = await importModule(node.viewUrl);
      if (!stopped()) registerModule(module, id);
    }
    return id;
  };

  const initialize = (wc, id, node, context, eventBusElement, nodeId, isChild) => {
    if (nodeId) wc.setAttribute('nodeId', nodeId);
    initializeComponent(
      wc,
      createIsolatedClient({ bridge, nodeId, eventBusElement, extendedContext: context, state, isChild }),
      context,
      node.viewUrl
    );
  };

  const attachChild = async ({ node, container, context, nodeId }) => {
    const id = await loadComponent(node);
    if (stopped()) return;
    const wc = document.createElement(id);
    initialize(wc, id, node, context, container, nodeId, true);
    container.appendChild(wc);
  };

  const reportLoadFailure = (error) => {
    if (stopped()) return;
    failed = true;
    lazyLoader?.dispose();
    scriptLoads.forEach((cancel) => cancel());
    bridge.notify('render.failed', { message: error?.message || String(error) });
  };

  const bridge = new CompoundBridge({
    host,
    peer: host.parent,
    handlers: {
      async init(config) {
        if (initialized) throw new Error('Compound runtime already initialized');
        initialized = true;
        state.snapshot = config.snapshot;
        const extendedContext = {
          context: config.context,
          pathParams: config.pathParams,
          nodeParams: config.nodeParams
        };
        contexts.add(extendedContext);
        const lazyOptions = config.navNode.compound.lazyLoadingOptions;
        if (lazyOptions?.enabled === true) {
          lazyLoader = new LazyCompoundLoader({
            options: lazyOptions,
            load: attachChild,
            onError: reportLoadFailure,
            createObserver,
            timeout: loadTimeout
          });
        }
        await renderCompound({
          navNode: config.navNode,
          container: document.body,
          extendedContext,
          renderer: getCompoundRenderer(config.navNode),
          isDisposed: stopped,
          async createContainer(renderer, context, node) {
            if (!renderer.viewUrl) return renderer.createCompoundContainer();
            const id = await loadComponent(node);
            const wc = document.createElement(id);
            if (!stopped()) initialize(wc, id, node, context, wc, '_root', false);
            return wc;
          },
          renderChild(node, container, context, nodeId) {
            contexts.add(context);
            if (lazyLoader) {
              lazyLoader.observe(container, node, context, nodeId);
              return;
            }
            return attachChild({ node, container, context, nodeId });
          }
        });
      },
      'context.update'({ context, snapshot }) {
        if (snapshot) state.snapshot = snapshot;
        // Include queued and in-flight children so they initialize with the latest context.
        contexts.forEach((extendedContext) => {
          extendedContext.context = { ...extendedContext.context, ...context };
        });
        document.querySelectorAll('[lui_web_component]').forEach((wc) => {
          wc.context = { ...wc.context, ...context };
          wc.extendedContext.context = wc.context;
        });
      }
    }
  });

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    lazyLoader?.dispose();
    contexts.clear();
    scriptLoads.forEach((cancel) => cancel());
    bridge.dispose();
    host.removeEventListener('pagehide', dispose);
    host.Luigi = previousLuigi;
  };
  host.addEventListener('pagehide', dispose);
  bridge.notify('ready');
  return { bridge, dispose };
}
