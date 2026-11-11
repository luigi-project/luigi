export const COMPOUND_PROTOCOL = 'luigi.compound.v1';

/** A source-checked, allowlisted RPC connection to one window. */
export class CompoundBridge {
  constructor({
    host = window,
    peer,
    handlers = {},
    timeout = 30000,
    onError = (error) => console.error('Luigi compound:', error)
  }) {
    this.host = host;
    this.peer = peer;
    this.handlers = handlers;
    this.timeout = timeout;
    this.onError = onError;
    this.pending = new Map();
    this.counter = 0;
    this.disposed = false;
    this.listener = (event) => this.receive(event);
    host.addEventListener('message', this.listener);
  }

  send(message) {
    if (this.disposed) throw new Error('Compound view disposed');
    // Opaque sandbox origins require '*'; receivers validate the window source.
    this.peer.postMessage({ protocol: COMPOUND_PROTOCOL, ...message }, '*');
  }

  notify(method, params = {}) {
    this.send({ type: 'notification', method, params });
  }

  request(method, params = {}, timeout = this.timeout) {
    return new Promise((resolve, reject) => {
      const id = ++this.counter;
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Compound request timed out: ${method}`));
      }, timeout);
      this.pending.set(id, { resolve, reject, timer });
      try {
        this.send({ type: 'request', id, method, params });
      } catch (error) {
        clearTimeout(timer);
        this.pending.delete(id);
        reject(error);
      }
    });
  }

  async receive(event) {
    const data = event.data;
    if (this.disposed || event.source !== this.peer || data?.protocol !== COMPOUND_PROTOCOL) return;
    if (data.type === 'response') {
      const pending = this.pending.get(data.id);
      if (!pending) return;
      clearTimeout(pending.timer);
      this.pending.delete(data.id);
      if (typeof data.error === 'string') pending.reject(new Error(data.error));
      else pending.resolve(data.result);
      return;
    }
    if (!['request', 'notification'].includes(data.type)) return;
    if (data.type === 'request' && (!Number.isSafeInteger(data.id) || data.id < 1)) return;
    try {
      if (typeof data.method !== 'string' || !Object.prototype.hasOwnProperty.call(this.handlers, data.method)) {
        throw new Error('Unsupported compound method');
      }
      if (!data.params || typeof data.params !== 'object' || Array.isArray(data.params)) {
        throw new Error('Invalid compound parameters');
      }
      const result = await this.handlers[data.method](data.params);
      if (data.type === 'request' && !this.disposed) this.send({ type: 'response', id: data.id, result });
    } catch (error) {
      if (this.disposed) return;
      if (data.type === 'request') {
        try {
          this.send({ type: 'response', id: data.id, error: error?.message || String(error) });
        } catch (sendError) {
          this.onError(sendError);
        }
      } else this.onError(error);
    }
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.host.removeEventListener('message', this.listener);
    this.pending.forEach(({ timer, reject }) => {
      clearTimeout(timer);
      reject(new Error('Compound view disposed'));
    });
    this.pending.clear();
  }
}
