import { getCompoundIframeBootstrapScript } from './compound-iframe-bootstrap';
import { RoutingHelpers, EscapingHelpers, NavigationHelpers } from '../utilities/helpers';
import { LuigiConfig } from '../core-api';
import { WebComponentService } from './web-components';
import { CompoundBridge } from './compound/bridge';
import { normalizeCompoundConfig } from './compound/config';

function object(value, name) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`Invalid ${name}`);
  return value;
}

function string(value, name) {
  if (typeof value !== 'string') throw new Error(`Invalid ${name}`);
  return value;
}

/** One disposable isolated view. The service below only owns the active instance. */
export class IsolatedCompoundView {
  constructor(navNode, componentData, { bootstrap = getCompoundIframeBootstrapScript, timeout = 30000 } = {}) {
    this.navNode = navNode;
    this.componentData = componentData;
    this.state = 'initializing';
    this.pendingContext = {};
    this.nodes = new Map([['_root', navNode]]);
    (navNode.compound.children || []).forEach((node, index) => this.nodes.set(node.id || 'gen_' + index, node));
    this.splitViews = new Map();
    this.config = normalizeCompoundConfig(navNode, componentData, {
      resolveUrl: (url, context) => {
        const resolved = new URL(
          RoutingHelpers.getI18nViewUrl(RoutingHelpers.substituteViewUrl(url, { context })),
          document.baseURI
        ).href;
        if (!EscapingHelpers.sanitizeExternalNavigationUrl(resolved) || !WebComponentService.checkWCUrl(resolved)) {
          throw new Error(`Web component URL not allowed: ${resolved}`);
        }
        return resolved;
      },
      getSnapshot: () => this.snapshot()
    });
    this.iframe = document.createElement('iframe');
    this.iframe.sandbox = 'allow-scripts';
    this.iframe.title = 'Luigi compound view';
    this.iframe.style.cssText = 'width:100%;height:100%;border:none';
    this.iframe.setAttribute('data-testid', 'luigi-compound-iframe');
    const cssLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .map((link) => link.href)
      .filter((href) => /luigi[_.].*\.css/i.test(href));
    this.iframe.srcdoc = bootstrap(cssLinks);
    this.ready = new Promise((resolve, reject) => {
      this.resolveReady = resolve;
      this.rejectReady = reject;
    });
    // Routing need not await rendering; failures still surface visibly and never become unhandled rejections.
    this.ready.catch((error) => {
      if (this.state !== 'disposed') this.showError(error);
    });
    this.timeout = timeout;
  }

  mount(container) {
    if (this.bridge || this.state !== 'initializing')
      throw new Error('Compound view cannot be mounted twice or after disposal');
    if (!container) throw new Error('Missing compound iframe container');
    container.appendChild(this.iframe);
    this.bridge = new CompoundBridge({ peer: this.iframe.contentWindow, handlers: this.handlers() });
    this.timer = setTimeout(() => this.fail(new Error('Compound view initialization timed out')), this.timeout);
    return this;
  }

  snapshot() {
    return {
      locale: window.Luigi.i18n().getCurrentLocale(),
      featureToggles: window.Luigi.featureToggles().getActiveFeatureToggleList(),
      anchor: window.Luigi.routing().getAnchor(),
      route: String(window.Luigi.navigation().getCurrentRoute()),
      nodes: Object.fromEntries(
        Array.from(this.nodes, ([id, node]) => [
          id,
          {
            clientPermissions: node.clientPermissions || {},
            searchParams: RoutingHelpers.prepareSearchParamsForClient(node)
          }
        ])
      )
    };
  }

  node(params) {
    const node = this.nodes.get(params.nodeId);
    if (!node) throw new Error('Unknown compound node');
    return node;
  }

  navigation(params) {
    this.node(params);
    const options = params.options || {};
    object(options, 'navigation options');
    const allowed = ['fromContext', 'fromClosestContext', 'fromVirtualTreeRoot', 'fromParent', 'nodeParams'];
    if (Object.keys(options).some((key) => !allowed.includes(key))) throw new Error('Invalid navigation option');
    let manager = window.Luigi.navigation();
    if (options.fromContext !== undefined)
      manager = manager.fromContext(string(options.fromContext, 'navigation context'));
    for (const name of ['fromClosestContext', 'fromVirtualTreeRoot', 'fromParent']) {
      if (options[name] !== undefined && typeof options[name] !== 'boolean') throw new Error(`Invalid ${name}`);
      if (options[name]) manager = manager[name]();
    }
    if (options.nodeParams) manager = manager.withParams(object(options.nodeParams, 'node parameters'));
    return manager;
  }

  handlers() {
    const navigation = (method) => (params) => {
      const manager = this.navigation(params);
      string(params.path, 'navigation path');
      if (params.settings !== undefined) object(params.settings, 'view settings');
      if (method === 'openAsModal')
        return new Promise((resolve) => {
          manager.openAsModal(params.path, params.settings, (value) => resolve({ goBackValue: value }));
        });
      if (method === 'openAsSplitView') {
        this.splitViews.set(params.nodeId, manager.openAsSplitView(params.path, params.settings));
        return;
      }
      if (method === 'navigate') {
        if (params.preserveView !== undefined && typeof params.preserveView !== 'boolean')
          throw new Error('Invalid preserveView');
        manager.navigate(params.path, params.preserveView);
        return;
      }
      if (method === 'pathExists') return manager.pathExists(params.path);
      manager[method](params.path, params.settings);
    };
    const ux = (method) => (params) => {
      this.node(params);
      return window.Luigi.ux()[method](object(params.settings, 'UX settings'));
    };
    const rootOnly = (params) => {
      this.node(params);
      if (params.nodeId !== '_root') throw new Error('Operation is disabled for compound children');
    };
    return {
      ready: async () => {
        if (this.state !== 'initializing') return;
        this.state = 'rendering';
        try {
          await this.bridge.request('init', this.config, this.timeout);
          if (this.state === 'disposed' || this.state === 'failed') return;
          clearTimeout(this.timer);
          this.state = 'ready';
          this.resolveReady(this);
          const pendingContext = this.pendingContext;
          this.pendingContext = {};
          this.updateContext(pendingContext);
        } catch (error) {
          this.fail(error);
        }
      },
      'render.failed': ({ message }) => this.fail(new Error(string(message, 'component load error'))),
      'navigation.setViewGroupData': (params) => {
        const node = this.node(params);
        const data = object(params.data, 'view group data');
        const viewGroup = NavigationHelpers.findViewGroup(node);
        if (!viewGroup) return;
        const settings = NavigationHelpers.getViewGroupSettings(viewGroup);
        settings._liveCustomData = data;
        LuigiConfig.configChanged('navigation.viewgroupdata');
      },
      'navigation.navigate': navigation('navigate'),
      'navigation.openAsModal': navigation('openAsModal'),
      'navigation.openAsDrawer': navigation('openAsDrawer'),
      'navigation.openAsSplitView': navigation('openAsSplitView'),
      'navigation.pathExists': navigation('pathExists'),
      'navigation.getCurrentRoute': (params) => this.navigation(params).getCurrentRoute(),
      'navigation.goBack': (params) => {
        this.node(params);
        window.Luigi.navigation().goBack(params.value);
      },
      'navigation.splitView': (params) => {
        this.node(params);
        if (!['close', 'collapse', 'expand', 'isCollapsed', 'isExpanded', 'exists'].includes(params.action))
          throw new Error('Invalid split view action');
        const splitView = this.splitViews.get(params.nodeId);
        if (!splitView) throw new Error('No split view opened by this node');
        return splitView[params.action]();
      },
      'ux.showAlert': ux('showAlert'),
      'ux.showConfirmationModal': ux('showConfirmationModal'),
      'ux.showLoadingIndicator': (params) => {
        this.node(params);
        window.Luigi.ux().showLoadingIndicator();
      },
      'ux.hideLoadingIndicator': (params) => {
        this.node(params);
        window.Luigi.ux().hideLoadingIndicator();
      },
      'ux.closeCurrentModal': (params) => {
        this.node(params);
        window.Luigi.ux().closeCurrentModal();
      },
      'ux.setDocumentTitle': (params) => {
        this.node(params);
        window.Luigi.ux().setDocumentTitle(string(params.title, 'title'));
      },
      'ux.setDirtyStatus': (params) => {
        this.node(params);
        if (typeof params.dirty !== 'boolean') throw new Error('Invalid dirty status');
        window.postMessage({ msg: 'luigi.set-page-dirty', dirty: params.dirty }, '*');
      },
      'routing.addCoreSearchParams': (params) => {
        RoutingHelpers.addSearchParamsFromClient(
          this.node(params),
          object(params.searchParams, 'search parameters'),
          params.keepBrowserHistory,
          params.preventLuigiConfigUpdate
        );
        this.updateContext({});
      },
      'routing.addNodeParams': (params) => {
        rootOnly(params);
        window.Luigi.routing().addNodeParams(object(params.params, 'node parameters'), params.keepBrowserHistory);
      },
      'routing.setAnchor': (params) => {
        rootOnly(params);
        window.Luigi.routing().setAnchor(string(params.anchor, 'anchor'));
        this.updateContext({});
      },
      'settings.getUserSettings': (params) => WebComponentService.getUserSettingsForWc(this.node(params))
    };
  }

  updateContext(context) {
    if (['failed', 'disposed'].includes(this.state)) return;
    this.componentData = { ...this.componentData, context: { ...this.componentData.context, ...context } };
    if (this.state === 'ready') this.bridge.notify('context.update', { context, snapshot: this.snapshot() });
    else this.pendingContext = { ...this.pendingContext, ...context };
  }

  fail(error) {
    if (['failed', 'disposed'].includes(this.state)) return;
    const wasReady = this.state === 'ready';
    clearTimeout(this.timer);
    this.state = 'failed';
    this.bridge?.dispose();
    this.rejectReady(error);
    // Deferred imports can fail after the initialization promise has already resolved.
    if (wasReady) this.showError(error);
  }

  showError(error) {
    console.error('Luigi isolated compound view:', error);
    this.errorElement = document.createElement('div');
    this.errorElement.setAttribute('role', 'alert');
    this.errorElement.textContent = 'Could not load the compound view.';
    this.iframe.replaceWith(this.errorElement);
  }

  dispose() {
    if (this.state === 'disposed') return;
    this.state = 'disposed';
    clearTimeout(this.timer);
    this.bridge?.dispose();
    this.rejectReady(new Error('Compound view disposed'));
    this.iframe.remove();
    this.errorElement?.remove();
    this.splitViews.clear();
  }
}

class CompoundIframeSvcClass {
  createIsolatedCompound(navNode, container, componentData) {
    this.cleanup();
    const view = new IsolatedCompoundView(navNode, componentData);
    this.view = view;
    try {
      return view.mount(container);
    } catch (error) {
      this.cleanup();
      throw error;
    }
  }

  forwardContextUpdate(context) {
    this.view?.updateContext(context);
  }
  isActive() {
    return !!this.view && !['failed', 'disposed'].includes(this.view.state);
  }
  getIframe() {
    return this.isActive() ? this.view.iframe : null;
  }
  cleanup() {
    this.view?.dispose();
    this.view = null;
  }
}

export const CompoundIframeService = new CompoundIframeSvcClass();
