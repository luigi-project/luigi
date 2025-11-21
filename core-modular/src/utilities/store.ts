class LuigiStore {
  $value: any;
  $subscribers: Set<(value: any) => void> = new Set();

  constructor(initialValue: any) {
    this.$value = initialValue;
  }

  set(value: any): void {
    this.$value = value;
    this.$subscribers.forEach((subscriber) => {
      subscriber(value);
    });
  }

  update(fn: (val: any) => any): void {
    this.set(fn(this.$value));
  }

  subscribe(subscriber: (value: any) => void): () => void {
    this.$subscribers.add(subscriber);
    subscriber(this.$value);
    return () => {
      this.$subscribers.delete(subscriber);
    };
  }
}

function get(store: LuigiStore) {
  return store.$value;
}

function writable(value: any): LuigiStore {
  return new LuigiStore(value);
}

export { get, writable, LuigiStore };
