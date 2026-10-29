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
    firefox: () => {
      if (this.isSSR) {
        return false;
      }

      return /Firefox/.test(this.internals.userAgent());
    },
    safari: () => {
      if (this.isSSR) {
        return false;
      }

      return !this.internals.chrome && /(Version|PhantomJS)\/(\d+\.\d+).*Safari/.test(this.internals.userAgent());
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
    macOS: () => {
      if (this.isSSR) {
        return false;
      }

      return !!window.navigator.userAgent.match(/Macintosh|Mac OS X/i);
    },
    iOS: () => {
      if (this.isSSR) {
        return false;
      }

      return (
        !!window.navigator.platform.match(/iPhone|iPad|iPod/) ||
        !!(this.internals.userAgent().match(/Mac/) && 'ontouchend' in window.document)
      );
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

  supportsTouch() {
    return this.internals.touch();
  }

  isSafari() {
    return this.internals.safari();
  }

  isChrome() {
    return this.internals.chrome();
  }

  isFirefox() {
    return this.internals.firefox();
  }

  isTablet() {
    this.detectTablet();

    return (this.internals.touch() || this.isWindows8OrAbove()) && this.tablet;
  }

  isPhone() {
    return this.internals._isPhone();
  }

  isDesktop() {
    if (this.isSSR) {
      return false;
    }

    return (!this.isTablet() && !this.isPhone()) || this.isWindows8OrAbove();
  }

  isCombi() {
    return this.isTablet() && this.isDesktop();
  }

  isIOS() {
    return this.internals.iOS();
  }

  isMac() {
    return this.internals.macOS();
  }

  isAndroid() {
    return this.internals.android() || this.internals.androidPhone();
  }
}

export const DeviceHelpers = new DeviceHelpersClass();
