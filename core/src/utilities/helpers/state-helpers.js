class StateHelpersClass {
  optimizeScope(scope) {
    let last = '';
    const result = [];
    [...scope].sort().forEach((s) => {
      if (s && !result.includes(s)) {
        if (!last || s.indexOf(last) !== 0) {
          result.push(s);
          last = s;
        }
      }
    });
    return result;
  }

  expandScope(scope) {
    const result = [];
    scope.forEach((s) => {
      let subs = '';
      s.split('.').forEach((spart) => {
        subs = subs + (subs ? '.' : '') + spart;
        result.push(subs);
      });
    });
    return [...new Set(result)];
  }

  doOnStoreChange(store, fn, scope = []) {
    const unSubscribeFn = [store.subscribe(fn)];
    this.expandScope(scope).forEach((s) => {
      unSubscribeFn.push(store.subscribeToScope(fn, s));
    });
    return () => {
      unSubscribeFn.forEach((unSub) => {
        unSub();
      });
    };
  }
}

export const StateHelpers = new StateHelpersClass();
