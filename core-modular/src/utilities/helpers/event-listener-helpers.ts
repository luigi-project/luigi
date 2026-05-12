/* istanbul ignore file */

export const EventListenerHelpers = {
  listeners: [] as any[],
  hashChangeWithoutSync: false,

  addEventListener(type: any, listenerFn: any, options?: Record<'once', boolean>): void {
    this.listeners.push({ type, listenerFn, options });
    window.addEventListener(type, listenerFn, options);
  },

  removeEventListener(type: any, listenerFn: any): void {
    this.listeners = this.listeners.filter((l) => !(l.type === type && l.listenerFn === listenerFn));
    window.removeEventListener(type, listenerFn);
  },

  removeAllEventListeners(): void {
    this.listeners.forEach((l) => {
      window.removeEventListener(l.type, l.listenerFn);
    });
    this.listeners = [];
  }
};
