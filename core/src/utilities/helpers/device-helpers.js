class DeviceHelpersClass {
  isSSR;
  tablet;
  windowsVersion;
  webkitVersion;
  internals = {
    userAgent: () => {
      if (this.isSSR) {
        return '';
      }

      return window.navigator.userAgent;
    },
    touch: () => {
      if (this.isSSR) {
        return false;
      }

      return 'ontouchstart' in window || window.navigator.maxTouchPoints > 0;
    },
    chrome: () => {
      if (this.isSSR) {
        return false;
      }

      return /(Chrome|CriOS)/.test(this.internals.userAgent());
    },
    webkit: () => {
      if (this.isSSR) {
        return false;
      }

      return /webkit/.test(this.internals.userAgent());
    },
    windows: () => {
      if (this.isSSR) {
        return false;
      }

      return window.navigator.platform.indexOf('Win') !== -1;
    },
    android: () => {
      if (this.isSSR) {
        return false;
      }

      return !this.internals.windows() && /Android/.test(this.internals.userAgent());
    },
    androidPhone: () => {
      if (this.isSSR) {
        return false;
      }

      return this.internals.android() && /(?=android)(?=.*mobile)/i.test(this.internals.userAgent());
    },
    ipad: () => {
      if (this.isSSR) {
        return false;
      }

      return (
        /ipad/i.test(this.internals.userAgent()) ||
        (/Macintosh/i.test(this.internals.userAgent()) && 'ontouchend' in window.document)
      );
    },
    _isPhone: () => {
      this.detectTablet();

      return this.internals.touch() && !this.tablet;
    }
  };

  constructor() {
    this.isSSR = typeof window.document === 'undefined';
  }

  isWindows8OrAbove() {
    if (this.isSSR) {
      return false;
    }

    if (!this.internals.windows()) {
      return false;
    }

    if (this.windowsVersion === undefined) {
      const matches = this.internals.userAgent().match(/Windows NT (\d+).(\d)/);

      this.windowsVersion = matches ? parseFloat(matches[1]) : 0;
    }

    return this.windowsVersion >= 8;
  }

  isWebkit537OrAbove() {
    if (this.isSSR) {
      return false;
    }

    if (!this.internals.webkit()) {
      return false;
    }

    if (this.webkitVersion === undefined) {
      const matches = this.internals.userAgent().match(/(webkit)[ /]([\w.]+)/);

      this.webkitVersion = matches ? parseFloat(matches[1]) : 0;
    }

    return this.webkitVersion >= 537.1;
  }

  detectTablet() {
    if (this.isSSR) {
      return false;
    }

    if (this.tablet !== undefined) {
      return;
    }

    if (this.internals.ipad()) {
      this.tablet = true;
      return;
    }

    if (this.internals.touch()) {
      if (this.isWindows8OrAbove()) {
        this.tablet = true;
        return;
      }

      if (this.internals.chrome() && this.internals.android()) {
        this.tablet = !/Mobile Safari\/[.0-9]+/.test(this.internals.userAgent());
        return;
      }

      let densityFactor = window.devicePixelRatio ? window.devicePixelRatio : 1;

      if (this.internals.android() && this.isWebkit537OrAbove()) {
        densityFactor = 1;
      }

      this.tablet = Math.min(window.screen.width / densityFactor, window.screen.height / densityFactor) >= 600;
      return;
    }

    this.tablet =
      this.internals.userAgent().indexOf('Touch') !== -1 ||
      (this.internals.android() && !this.internals.androidPhone());
  }

  isPhone() {
    return this.internals._isPhone();
  }
}

export const DeviceHelpers = new DeviceHelpersClass();
