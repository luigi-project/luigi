import { LazyCompoundLoader } from '../../src/services/compound/lazy-loading';
import { startCompoundRuntime } from '../../src/services/compound/runtime';
import { COMPOUND_PROTOCOL } from '../../src/services/compound/bridge';

const flush = async () => {
  for (let i = 0; i < 12; i++) await Promise.resolve();
};

function observerMock() {
  let intersect;
  const observer = { observe: jest.fn(), unobserve: jest.fn(), disconnect: jest.fn() };
  return {
    observer,
    createObserver: jest.fn((callback) => {
      intersect = callback;
      return observer;
    }),
    enter: (container, isIntersecting = true) => intersect([{ target: container, isIntersecting }])
  };
}

describe('lazy compound loader', () => {
  let mock, loader, load, onError, container;
  beforeEach(() => {
    jest.useFakeTimers();
    mock = observerMock();
    load = jest.fn().mockResolvedValue(undefined);
    onError = jest.fn();
    container = document.createElement('div');
  });
  afterEach(() => {
    loader?.dispose();
    jest.useRealTimers();
  });
  const create = (options = {}) => {
    loader = new LazyCompoundLoader({ options, load, onError, createObserver: mock.createObserver, timeout: 100 });
    return loader;
  };

  it('uses the configured root margin and does not import offscreen children', () => {
    create({ intersectionRootMargin: '200px' }).observe(container, { viewUrl: '/child.js' }, {}, 'child');
    expect(mock.createObserver).toHaveBeenCalledWith(expect.any(Function), { rootMargin: '200px' });
    expect(container.style.height).toBe('500px');
    mock.enter(container, false);
    expect(load).not.toHaveBeenCalled();
  });

  it('loads only once and removes the temporary height after loading', async () => {
    const context = { context: { value: 1 } };
    const node = { viewUrl: '/child.js', layoutConfig: { temporaryContainerHeight: '300px' } };
    create({ temporaryContainerHeight: '200px' }).observe(container, node, context, 'child');
    expect(container.style.height).toBe('300px');
    mock.enter(container);
    mock.enter(container);
    await flush();
    expect(load).toHaveBeenCalledTimes(1);
    expect(load).toHaveBeenCalledWith({ container, node, context, nodeId: 'child' });
    expect(mock.observer.unobserve).toHaveBeenCalledTimes(1);
    expect(container.style.height).toBe('');
    expect(jest.getTimerCount()).toBe(0);
  });

  it('preserves container height when temporary heights are disabled', async () => {
    container.style.height = '80px';
    create({ noTemporaryContainerHeight: true }).observe(container, { viewUrl: '/child.js' }, {}, 'child');
    expect(container.style.height).toBe('80px');
    mock.enter(container);
    await flush();
    expect(container.style.height).toBe('80px');
  });

  it('disconnects and cancels queued/in-flight work on disposal', async () => {
    load.mockImplementation(() => new Promise(() => {}));
    create().observe(container, { viewUrl: '/child.js' }, {}, 'child');
    mock.enter(container);
    await flush();
    loader.dispose();
    mock.enter(container);
    await flush();
    expect(load).toHaveBeenCalledTimes(1);
    expect(mock.observer.disconnect).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
    expect(jest.getTimerCount()).toBe(0);
  });

  it('reports deferred load errors and disconnects remaining observations', async () => {
    load.mockRejectedValue(new Error('load failed'));
    create().observe(container, { viewUrl: '/child.js' }, {}, 'child');
    mock.enter(container);
    await flush();
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'load failed' }));
    expect(mock.observer.disconnect).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(0);
  });

  it('times out a hanging deferred import', async () => {
    load.mockImplementation(() => new Promise(() => {}));
    create().observe(container, { viewUrl: '/child.js' }, {}, 'child');
    mock.enter(container);
    await flush();
    jest.advanceTimersByTime(100);
    await flush();
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'Component load timed out: /child.js' }));
    expect(loader.disposed).toBe(true);
    expect(jest.getTimerCount()).toBe(0);
  });
});

describe('isolated lazy child runtime', () => {
  let runtime,
    mock,
    host,
    peer,
    importModule,
    sequence = 0;
  beforeEach(() => {
    mock = observerMock();
    peer = { postMessage: jest.fn() };
    host = { parent: peer, addEventListener: jest.fn(), removeEventListener: jest.fn() };
    importModule = jest.fn().mockResolvedValue({ default: class extends HTMLElement {} });
    runtime = startCompoundRuntime({ host, importModule, createObserver: mock.createObserver });
  });
  afterEach(() => {
    runtime.dispose();
    document.body.innerHTML = '';
  });

  async function init(options = {}) {
    const config = {
      navNode: {
        compound: {
          lazyLoadingOptions: { enabled: true, temporaryContainerHeight: '200px', ...options },
          children: [
            { id: 'child', viewUrl: `http://localhost/lazy-${++sequence}.js`, context: { own: 1, shared: 'child' } }
          ]
        }
      },
      context: { shared: 'root' },
      pathParams: { id: '1' },
      nodeParams: {},
      snapshot: { locale: 'en', nodes: { child: {} } }
    };
    await runtime.bridge.receive({
      source: peer,
      data: { protocol: COMPOUND_PROTOCOL, type: 'request', id: 1, method: 'init', params: config }
    });
    return document.body.firstElementChild.firstElementChild;
  }

  async function update(context, snapshot) {
    await runtime.bridge.receive({
      source: peer,
      data: {
        protocol: COMPOUND_PROTOCOL,
        type: 'notification',
        method: 'context.update',
        params: { context, snapshot }
      }
    });
  }

  it('acknowledges initialization before importing offscreen children and loads on intersection', async () => {
    const container = await init();
    expect(peer.postMessage.mock.calls.at(-1)[0]).toMatchObject({ type: 'response', id: 1 });
    expect(importModule).not.toHaveBeenCalled();
    expect(document.querySelector('[lui_web_component]')).toBeNull();
    expect(container.style.height).toBe('200px');
    mock.enter(container);
    await flush();
    expect(importModule).toHaveBeenCalledTimes(1);
    expect(document.querySelector('[nodeId="child"]').context).toEqual({ shared: 'child', own: 1 });
    expect(container.style.height).toBe('');
  });

  it('keeps queued and in-flight children up to date with context and snapshots', async () => {
    let finish;
    importModule.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        })
    );
    const container = await init();
    await update({ shared: 'queued', queued: true });
    mock.enter(container);
    await flush();
    await update({ shared: 'in-flight' }, { locale: 'de', nodes: { child: { searchParams: { allowed: 'updated' } } } });
    finish({ default: class extends HTMLElement {} });
    await flush();
    const wc = document.querySelector('[nodeId="child"]');
    expect(wc.context).toEqual({ shared: 'in-flight', own: 1, queued: true });
    expect(wc.LuigiClient.getCurrentLocale()).toBe('de');
    expect(wc.LuigiClient.getCoreSearchParams()).toEqual({ allowed: 'updated' });
  });

  it('prevents imports for unobserved children after disposal', async () => {
    const container = await init();
    runtime.dispose();
    mock.enter(container);
    await flush();
    expect(importModule).not.toHaveBeenCalled();
    expect(mock.observer.disconnect).toHaveBeenCalledTimes(1);
  });

  it('does not attach an in-flight lazy child after disposal', async () => {
    let finish;
    importModule.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        })
    );
    const container = await init();
    mock.enter(container);
    await flush();
    runtime.dispose();
    finish({ default: class extends HTMLElement {} });
    await flush();
    expect(document.querySelector('[lui_web_component]')).toBeNull();
    expect(mock.observer.disconnect).toHaveBeenCalledTimes(1);
  });

  it('reports failures after initialization via the dedicated shell notification', async () => {
    importModule.mockRejectedValue(new Error('lazy import failed'));
    const container = await init();
    mock.enter(container);
    await flush();
    expect(peer.postMessage.mock.calls.at(-1)[0]).toMatchObject({
      type: 'notification',
      method: 'render.failed',
      params: { message: 'lazy import failed' }
    });
    expect(mock.observer.disconnect).toHaveBeenCalledTimes(1);
    expect(document.querySelector('[lui_web_component]')).toBeNull();
  });
});
