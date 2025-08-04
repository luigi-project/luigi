export const StateHelpers = {
  optimizeScope(scope): any[] {
    let last = '';
    const result: any[] = [];

    [...scope].sort().forEach(scopeItem => {
      if (scopeItem && !result.includes(scopeItem)) {
        if (!last || scopeItem.indexOf(last) !== 0) {
          result.push(scopeItem);
          last = scopeItem;
        }
      }
    });

    return result;
  },

  expandScope(scope): any[] {
    const result: any[] = [];

    scope.forEach(scopeItem => {
      let subs = '';

      scopeItem.split('.').forEach(partialItem => {
        subs = subs + (subs ? '.' : '') + partialItem;
        result.push(subs);
      });
    });

    return [...new Set(result)];
  },

  doOnStoreChange(store, fn, scope = []): void {
    store.subscribe(fn);
    this.expandScope(scope).forEach(scopeItem => {
      store.subscribeToScope(fn, scopeItem);
    });
  }
};
