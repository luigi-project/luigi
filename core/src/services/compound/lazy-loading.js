const DEFAULT_TEMPORARY_HEIGHT = '500px';

export function setCompoundItemTemporaryHeight(container, options = {}, layoutConfig = {}) {
  if (options?.noTemporaryContainerHeight !== true) {
    container.style.height =
      layoutConfig?.temporaryContainerHeight || options?.temporaryContainerHeight || DEFAULT_TEMPORARY_HEIGHT;
  }
}

export function removeCompoundItemTemporaryHeight(container, noTemporaryContainerHeight) {
  if (noTemporaryContainerHeight !== true) container.style.removeProperty('height');
}

/** Schedules imports in the iframe's own viewport. Offscreen children never hold up initialization. */
export class LazyCompoundLoader {
  constructor({
    options = {},
    load,
    onError,
    createObserver = (callback, config) => new IntersectionObserver(callback, config),
    timeout = 30000
  }) {
    this.options = options;
    this.load = load;
    this.onError = onError;
    this.timeout = timeout;
    this.queued = new Map();
    this.inflight = new Set();
    this.disposed = false;
    this.observer = createObserver((entries) => this.intersect(entries), {
      rootMargin: options.intersectionRootMargin || '0px'
    });
  }

  observe(container, node, context, nodeId) {
    if (this.disposed) return;
    setCompoundItemTemporaryHeight(container, this.options, node.layoutConfig);
    this.queued.set(container, { container, node, context, nodeId });
    this.observer.observe(container);
  }

  intersect(entries) {
    if (this.disposed) return;
    entries
      .filter((entry) => entry.isIntersecting)
      .forEach(({ target }) => {
        const task = this.queued.get(target);
        if (!task) return;
        // Remove before importing so repeated intersection notifications cannot start duplicate loads.
        this.queued.delete(target);
        this.observer.unobserve(target);
        this.run(task);
      });
  }

  run(task) {
    let cancel;
    let timer;
    const pending = new Promise((resolve, reject) => {
      cancel = () => {
        clearTimeout(timer);
        reject(new Error('Compound view disposed'));
      };
      this.inflight.add(cancel);
      timer = setTimeout(() => reject(new Error(`Component load timed out: ${task.node.viewUrl}`)), this.timeout);
      Promise.resolve()
        .then(() => {
          if (!this.disposed) return this.load(task);
        })
        .then(resolve, reject);
    });
    pending
      .then(() => {
        if (!this.disposed) removeCompoundItemTemporaryHeight(task.container, this.options.noTemporaryContainerHeight);
      })
      .catch((error) => {
        if (!this.disposed) {
          this.dispose();
          this.onError(error);
        }
      })
      .finally(() => {
        clearTimeout(timer);
        this.inflight.delete(cancel);
      });
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.observer.disconnect();
    this.queued.clear();
    this.inflight.forEach((cancel) => cancel());
    this.inflight.clear();
  }
}
