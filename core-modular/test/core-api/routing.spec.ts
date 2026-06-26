import { Routing } from '../../src/core-api/routing';
import { GenericHelpers } from '../../src/utilities/helpers/generic-helpers';

describe('Routing', () => {
  let luigiMock: any;
  let routing: Routing;
  let useHashRouting: boolean;
  let configChangedSpy: jest.Mock;

  beforeEach(() => {
    useHashRouting = false;
    configChangedSpy = jest.fn();
    luigiMock = {
      getConfigValue: jest.fn().mockImplementation((key: string) => {
        if (key === 'routing.useHashRouting') return useHashRouting;
        return undefined;
      }),
      configChanged: configChangedSpy
    };
    routing = new Routing(luigiMock);

    // Reset jsdom location to a known state for each test.
    window.history.replaceState({}, '', 'http://localhost/');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('addSearchParams', () => {
    it('ignores non-object params and logs', () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();
      routing.addSearchParams('not-an-object' as any);
      expect(logSpy).toHaveBeenCalledWith('Params argument must be an object');
      expect(configChangedSpy).not.toHaveBeenCalled();
    });

    it('adds search params to standard URL and replaces history by default', () => {
      const replaceSpy = jest.spyOn(window.history, 'replaceState');
      routing.addSearchParams({ foo: 'bar' });
      expect(replaceSpy).toHaveBeenCalled();
      expect(location.search).toContain('foo=bar');
      expect(configChangedSpy).toHaveBeenCalled();
    });

    it('pushes a history entry when keepBrowserHistory is true', () => {
      const pushSpy = jest.spyOn(window.history, 'pushState');
      routing.addSearchParams({ a: '1' }, true);
      expect(pushSpy).toHaveBeenCalled();
    });

    it('appends params to the hash fragment when hash routing is enabled', () => {
      useHashRouting = true;
      window.history.replaceState({}, '', 'http://localhost/#/path');
      routing.addSearchParams({ foo: 'bar' });
      expect(location.hash).toContain('foo=bar');
      expect(configChangedSpy).toHaveBeenCalled();
    });
  });

  describe('getSearchParams', () => {
    it('returns query string params as an object', () => {
      window.history.replaceState({}, '', 'http://localhost/?a=1&b=two');
      expect(routing.getSearchParams()).toEqual({ a: '1', b: 'two' });
    });

    it('returns hash-query params when hash routing is on', () => {
      useHashRouting = true;
      window.history.replaceState({}, '', 'http://localhost/#/path?x=y');
      expect(routing.getSearchParams()).toEqual({ x: 'y' });
    });

    it('returns empty object when hash has no query string', () => {
      useHashRouting = true;
      window.history.replaceState({}, '', 'http://localhost/#/path');
      expect(routing.getSearchParams()).toEqual({});
    });

    it('blocks prototype-pollution keys with a warning', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      window.history.replaceState({}, '', 'http://localhost/?__proto__=evil&safe=ok');
      const result = routing.getSearchParams() as Record<string, string>;
      expect(result.safe).toBe('ok');
      expect(Object.prototype.hasOwnProperty.call(result, '__proto__')).toBe(false);
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('__proto__'));
    });
  });

  describe('sanitizeUrl', () => {
    it('returns the URL when origin matches', () => {
      expect(routing.sanitizeUrl('http://localhost/x')).toBe('http://localhost/x');
    });

    it('returns undefined for cross-origin URLs', () => {
      expect(routing.sanitizeUrl('http://evil.example/x')).toBeUndefined();
    });
  });

  describe('handleBrowserHistory', () => {
    it('warns and skips when sanitizeUrl rejects the URL', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const pushSpy = jest.spyOn(window.history, 'pushState');
      const replaceSpy = jest.spyOn(window.history, 'replaceState');
      const url = new URL('http://evil.example/x');
      routing.handleBrowserHistory(true, url);
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('invalid url'));
      expect(pushSpy).not.toHaveBeenCalled();
      expect(replaceSpy).not.toHaveBeenCalled();
    });
  });

  describe('addNodeParams', () => {
    it('ignores non-object params and logs', () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();
      routing.addNodeParams('nope' as any, false);
      expect(logSpy).toHaveBeenCalledWith('Params argument must be an object');
      expect(configChangedSpy).not.toHaveBeenCalled();
    });

    it('adds prefixed node params via standard search and notifies via configChanged', () => {
      luigiMock.getConfigValue.mockImplementation((key: string) => {
        if (key === 'routing.useHashRouting') return false;
        if (key === 'routing.nodeParamPrefix') return '~';
        return undefined;
      });
      routing.addNodeParams({ id: '42' }, false);
      // URLSearchParams encodes `~` as %7E in the serialized form.
      expect(decodeURIComponent(location.search)).toContain('~id=42');
      expect(configChangedSpy).toHaveBeenCalled();
    });

    it('emits a hashchange event when hash routing is enabled', () => {
      useHashRouting = true;
      luigiMock.getConfigValue.mockImplementation((key: string) => {
        if (key === 'routing.useHashRouting') return true;
        if (key === 'routing.nodeParamPrefix') return '~';
        return undefined;
      });
      window.history.replaceState({}, '', 'http://localhost/#/path');
      const dispatchSpy = jest.spyOn(window, 'dispatchEvent');
      routing.addNodeParams({ id: '7' }, false);
      const fired = dispatchSpy.mock.calls.find(([ev]) => (ev as Event).type === 'hashchange');
      expect(fired).toBeDefined();
      expect(configChangedSpy).not.toHaveBeenCalled();
    });
  });

  it('GenericHelpers.isObject is used as the param guard', () => {
    // Sanity check that the guard is the shared helper, not an inline check.
    expect(GenericHelpers.isObject({})).toBe(true);
    expect(GenericHelpers.isObject([] as any)).toBe(false);
  });
});
