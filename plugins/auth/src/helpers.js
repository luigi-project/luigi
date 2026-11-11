/** @private */
class HelpersClass {
  constructor() {}

  /**
   * Creates a random Id
   * @private
   */
  getRandomId() {
    return window.crypto.getRandomValues(new Uint32Array(1))[0];
  }

  isFunction(anyParam) {
    return anyParam && {}.toString.call(anyParam) === '[object Function]';
  }

  isPromise(anyParam) {
    return anyParam && this.isFunction(anyParam.then);
  }

  /**
   * Simple object check.
   * @param item mixed
   * @returns {boolean}
   */
  isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  /**
   * Deep merge two objects.
   * @param target
   * @param ...sources
   */
  deepMerge(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (this.isObject(target) && this.isObject(source)) {
      for (const key in source) {
        if (this.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          this.deepMerge(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }

    return this.deepMerge(target, ...sources);
  }

  /**
   * Prepend current url to redirect_uri, if it is a relative path
   * @param {path} string full url, relative or absolute path
   */
  prependOrigin(path) {
    // Only treat http(s) URLs as absolute — a bare `startsWith('http')` check
    // would also accept schemes like `httpevil://` and pass them through
    // unchanged as a "full URL".
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    const hasLeadingSlash = path.startsWith('/');
    if (path.length) {
      return window.location.origin + (hasLeadingSlash ? '' : '/') + path;
    }
    return window.location.origin;
  }
}

export const Helpers = new HelpersClass();
