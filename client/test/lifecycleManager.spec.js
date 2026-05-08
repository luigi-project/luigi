import { lifecycleManager } from '../src/lifecycleManager';
import { helpers } from '../src/helpers';

describe('LifecycleManager', () => {
  let lcManager;

  beforeEach(() => {
    lcManager = Object.create(Object.getPrototypeOf(lifecycleManager));
    lcManager.luigiInitialized = false;
    lcManager.defaultContextKeys = ['context', 'internal', 'nodeParams', 'pathParams', 'searchParams'];
    lcManager.currentContext = {
      context: {},
      internal: {},
      nodeParams: {},
      pathParams: {},
      searchParams: {}
    };
    lcManager._onContextUpdatedFns = {};
    lcManager._onInactiveFns = {};
    lcManager._onInitFns = {};
    lcManager.authData = {};
    lcManager.promises = {};
  });

  describe('isLuigiClientInitialized', () => {
    it('returns false before initialization', () => {
      expect(lcManager.isLuigiClientInitialized()).toBe(false);
    });

    it('returns true after initialization', () => {
      lcManager.luigiInitialized = true;
      expect(lcManager.isLuigiClientInitialized()).toBe(true);
    });
  });

  describe('luigiClientInit', () => {
    it('warns and returns if already initialized', () => {
      lcManager.luigiInitialized = true;
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      lcManager.luigiClientInit();
      expect(warnSpy).toHaveBeenCalledWith('Luigi Client has been already initialized');
      warnSpy.mockRestore();
    });

    it('posts luigi.get-context message to parent', () => {
      const postMessageSpy = jest.spyOn(window.parent, 'postMessage').mockImplementation(() => {});
      lcManager.luigiClientInit();
      expect(postMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({ msg: 'luigi.get-context' }),
        '*'
      );
      postMessageSpy.mockRestore();
    });
  });

  describe('addInitListener', () => {
    it('registers a listener and returns an id', () => {
      const fn = jest.fn();
      const id = lcManager.addInitListener(fn);
      expect(id).toBeDefined();
      expect(lcManager._onInitFns[id]).toBe(fn);
    });

    it('calls listener immediately if already initialized', () => {
      lcManager.luigiInitialized = true;
      lcManager.currentContext = { context: { foo: 'bar' }, internal: {} };
      jest.spyOn(helpers, 'getLuigiCoreDomain').mockReturnValue('http://luigi.test');

      const fn = jest.fn();
      lcManager.addInitListener(fn);
      expect(fn).toHaveBeenCalledWith({ foo: 'bar' }, 'http://luigi.test');
    });

    it('does not call listener if not yet initialized', () => {
      const fn = jest.fn();
      lcManager.addInitListener(fn);
      expect(fn).not.toHaveBeenCalled();
    });

    it('sets disable-tpc-check attribute when disableTpcCheck is true', () => {
      document.head.removeAttribute('disable-tpc-check');
      const fn = jest.fn();
      lcManager.addInitListener(fn, true);
      expect(document.head.hasAttribute('disable-tpc-check')).toBe(true);
      document.head.removeAttribute('disable-tpc-check');
    });
  });

  describe('removeInitListener', () => {
    it('removes a registered listener and returns true', () => {
      const fn = jest.fn();
      const id = lcManager.addInitListener(fn);
      expect(lcManager.removeInitListener(id)).toBe(true);
      expect(lcManager._onInitFns[id]).toBeUndefined();
    });

    it('returns false for non-existent id', () => {
      expect(lcManager.removeInitListener('nonexistent')).toBe(false);
    });
  });

  describe('addContextUpdateListener', () => {
    it('registers a listener and returns an id', () => {
      const fn = jest.fn();
      const id = lcManager.addContextUpdateListener(fn);
      expect(id).toBeDefined();
      expect(lcManager._onContextUpdatedFns[id]).toBe(fn);
    });

    it('calls listener immediately if already initialized', () => {
      lcManager.luigiInitialized = true;
      lcManager.currentContext = { context: { env: 'dev' }, internal: {} };
      const fn = jest.fn();
      lcManager.addContextUpdateListener(fn);
      expect(fn).toHaveBeenCalledWith({ env: 'dev' });
    });

    it('does not call listener if not yet initialized', () => {
      const fn = jest.fn();
      lcManager.addContextUpdateListener(fn);
      expect(fn).not.toHaveBeenCalled();
    });
  });

  describe('removeContextUpdateListener', () => {
    it('removes a registered listener and returns true', () => {
      const fn = jest.fn();
      const id = lcManager.addContextUpdateListener(fn);
      expect(lcManager.removeContextUpdateListener(id)).toBe(true);
      expect(lcManager._onContextUpdatedFns[id]).toBeUndefined();
    });

    it('returns false for non-existent id', () => {
      expect(lcManager.removeContextUpdateListener('nonexistent')).toBe(false);
    });
  });

  describe('addInactiveListener', () => {
    it('registers a listener and returns an id', () => {
      const fn = jest.fn();
      const id = lcManager.addInactiveListener(fn);
      expect(id).toBeDefined();
      expect(lcManager._onInactiveFns[id]).toBe(fn);
    });
  });

  describe('removeInactiveListener', () => {
    it('removes a registered listener and returns true', () => {
      const fn = jest.fn();
      const id = lcManager.addInactiveListener(fn);
      expect(lcManager.removeInactiveListener(id)).toBe(true);
      expect(lcManager._onInactiveFns[id]).toBeUndefined();
    });

    it('returns false for non-existent id', () => {
      expect(lcManager.removeInactiveListener('nonexistent')).toBe(false);
    });
  });

  describe('addCustomMessageListener', () => {
    it('delegates to helpers.addEventListener', () => {
      const spy = jest.spyOn(helpers, 'addEventListener').mockReturnValue('listener-id');
      const fn = jest.fn();
      const result = lcManager.addCustomMessageListener('my.message', fn);
      expect(spy).toHaveBeenCalledWith('my.message', expect.any(Function), true);
      expect(result).toBe('listener-id');
      spy.mockRestore();
    });
  });

  describe('removeCustomMessageListener', () => {
    it('delegates to helpers.removeEventListener', () => {
      const spy = jest.spyOn(helpers, 'removeEventListener').mockReturnValue(true);
      const result = lcManager.removeCustomMessageListener('listener-id');
      expect(spy).toHaveBeenCalledWith('listener-id');
      expect(result).toBe(true);
      spy.mockRestore();
    });
  });

  describe('getToken', () => {
    it('returns the access token from authData', () => {
      lcManager.authData = { accessToken: 'my-token-123' };
      expect(lcManager.getToken()).toBe('my-token-123');
    });

    it('returns undefined when no token is set', () => {
      lcManager.authData = {};
      expect(lcManager.getToken()).toBeUndefined();
    });
  });

  describe('getContext / getEventData', () => {
    it('returns the current context object', () => {
      lcManager.currentContext = { context: { project: 'luigi' }, internal: {} };
      expect(lcManager.getContext()).toEqual({ project: 'luigi' });
    });

    it('getEventData is an alias for getContext', () => {
      lcManager.currentContext = { context: { x: 1 }, internal: {} };
      expect(lcManager.getEventData()).toEqual(lcManager.getContext());
    });
  });

  describe('getActiveFeatureToggles', () => {
    it('returns the feature toggle list', () => {
      lcManager.currentContext = { internal: { activeFeatureToggleList: ['ft1', 'ft2'] }, context: {} };
      expect(lcManager.getActiveFeatureToggles()).toEqual(['ft1', 'ft2']);
    });

    it('returns empty array when no feature toggles are set', () => {
      lcManager.currentContext = { internal: {}, context: {} };
      expect(lcManager.getActiveFeatureToggles()).toEqual([]);
    });
  });

  describe('addNodeParams', () => {
    it('sends post message with params', () => {
      const spy = jest.spyOn(helpers, 'sendPostMessageToLuigiCore').mockImplementation(() => {});
      lcManager.addNodeParams({ sort: 'asc' }, true);
      expect(spy).toHaveBeenCalledWith({
        msg: 'luigi.addNodeParams',
        data: { sort: 'asc' },
        keepBrowserHistory: true
      });
      spy.mockRestore();
    });

    it('does not send message when params is falsy', () => {
      const spy = jest.spyOn(helpers, 'sendPostMessageToLuigiCore').mockImplementation(() => {});
      lcManager.addNodeParams(null);
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it('defaults keepBrowserHistory to true', () => {
      const spy = jest.spyOn(helpers, 'sendPostMessageToLuigiCore').mockImplementation(() => {});
      lcManager.addNodeParams({ page: 2 });
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ keepBrowserHistory: true })
      );
      spy.mockRestore();
    });
  });

  describe('getNodeParams', () => {
    it('returns node params without desanitization by default', () => {
      lcManager.currentContext = { nodeParams: { sort: '&lt;asc' }, internal: {}, context: {} };
      expect(lcManager.getNodeParams()).toEqual({ sort: '&lt;asc' });
    });

    it('returns desanitized node params when shouldDesanitise is true', () => {
      lcManager.currentContext = { nodeParams: { sort: '&lt;asc' }, internal: {}, context: {} };
      expect(lcManager.getNodeParams(true)).toEqual({ sort: '<asc' });
    });
  });

  describe('getPathParams', () => {
    it('returns path parameters from context', () => {
      lcManager.currentContext = { pathParams: { productId: '123' }, internal: {}, context: {} };
      expect(lcManager.getPathParams()).toEqual({ productId: '123' });
    });
  });

  describe('getCoreSearchParams', () => {
    it('returns search params from context', () => {
      lcManager.currentContext = { searchParams: { q: 'luigi' }, internal: {}, context: {} };
      expect(lcManager.getCoreSearchParams()).toEqual({ q: 'luigi' });
    });

    it('returns empty object when no search params', () => {
      lcManager.currentContext = { internal: {}, context: {} };
      expect(lcManager.getCoreSearchParams()).toEqual({});
    });
  });

  describe('addCoreSearchParams', () => {
    it('sends post message with search params', () => {
      const spy = jest.spyOn(helpers, 'sendPostMessageToLuigiCore').mockImplementation(() => {});
      lcManager.addCoreSearchParams({ q: 'test' }, false, true);
      expect(spy).toHaveBeenCalledWith({
        msg: 'luigi.addSearchParams',
        data: { q: 'test' },
        keepBrowserHistory: false,
        preventLuigiConfigUpdate: true
      });
      spy.mockRestore();
    });

    it('does not send message when searchParams is falsy', () => {
      const spy = jest.spyOn(helpers, 'sendPostMessageToLuigiCore').mockImplementation(() => {});
      lcManager.addCoreSearchParams(null);
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it('defaults keepBrowserHistory to true and preventLuigiConfigUpdate to false', () => {
      const spy = jest.spyOn(helpers, 'sendPostMessageToLuigiCore').mockImplementation(() => {});
      lcManager.addCoreSearchParams({ a: '1' });
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ keepBrowserHistory: true, preventLuigiConfigUpdate: false })
      );
      spy.mockRestore();
    });
  });

  describe('getClientPermissions', () => {
    it('returns client permissions from internal context', () => {
      lcManager.currentContext = { internal: { clientPermissions: { changeCurrentLocale: true } }, context: {} };
      expect(lcManager.getClientPermissions()).toEqual({ changeCurrentLocale: true });
    });

    it('returns empty object when no permissions set', () => {
      lcManager.currentContext = { internal: {}, context: {} };
      expect(lcManager.getClientPermissions()).toEqual({});
    });
  });

  describe('setTargetOrigin', () => {
    it('delegates to helpers.setTargetOrigin', () => {
      const spy = jest.spyOn(helpers, 'setTargetOrigin').mockImplementation(() => {});
      lcManager.setTargetOrigin('http://example.com');
      expect(spy).toHaveBeenCalledWith('http://example.com');
      spy.mockRestore();
    });
  });

  describe('sendCustomMessage', () => {
    it('converts and sends custom message to Luigi Core', () => {
      const convertSpy = jest.spyOn(helpers, 'convertCustomMessageUserToInternal').mockReturnValue({
        msg: 'custom',
        data: { id: 'my.msg', value: 42 }
      });
      const sendSpy = jest.spyOn(helpers, 'sendPostMessageToLuigiCore').mockImplementation(() => {});

      lcManager.sendCustomMessage({ id: 'my.msg', value: 42 });

      expect(convertSpy).toHaveBeenCalledWith({ id: 'my.msg', value: 42 });
      expect(sendSpy).toHaveBeenCalledWith({ msg: 'custom', data: { id: 'my.msg', value: 42 } });

      convertSpy.mockRestore();
      sendSpy.mockRestore();
    });
  });

  describe('getUserSettings', () => {
    it('returns user settings from internal context', () => {
      lcManager.currentContext = { internal: { userSettings: { theme: 'dark' } }, context: {} };
      expect(lcManager.getUserSettings()).toEqual({ theme: 'dark' });
    });

    it('returns undefined when no user settings', () => {
      lcManager.currentContext = { internal: {}, context: {} };
      expect(lcManager.getUserSettings()).toBeUndefined();
    });
  });

  describe('getAnchor', () => {
    it('returns anchor from internal context', () => {
      lcManager.currentContext = { internal: { anchor: 'section1' }, context: {} };
      expect(lcManager.getAnchor()).toBe('section1');
    });

    it('returns empty string when no anchor set', () => {
      lcManager.currentContext = { internal: {}, context: {} };
      expect(lcManager.getAnchor()).toBe('');
    });
  });

  describe('setAnchor', () => {
    it('sends anchor message to Luigi Core', () => {
      const spy = jest.spyOn(helpers, 'sendPostMessageToLuigiCore').mockImplementation(() => {});
      lcManager.setAnchor('myAnchor');
      expect(spy).toHaveBeenCalledWith({ msg: 'luigi.setAnchor', anchor: 'myAnchor' });
      spy.mockRestore();
    });
  });

  describe('setViewGroupData', () => {
    it('sends view group data message to Luigi Core', () => {
      const spy = jest.spyOn(helpers, 'sendPostMessageToLuigiCore').mockImplementation(() => {});
      lcManager.setViewGroupData({ vg1: 'Luigi rocks!' });
      expect(spy).toHaveBeenCalledWith({ msg: 'luigi.setVGData', data: { vg1: 'Luigi rocks!' } });
      spy.mockRestore();
    });
  });

  describe('setCurrentContext', () => {
    it('sets the currentContext property', () => {
      lcManager.setCurrentContext({ context: { a: 1 }, internal: {} });
      expect(lcManager.currentContext).toEqual({ context: { a: 1 }, internal: {} });
    });
  });

  describe('_notifyInit', () => {
    it('calls all registered init listeners with context and origin', () => {
      const fn1 = jest.fn();
      const fn2 = jest.fn();
      lcManager._onInitFns = { a: fn1, b: fn2 };
      lcManager.currentContext = { context: { data: 'test' }, internal: {} };
      lcManager._notifyInit('http://origin.test');
      expect(fn1).toHaveBeenCalledWith({ data: 'test' }, 'http://origin.test');
      expect(fn2).toHaveBeenCalledWith({ data: 'test' }, 'http://origin.test');
    });
  });

  describe('_notifyUpdate', () => {
    it('calls all registered context update listeners', () => {
      const fn = jest.fn();
      lcManager._onContextUpdatedFns = { x: fn };
      lcManager.currentContext = { context: { updated: true }, internal: {} };
      lcManager._notifyUpdate();
      expect(fn).toHaveBeenCalledWith({ updated: true }, undefined);
    });
  });

  describe('_notifyInactive', () => {
    it('calls all registered inactive listeners', () => {
      const fn = jest.fn();
      lcManager._onInactiveFns = { z: fn };
      lcManager._notifyInactive();
      expect(fn).toHaveBeenCalled();
    });
  });

  describe('_callAllFns', () => {
    it('calls all functions in the given object with payload and origin', () => {
      const fn1 = jest.fn();
      const fn2 = jest.fn();
      lcManager._callAllFns({ a: fn1, b: fn2 }, 'payload', 'origin');
      expect(fn1).toHaveBeenCalledWith('payload', 'origin');
      expect(fn2).toHaveBeenCalledWith('payload', 'origin');
    });

    it('skips non-function properties', () => {
      const fn = jest.fn();
      lcManager._callAllFns({ a: fn, b: 'not a function' }, 'payload');
      expect(fn).toHaveBeenCalledWith('payload', undefined);
    });
  });

  describe('_isDeferInitDefined', () => {
    it('returns true when defer-luigi-init attribute is present', () => {
      document.head.setAttribute('defer-luigi-init', '');
      expect(lcManager._isDeferInitDefined()).toBe(true);
      document.head.removeAttribute('defer-luigi-init');
    });

    it('returns false when attribute is not present', () => {
      document.head.removeAttribute('defer-luigi-init');
      expect(lcManager._isDeferInitDefined()).toBe(false);
    });
  });

  describe('_isTpcCheckDisabled', () => {
    it('returns true when disable-tpc-check attribute is on head', () => {
      document.head.setAttribute('disable-tpc-check', '');
      expect(lcManager._isTpcCheckDisabled()).toBe(true);
      document.head.removeAttribute('disable-tpc-check');
    });

    it('returns true when internal context has thirdPartyCookieCheck disabled', () => {
      document.head.removeAttribute('disable-tpc-check');
      lcManager.currentContext = { internal: { thirdPartyCookieCheck: { disabled: true } }, context: {} };
      expect(lcManager._isTpcCheckDisabled()).toBe(true);
    });

    it('returns falsy when neither condition is met', () => {
      document.head.removeAttribute('disable-tpc-check');
      lcManager.currentContext = { internal: {}, context: {} };
      expect(lcManager._isTpcCheckDisabled()).toBeFalsy();
    });
  });

  describe('_tpcCheck', () => {
    it('does nothing when tpc check is disabled', () => {
      document.head.setAttribute('disable-tpc-check', '');
      const postMessageSpy = jest.spyOn(window.parent, 'postMessage').mockImplementation(() => {});
      lcManager._tpcCheck();
      expect(postMessageSpy).not.toHaveBeenCalled();
      document.head.removeAttribute('disable-tpc-check');
      postMessageSpy.mockRestore();
    });

    it('sends tpc enabled message when cookies can be set', () => {
      document.head.removeAttribute('disable-tpc-check');
      lcManager.currentContext = { internal: {}, context: {} };
      const postMessageSpy = jest.spyOn(window.parent, 'postMessage').mockImplementation(() => {});

      lcManager._tpcCheck();

      expect(postMessageSpy).toHaveBeenCalledWith(
        { msg: 'luigi.third-party-cookie', tpc: 'enabled' },
        '*'
      );

      postMessageSpy.mockRestore();
    });
  });
});
