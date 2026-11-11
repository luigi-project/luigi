import { CompoundBridge, COMPOUND_PROTOCOL } from '../../src/services/compound/bridge';
import { normalizeCompoundConfig } from '../../src/services/compound/config';
import { createIsolatedClient } from '../../src/services/compound/client';
import { getCompoundRenderer, renderCompound, registerModule } from '../../src/services/compound/renderer';

const message = (data) => ({ protocol: COMPOUND_PROTOCOL, ...data });

describe('CompoundBridge', () => {
  let host, peer, bridge;
  beforeEach(() => {
    jest.useFakeTimers();
    host = { addEventListener: jest.fn(), removeEventListener: jest.fn() };
    peer = { postMessage: jest.fn() };
    bridge = new CompoundBridge({
      host,
      peer,
      timeout: 100,
      handlers: { echo: ({ value }) => value },
      onError: jest.fn()
    });
  });
  afterEach(() => {
    bridge.dispose();
    jest.useRealTimers();
  });

  it('correlates responses only from the expected source and protocol', async () => {
    const result = bridge.request('echo', { value: 7 });
    const request = peer.postMessage.mock.calls[0][0];
    await bridge.receive({ source: {}, data: message({ type: 'response', id: request.id, result: 'wrong' }) });
    await bridge.receive({ source: peer, data: { type: 'response', id: request.id, result: 'wrong' } });
    expect(bridge.pending.size).toBe(1);
    await bridge.receive({ source: peer, data: message({ type: 'response', id: request.id, result: 7 }) });
    await expect(result).resolves.toBe(7);
    expect(bridge.pending.size).toBe(0);
    expect(jest.getTimerCount()).toBe(0);
  });

  it('returns handler results and errors', async () => {
    await bridge.receive({
      source: peer,
      data: message({ type: 'request', id: 1, method: 'echo', params: { value: 9 } })
    });
    expect(peer.postMessage).toHaveBeenLastCalledWith(message({ type: 'response', id: 1, result: 9 }), '*');
    await bridge.receive({
      source: peer,
      data: message({ type: 'request', id: 2, method: 'constructor', params: {} })
    });
    expect(peer.postMessage.mock.calls[1][0].error).toMatch(/Unsupported/);
  });

  it('rejects invalid parameters and request IDs', async () => {
    await bridge.receive({ source: peer, data: message({ type: 'request', id: 1, method: 'echo', params: [] }) });
    expect(peer.postMessage.mock.calls[0][0].error).toMatch(/Invalid/);
    peer.postMessage.mockClear();
    await bridge.receive({ source: peer, data: message({ type: 'request', id: 'bad', method: 'echo', params: {} }) });
    expect(peer.postMessage).not.toHaveBeenCalled();
  });

  it('times out requests and clears them', async () => {
    const result = bridge.request('slow');
    const assertion = expect(result).rejects.toThrow('timed out');
    jest.advanceTimersByTime(100);
    await assertion;
    expect(bridge.pending.size).toBe(0);
  });

  it('rejects remote errors and postMessage failures', async () => {
    const result = bridge.request('echo');
    await bridge.receive({ source: peer, data: message({ type: 'response', id: 1, error: 'not permitted' }) });
    await expect(result).rejects.toThrow('not permitted');
    peer.postMessage.mockImplementation(() => {
      throw new Error('clone failed');
    });
    await expect(bridge.request('echo')).rejects.toThrow('clone failed');
    expect(bridge.pending.size).toBe(0);
  });

  it('disposes pending requests and ignores late handler completion', async () => {
    let finish;
    bridge.handlers.slow = () =>
      new Promise((resolve) => {
        finish = resolve;
      });
    const handling = bridge.receive({
      source: peer,
      data: message({ type: 'request', id: 8, method: 'slow', params: {} })
    });
    const result = bridge.request('echo');
    bridge.dispose();
    await expect(result).rejects.toThrow('disposed');
    finish('late');
    await handling;
    expect(peer.postMessage).toHaveBeenCalledTimes(1);
    expect(host.removeEventListener).toHaveBeenCalledWith('message', bridge.listener);
    expect(jest.getTimerCount()).toBe(0);
    await expect(bridge.request('echo')).rejects.toThrow('disposed');
  });
});

describe('isolated compound configuration', () => {
  const dependencies = {
    resolveUrl: (url) => new URL(url, 'https://shell.test/').href,
    getSnapshot: () => ({ nodes: {} })
  };
  const config = (compound, data = {}) => normalizeCompoundConfig({ compound }, data, dependencies);

  it('resolves URLs and selects only supported navigation properties', () => {
    const result = config({
      children: [{ viewUrl: '/child.js', label: () => 'not transferred', webcomponent: { tagName: 'my-child' } }]
    });
    expect(result.navNode.compound.children[0]).toMatchObject({
      id: 'gen_0',
      viewUrl: 'https://shell.test/child.js',
      webcomponent: { tagName: 'my-child' }
    });
    expect(result.navNode.compound.children[0].label).toBeUndefined();
  });

  it.each([
    { renderer: { use: {} } },
    { lazyLoadingOptions: { enabled: true, callback: () => {} } },
    { eventListeners: [{ dataConverter: () => {} }] },
    { children: [{ viewUrl: '/x', context: { callback: () => {} } }] },
    { children: [{ id: '_root', viewUrl: '/x' }] },
    {
      children: [
        { id: 'same', viewUrl: '/x' },
        { id: 'same', viewUrl: '/y' }
      ]
    },
    { children: [{}] }
  ])('rejects unsupported configuration: %j', (compound) => {
    expect(() => config(compound)).toThrow();
  });

  it('transfers lazy loading options and per-child height overrides', () => {
    const lazyLoadingOptions = {
      enabled: true,
      intersectionRootMargin: '100px',
      temporaryContainerHeight: '200px',
      noTemporaryContainerHeight: false
    };
    const result = config({
      lazyLoadingOptions,
      children: [{ viewUrl: '/child.js', layoutConfig: { temporaryContainerHeight: '300px' } }]
    });
    expect(result.navNode.compound.lazyLoadingOptions).toEqual(lazyLoadingOptions);
    expect(result.navNode.compound.children[0].layoutConfig.temporaryContainerHeight).toBe('300px');
  });

  it('rejects cycles with a useful property path', () => {
    const context = {};
    context.loop = context;
    expect(() => config({}, { context })).toThrow('context.loop');
  });
});

describe('isolated Client adapter', () => {
  let bridge, state, api;
  beforeEach(() => {
    bridge = { request: jest.fn().mockResolvedValue({ goBackValue: 42 }), notify: jest.fn() };
    state = {
      snapshot: {
        locale: 'en',
        featureToggles: ['x'],
        anchor: 'section',
        route: '/current',
        nodes: { child: { searchParams: { allowed: 'yes' }, clientPermissions: { test: true } } }
      }
    };
    api = createIsolatedClient({
      bridge,
      nodeId: 'child',
      eventBusElement: {},
      extendedContext: { pathParams: { id: '1' }, nodeParams: { test: 'value' } },
      state,
      isChild: true
    });
  });

  it('keeps getters synchronous and reads updated snapshots', () => {
    expect(api.getCurrentLocale()).toBe('en');
    expect(api.getCoreSearchParams()).toEqual({ allowed: 'yes' });
    expect(api.getAnchor()).toBe('section');
    expect(api.getNodeParams()).toEqual({});
    state.snapshot.locale = 'de';
    expect(api.getCurrentLocale()).toBe('de');
    expect(bridge.request).not.toHaveBeenCalled();
  });

  it('passes immutable navigation options to every operation and preserves modal callbacks', async () => {
    const manager = api.linkManager().fromContext('project').withParams({ id: 1 });
    manager.navigate('first');
    const sent = bridge.notify.mock.calls[0][1];
    manager.fromParent();
    expect(sent.options.fromParent).toBeUndefined();
    const callback = jest.fn();
    await manager.openAsModal('second', { title: 'Modal' }, callback);
    expect(callback).toHaveBeenCalledWith(42);
    expect(bridge.request).toHaveBeenCalledWith(
      'navigation.openAsModal',
      expect.objectContaining({
        nodeId: 'child',
        options: { fromContext: 'project', fromParent: true, nodeParams: { id: 1 } }
      }),
      300000
    );
    await manager.pathExists('third');
    expect(bridge.request).toHaveBeenLastCalledWith(
      'navigation.pathExists',
      expect.objectContaining({ options: expect.objectContaining({ fromParent: true }) }),
      undefined
    );
  });

  it('does not send functions across the boundary for split views', async () => {
    const split = api.linkManager().openAsSplitView('/split', {});
    await split.collapse();
    expect(bridge.request).toHaveBeenLastCalledWith(
      'navigation.splitView',
      { action: 'collapse', nodeId: 'child' },
      undefined
    );
  });

  it('blocks child node parameter and anchor mutations', () => {
    api.addNodeParams({ x: 1 });
    api.setAnchor('x');
    expect(bridge.notify).not.toHaveBeenCalled();
  });

  it('forwards view-group data without allowing the caller to select a group', () => {
    expect(api.setViewGroupData({ label: 'Updated' })).toBeUndefined();
    expect(bridge.notify).toHaveBeenCalledWith('navigation.setViewGroupData', {
      nodeId: 'child',
      data: { label: 'Updated' }
    });
  });
});

describe('shared compound renderer', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('merges child context, handles unusual node IDs, and does not duplicate wildcard listeners', async () => {
    const navNode = {
      compound: {
        children: [
          {
            id: 'a weird]id',
            viewUrl: '/child',
            context: { override: 'child' },
            eventListeners: [{ source: '*', name: 'tick', action: 'update', dataConverter: (value) => value + 1 }]
          }
        ]
      }
    };
    const received = jest.fn();
    const renderChild = jest.fn((node, container, context, id) => {
      const wc = document.createElement('div');
      wc.setAttribute('nodeId', id);
      wc.addEventListener('update', (event) => received(event.detail));
      container.appendChild(wc);
    });
    const renderer = getCompoundRenderer(navNode);
    const compound = await renderCompound({
      navNode,
      container: document.body,
      extendedContext: { context: { override: 'root', shared: 1 } },
      renderer,
      createContainer: () => renderer.createCompoundContainer(),
      renderChild
    });
    expect(renderChild.mock.calls[0][2].context).toEqual({ override: 'child', shared: 1 });
    compound.eventBus.onPublishEvent({ type: 'tick', detail: 1 }, 'source');
    compound.eventBus.onPublishEvent({ type: 'tick', detail: 2 }, 'source');
    expect(received.mock.calls).toEqual([[2], [3]]);
    expect(compound.eventBus.listeners['*.tick']).toHaveLength(1);
  });

  it('propagates load errors and prevents attachment after disposal', async () => {
    const navNode = { compound: { children: [] } };
    const renderer = getCompoundRenderer(navNode);
    await expect(
      renderCompound({
        navNode,
        container: document.body,
        extendedContext: {},
        renderer,
        createContainer: () => Promise.reject(new Error('load failed'))
      })
    ).rejects.toThrow('load failed');
    await renderCompound({
      navNode,
      container: document.body,
      extendedContext: {},
      renderer,
      createContainer: () => document.createElement('div'),
      isDisposed: () => true
    });
    expect(document.body.children).toHaveLength(0);
  });

  it('rejects modules that do not export an HTMLElement', () => {
    expect(() => registerModule({ default: {} }, 'invalid-component')).toThrow('No HTMLElement export');
  });

  it('does not interpret grid configuration as HTML', () => {
    const renderer = getCompoundRenderer({
      compound: {
        renderer: {
          use: 'grid',
          config: { columns: '</style><img src=x>', layouts: [{ minWidth: 0, columns: '1fr' }] }
        }
      }
    });
    const container = renderer.createCompoundContainer();
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('style').textContent).toContain('min-width: 0px');
  });
});
