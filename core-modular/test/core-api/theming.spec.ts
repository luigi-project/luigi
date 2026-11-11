import { Theming } from '../../src/core-api/theming';
import { serviceRegistry } from '../../src/services/service-registry';
import { ViewUrlDecoratorSvc } from '../../src/services/viewurl-decorator';

describe('Theming', () => {
  let luigiMock: any;
  let theming: Theming;

  beforeEach(() => {
    luigiMock = {
      getConfigValue: jest.fn(),
      getConfigValueAsync: jest.fn(),
      __cssVars: undefined as any
    };
    theming = new Theming(luigiMock);

    // Reset window.Luigi cache used by getCSSVariables for each test.
    (window as any).Luigi = { __cssVars: undefined };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete (window as any).__luigiThemeVars;
  });

  describe('getAvailableThemes', () => {
    it('reads themes from config async', async () => {
      const themes = [{ id: 'light' }, { id: 'dark' }];
      luigiMock.getConfigValueAsync.mockResolvedValue(themes);
      await expect(theming.getAvailableThemes()).resolves.toBe(themes);
      expect(luigiMock.getConfigValueAsync).toHaveBeenCalledWith('settings.theming.themes');
    });
  });

  describe('setCurrentTheme / getCurrentTheme', () => {
    it('returns false when theming is not configured', () => {
      luigiMock.getConfigValue.mockReturnValue(undefined);
      expect(theming.getCurrentTheme()).toBe(false);
    });

    it('returns the explicitly set theme', () => {
      luigiMock.getConfigValue.mockReturnValue({ defaultTheme: 'light' });
      theming.setCurrentTheme('dark');
      expect(theming.getCurrentTheme()).toBe('dark');
    });

    it('falls back to defaultTheme when none set', () => {
      luigiMock.getConfigValue.mockReturnValue({ defaultTheme: 'light' });
      expect(theming.getCurrentTheme()).toBe('light');
    });

    it('logs an error when neither current nor defaultTheme is set', () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      luigiMock.getConfigValue.mockReturnValue({});
      expect(theming.getCurrentTheme()).toBeUndefined();
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('[Theming]'), {});
    });

    it('setCurrentTheme clears the cached CSS variables on luigi', () => {
      luigiMock.__cssVars = { foo: '1' };
      theming.setCurrentTheme('dark');
      expect(luigiMock.__cssVars).toBeUndefined();
    });
  });

  describe('getThemeObject', () => {
    it('returns the matching theme object', async () => {
      luigiMock.getConfigValueAsync.mockResolvedValue([{ id: 'light' }, { id: 'dark' }]);
      await expect(theming.getThemeObject('dark')).resolves.toEqual({ id: 'dark' });
    });

    it('returns undefined when no theme matches', async () => {
      luigiMock.getConfigValueAsync.mockResolvedValue([{ id: 'light' }]);
      await expect(theming.getThemeObject('nope')).resolves.toBeUndefined();
    });

    it('returns undefined when themes is null/undefined', async () => {
      luigiMock.getConfigValueAsync.mockResolvedValue(undefined);
      await expect(theming.getThemeObject('any')).resolves.toBeUndefined();
    });
  });

  describe('getCSSVariables', () => {
    it('returns cached __cssVars without re-reading', async () => {
      (window as any).Luigi.__cssVars = { primary: '#123' };
      const result = await theming.getCSSVariables();
      expect(result).toEqual({ primary: '#123' });
      expect(luigiMock.getConfigValue).not.toHaveBeenCalled();
    });

    it('fetches the variables file and overrides with live CSS values when available', async () => {
      luigiMock.getConfigValue.mockImplementation((key: string) => {
        if (key === 'settings.theming.variables.file') return '/theme.json';
        return undefined;
      });
      const fetchSpy = jest.spyOn(global as any, 'fetch').mockResolvedValue({
        json: () => Promise.resolve({ root: { color: '#000', accent: '#fff' } })
      } as any);
      // Stub computed styles so one key is overridden by a live value, the other isn't.
      jest.spyOn(window, 'getComputedStyle').mockReturnValue({
        getPropertyValue: (name: string) => (name === '--accent' ? '#abc' : '')
      } as any);

      const result = await theming.getCSSVariables();
      expect(fetchSpy).toHaveBeenCalledWith('/theme.json');
      expect(result).toEqual({ color: '#000', accent: '#abc' });
    });

    it('routes fetch errors to a user-supplied errorHandling function', async () => {
      const errorHandler = jest.fn();
      luigiMock.getConfigValue.mockImplementation((key: string) => {
        if (key === 'settings.theming.variables.file') return '/theme.json';
        if (key === 'settings.theming.variables.errorHandling') return errorHandler;
        return undefined;
      });
      const err = new Error('boom');
      jest.spyOn(global as any, 'fetch').mockRejectedValue(err);

      const result = await theming.getCSSVariables();
      expect(errorHandler).toHaveBeenCalledWith(err);
      // On error the cache is left unset; the function resolves to whatever
      // `window.Luigi.__cssVars` is at that point (initialized to undefined here).
      expect(result).toBeUndefined();
    });

    it('falls back to console.error when no errorHandling is configured', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      luigiMock.getConfigValue.mockImplementation((key: string) => {
        if (key === 'settings.theming.variables.file') return '/theme.json';
        return undefined;
      });
      jest.spyOn(global as any, 'fetch').mockRejectedValue(new Error('nope'));

      const result = await theming.getCSSVariables();
      expect(errorSpy).toHaveBeenCalledWith('CSS variables file error: ', expect.any(Error));
      expect(result).toBeUndefined();
    });

    it('reads from __luigiThemeVars when settings.theming.variables === "fiori"', async () => {
      (window as any).__luigiThemeVars = ['primary', 'secondary'];
      luigiMock.getConfigValue.mockImplementation((key: string) => {
        if (key === 'settings.theming.variables.file') return undefined;
        if (key === 'settings.theming.variables') return 'fiori';
        return undefined;
      });
      jest.spyOn(window, 'getComputedStyle').mockReturnValue({
        getPropertyValue: (name: string) => (name === '--primary' ? '#111' : '#222')
      } as any);

      const result = await theming.getCSSVariables();
      expect(result).toEqual({ primary: '#111', secondary: '#222' });
    });

    it('returns empty object when neither file nor fiori vars are configured', async () => {
      luigiMock.getConfigValue.mockReturnValue(undefined);
      await expect(theming.getCSSVariables()).resolves.toEqual({});
    });
  });
});
