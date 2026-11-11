import { IsolatedCompoundView, CompoundIframeService } from '../../src/services/compound-iframe';
import { LuigiConfig, LuigiElements } from '../../src/core-api';
import { AuthLayerSvc } from '../../src/services';
import { getCompoundIframeBootstrapScript } from '../../src/services/compound-iframe-bootstrap';
import { startCompoundRuntime } from '../../src/services/compound/runtime';
import { RoutingHelpers, NavigationHelpers } from '../../src/utilities/helpers';
import { COMPOUND_PROTOCOL } from '../../src/services/compound/bridge';

jest.mock('../../src/services/compound/runtime-source', () => ({
  __esModule: true,
  default: 'console.log("</script>");'
}));

const envelope = (data) => ({ protocol: COMPOUND_PROTOCOL, ...data });

describe('isolated compound view lifecycle and shell adapter', () => {
  let view, navigation, node, container;
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    navigation = {
      getCurrentRoute: jest.fn(() => '/current'),
      pathExists: jest.fn().mockResolvedValue(true),
      navigate: jest.fn(),
      openAsModal: jest.fn((path, settings, callback) => callback('closed')),
      openAsDrawer: jest.fn(),
      fromContext: jest.fn().mockReturnThis(),
      fromParent: jest.fn().mockReturnThis(),
      withParams: jest.fn().mockReturnThis()
    };
    window.Luigi = {
      navigation: () => navigation,
      i18n: () => ({ getCurrentLocale: () => 'en' }),
      featureToggles: () => ({ getActiveFeatureToggleList: () => [] }),
      routing: () => ({ getAnchor: () => 'anchor' }),
      ux: () => ({ showConfirmationModal: () => Promise.reject(new Error('cancelled')) })
    };
    jest
      .spyOn(RoutingHelpers, 'prepareSearchParamsForClient')
      .mockImplementation((node) => (node.clientPermissions ? { permitted: 'value' } : {}));
    node = {
      compound: {
        isolated: true,
        children: [{ id: 'child', viewUrl: '/child.js', clientPermissions: { urlParameters: {} } }]
      }
    };
    container = document.createElement('div');
    document.body.appendChild(container);
    view = new IsolatedCompoundView(node, { context: { value: 1 } }, { bootstrap: () => '', timeout: 100 });
  });
  afterEach(() => {
    view.dispose();
    document.body.innerHTML = '';
    delete window.Luigi;
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('maintains a sandbox with no same-origin permission and exposes scoped snapshots', () => {
    expect(String(view.iframe.sandbox)).toBe('allow-scripts');
    expect(view.config.snapshot.nodes.child.searchParams).toEqual({ permitted: 'value' });
    expect(view.config.snapshot.nodes._root.searchParams).toEqual({});
    expect(view.config.navNode.compound.children[0].viewUrl).toBe('http://localhost/child.js');
  });

  it('handshakes once and forwards updates accumulated during initialization', async () => {
    view.mount(container);
    const request = jest.spyOn(view.bridge, 'request').mockResolvedValue(undefined);
    const notify = jest.spyOn(view.bridge, 'notify').mockImplementation(() => {});
    view.updateContext({ value: 2 });
    await view.handlers().ready({});
    await view.ready;
    expect(view.state).toBe('ready');
    expect(notify).toHaveBeenCalledWith('context.update', expect.objectContaining({ context: { value: 2 } }));
    await view.handlers().ready({});
    expect(request).toHaveBeenCalledTimes(1);
    view.dispose();
    expect(container.children).toHaveLength(0);
    expect(view.bridge.pending.size).toBe(0);
  });

  it('does not resend root context over child overrides after initialization', async () => {
    view.mount(container);
    jest.spyOn(view.bridge, 'request').mockResolvedValue(undefined);
    const notify = jest.spyOn(view.bridge, 'notify').mockImplementation(() => {});
    await view.handlers().ready({});
    expect(notify).toHaveBeenCalledWith('context.update', expect.objectContaining({ context: {} }));
    expect(() => view.mount(container)).toThrow('cannot be mounted');
  });

  it('retrieves user settings for the requesting node only', async () => {
    node.compound.children[0].userSettingsGroup = 'child-settings';
    jest.spyOn(LuigiConfig, 'readUserSettings').mockResolvedValue({
      'child-settings': { theme: 'dark' },
      'other-settings': { private: true }
    });
    await expect(view.handlers()['settings.getUserSettings']({ nodeId: 'child' })).resolves.toEqual({ theme: 'dark' });
    await expect(view.handlers()['settings.getUserSettings']({ nodeId: '_root' })).rejects.toBeNull();
  });

  it("updates only the requesting node's view group and notifies Luigi", () => {
    node.viewGroup = 'root-group';
    node.compound.children[0].viewGroup = 'child-group';
    const groups = { 'root-group': { customData: { label: 'Root' } }, 'child-group': {} };
    jest.spyOn(NavigationHelpers, 'getAllViewGroupSettings').mockReturnValue(groups);
    const changed = jest.spyOn(LuigiConfig, 'configChanged').mockImplementation(() => {});
    const handlers = view.handlers();
    handlers['navigation.setViewGroupData']({ nodeId: 'child', data: { label: 'Child' }, viewGroup: 'root-group' });
    expect(groups['child-group']._liveCustomData).toEqual({ label: 'Child' });
    expect(groups['root-group']._liveCustomData).toBeUndefined();
    handlers['navigation.setViewGroupData']({ nodeId: '_root', data: { label: 'Updated root' } });
    expect(groups['root-group']._liveCustomData).toEqual({ label: 'Updated root' });
    expect(changed).toHaveBeenCalledTimes(2);
    expect(changed).toHaveBeenLastCalledWith('navigation.viewgroupdata');
  });

  it('keeps view-group updates a no-op for nodes without a group and rejects invalid callers/data', () => {
    const changed = jest.spyOn(LuigiConfig, 'configChanged').mockImplementation(() => {});
    const handlers = view.handlers();
    handlers['navigation.setViewGroupData']({ nodeId: 'child', data: {} });
    expect(changed).not.toHaveBeenCalled();
    expect(() => handlers['navigation.setViewGroupData']({ nodeId: 'forged', data: {} })).toThrow('Unknown');
    expect(() => handlers['navigation.setViewGroupData']({ nodeId: 'child', data: null })).toThrow('view group data');
    expect(() => handlers['navigation.setViewGroupData']({ nodeId: 'child', data: [] })).toThrow('view group data');
  });

  it('uses the existing same-origin rules when inheriting a view group', () => {
    node.viewGroup = 'inherited';
    node.viewUrl = 'http://localhost/root.js';
    node.compound.children[0].viewUrl = 'http://localhost/child.js';
    node.compound.children[0].parent = node;
    const settings = {};
    jest.spyOn(NavigationHelpers, 'getAllViewGroupSettings').mockReturnValue({ inherited: settings });
    const changed = jest.spyOn(LuigiConfig, 'configChanged').mockImplementation(() => {});
    view.handlers()['navigation.setViewGroupData']({ nodeId: 'child', data: { label: 'Inherited' } });
    expect(settings._liveCustomData).toEqual({ label: 'Inherited' });
    node.compound.children[0].viewUrl = 'https://other.test/child.js';
    view.handlers()['navigation.setViewGroupData']({ nodeId: 'child', data: { label: 'Blocked' } });
    expect(settings._liveCustomData).toEqual({ label: 'Inherited' });
    expect(changed).toHaveBeenCalledTimes(1);
  });

  it('shows deferred load errors even after readiness has resolved', async () => {
    view.mount(container);
    jest.spyOn(view.bridge, 'request').mockResolvedValue(undefined);
    jest.spyOn(view.bridge, 'notify').mockImplementation(() => {});
    await view.handlers().ready({});
    await view.ready;
    view.handlers()['render.failed']({ message: 'Deferred import failed' });
    expect(view.state).toBe('failed');
    expect(view.bridge.disposed).toBe(true);
    expect(container.querySelector('[role="alert"]')).not.toBeNull();
    view.dispose();
    expect(container.children).toHaveLength(0);
  });

  it('disposes the active view when Luigi unloads', () => {
    view.mount(container);
    CompoundIframeService.view = view;
    window.Luigi._store = { clear: jest.fn() };
    jest.spyOn(LuigiElements, 'getLuigiContainer').mockReturnValue(container);
    jest.spyOn(AuthLayerSvc, 'unload').mockImplementation(() => {});
    LuigiConfig.unload();
    expect(view.state).toBe('disposed');
    expect(CompoundIframeService.isActive()).toBe(false);
  });

  it('fails visibly on initialization timeout and cleans up the error element', async () => {
    view.mount(container);
    jest.advanceTimersByTime(100);
    await expect(view.ready).rejects.toThrow('timed out');
    expect(view.state).toBe('failed');
    expect(container.querySelector('[role="alert"]').textContent).toContain('Could not load');
    expect(view.bridge.disposed).toBe(true);
    view.dispose();
    expect(container.children).toHaveLength(0);
  });

  it('disposes cleanly before initialization finishes', async () => {
    view.mount(container);
    view.dispose();
    await expect(view.ready).rejects.toThrow('disposed');
    expect(view.state).toBe('disposed');
    expect(container.querySelector('[role="alert"]')).toBeNull();
  });

  it('applies navigation options to path checks and modal opening', async () => {
    const handlers = view.handlers();
    const params = {
      nodeId: 'child',
      path: 'target',
      options: { fromContext: 'project', fromParent: true, nodeParams: { id: 1 } }
    };
    await expect(handlers['navigation.pathExists'](params)).resolves.toBe(true);
    await expect(handlers['navigation.openAsModal'](params)).resolves.toEqual({ goBackValue: 'closed' });
    expect(navigation.fromContext).toHaveBeenCalledTimes(2);
    expect(navigation.fromParent).toHaveBeenCalledTimes(2);
    expect(navigation.withParams).toHaveBeenCalledTimes(2);
  });

  it('does not accept forged nodes, unknown options, or child-only mutations', () => {
    const handlers = view.handlers();
    expect(() => handlers['navigation.navigate']({ nodeId: 'forged', path: '/x' })).toThrow('Unknown');
    expect(() =>
      handlers['navigation.navigate']({ nodeId: 'child', path: '/x', options: { invoke: 'anything' } })
    ).toThrow('Invalid');
    expect(() => handlers['routing.setAnchor']({ nodeId: 'child', anchor: 'x' })).toThrow('disabled');
    expect(() => handlers['navigation.navigate']({ nodeId: 'child', path: {} })).toThrow('path');
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  it('propagates confirmation rejection rather than turning cancellation into success', async () => {
    await expect(view.handlers()['ux.showConfirmationModal']({ nodeId: 'child', settings: {} })).rejects.toThrow(
      'cancelled'
    );
  });

  it('enforces allowed web-component URLs before mounting', () => {
    expect(
      () =>
        new IsolatedCompoundView(
          { compound: { children: [{ viewUrl: 'https://untrusted.test/child.js' }] } },
          {},
          { bootstrap: () => '' }
        )
    ).toThrow('not allowed');
  });
});

describe('iframe bootstrap HTML', () => {
  it('escapes stylesheet attributes and script closing sequences', () => {
    const html = getCompoundIframeBootstrapScript(['https://shell.test/luigi.css?x="<>&']);
    expect(html).toContain('&quot;&lt;&gt;&amp;');
    expect(html.match(/<\/script>/gi)).toHaveLength(1);
    expect(html).toContain('<\\/script>');
  });
});

describe('isolated iframe runtime', () => {
  let runtime, host, peer;
  const config = (child) => ({
    navNode: { compound: { children: [child] } },
    context: { shared: 'root' },
    pathParams: { id: '1' },
    nodeParams: {},
    snapshot: { locale: 'en', featureToggles: [], route: '/current', anchor: '', nodes: { child: {} } }
  });
  beforeEach(() => {
    peer = { postMessage: jest.fn() };
    host = { parent: peer, addEventListener: jest.fn(), removeEventListener: jest.fn() };
  });
  afterEach(() => {
    runtime?.dispose();
    document.body.innerHTML = '';
  });

  it('renders imported children, ignores foreign initialization, and updates context', async () => {
    runtime = startCompoundRuntime({
      host,
      importModule: jest.fn().mockResolvedValue({ default: class extends HTMLElement {} })
    });
    const init = envelope({
      type: 'request',
      id: 1,
      method: 'init',
      params: config({ id: 'child', viewUrl: 'http://localhost/runtime-child.js', context: { own: 1 } })
    });
    await runtime.bridge.receive({ source: {}, data: init });
    expect(document.querySelector('[lui_web_component]')).toBeNull();
    await runtime.bridge.receive({ source: peer, data: init });
    const wc = document.querySelector('[lui_web_component]');
    expect(wc.context).toEqual({ shared: 'root', own: 1 });
    expect(wc.LuigiClient.getPathParams()).toEqual({ id: '1' });
    await runtime.bridge.receive({
      source: peer,
      data: envelope({ type: 'notification', method: 'context.update', params: { context: { shared: 'updated' } } })
    });
    expect(wc.context).toEqual({ shared: 'updated', own: 1 });
    await runtime.bridge.receive({ source: peer, data: init });
    expect(peer.postMessage.mock.calls.at(-1)[0].error).toMatch(/already initialized/);
  });

  it('reports component import errors to the shell', async () => {
    runtime = startCompoundRuntime({ host, importModule: () => Promise.reject(new Error('import failed')) });
    await runtime.bridge.receive({
      source: peer,
      data: envelope({
        type: 'request',
        id: 1,
        method: 'init',
        params: config({ id: 'child', viewUrl: 'http://localhost/failure.js' })
      })
    });
    expect(peer.postMessage.mock.calls.at(-1)[0].error).toBe('import failed');
  });

  it('does not attach late imports after disposal', async () => {
    let finish;
    runtime = startCompoundRuntime({
      host,
      importModule: () =>
        new Promise((resolve) => {
          finish = resolve;
        })
    });
    const pending = runtime.bridge.receive({
      source: peer,
      data: envelope({
        type: 'request',
        id: 1,
        method: 'init',
        params: config({ id: 'child', viewUrl: 'http://localhost/late.js' })
      })
    });
    await Promise.resolve();
    await Promise.resolve();
    runtime.dispose();
    finish({ default: class extends HTMLElement {} });
    await pending;
    expect(document.querySelector('[lui_web_component]')).toBeNull();
    expect(peer.postMessage).toHaveBeenCalledTimes(1); // only readiness, no late response
  });

  it('rejects self-registered script load errors', async () => {
    const errorLog = jest.spyOn(console, 'error').mockImplementation(() => {});
    runtime = startCompoundRuntime({ host });
    const pending = runtime.bridge.receive({
      source: peer,
      data: envelope({
        type: 'request',
        id: 1,
        method: 'init',
        params: config({ id: 'child', viewUrl: 'http://localhost/self.js', webcomponent: { selfRegistered: true } })
      })
    });
    // Happy DOM reports a script error because external script loading is disabled.
    await pending;
    expect(peer.postMessage.mock.calls.at(-1)[0].error).toContain('Could not load component');
    expect(document.querySelector('script[src]')).toBeNull();
    errorLog.mockRestore();
  });
});
