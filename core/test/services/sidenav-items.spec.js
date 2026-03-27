import { LuigiConfig } from '../../src/core-api';
import { Routing } from '../../src/services/routing';
import { NavigationHelpers } from '../../src/utilities/helpers';

describe('SideNav Footer Items', () => {
  afterEach(() => {
    LuigiConfig.config = {};
    jest.restoreAllMocks();
  });

  describe('config access', () => {
    it('should return sideNav items from config', () => {
      LuigiConfig.config = {
        settings: {
          sideNav: {
            style: 'vega',
            items: [
              { label: 'Legal', icon: 'sys-help', link: '/legal' },
              { label: 'Docs', icon: 'world', externalLink: { url: 'https://example.com' } }
            ]
          }
        }
      };

      const items = LuigiConfig.getConfigValue('settings.sideNav.items');
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBe(2);
      expect(items[0].label).toBe('Legal');
      expect(items[0].icon).toBe('sys-help');
      expect(items[0].link).toBe('/legal');
      expect(items[1].label).toBe('Docs');
      expect(items[1].externalLink).toEqual({ url: 'https://example.com' });
    });

    it('should return undefined when sideNav items not configured', () => {
      LuigiConfig.config = {
        settings: {
          sideNav: {
            style: 'vega'
          }
        }
      };

      const items = LuigiConfig.getConfigValue('settings.sideNav.items');
      expect(items).toBeUndefined();
    });

    it('should return items with children', () => {
      LuigiConfig.config = {
        settings: {
          sideNav: {
            style: 'vega',
            items: [
              {
                label: 'Resources',
                icon: 'folder',
                children: [
                  { label: 'Documentation', link: '/docs' },
                  { label: 'GitHub', externalLink: { url: 'https://github.com' } }
                ]
              }
            ]
          }
        }
      };

      const items = LuigiConfig.getConfigValue('settings.sideNav.items');
      expect(items.length).toBe(1);
      expect(items[0].label).toBe('Resources');
      expect(Array.isArray(items[0].children)).toBe(true);
      expect(items[0].children.length).toBe(2);
      expect(items[0].children[0].label).toBe('Documentation');
      expect(items[0].children[0].link).toBe('/docs');
      expect(items[0].children[1].label).toBe('GitHub');
      expect(items[0].children[1].externalLink).toEqual({ url: 'https://github.com' });
    });
  });

  describe('navigation via Routing.navigateToLink', () => {
    let navigateToSpy;
    let navigateToExternalLinkSpy;

    beforeEach(() => {
      navigateToSpy = jest.spyOn(Routing, 'navigateTo').mockImplementation(() => {});
      navigateToExternalLinkSpy = jest.spyOn(Routing, 'navigateToExternalLink').mockImplementation(() => {});
    });

    it('should navigate to internal link', () => {
      const item = { label: 'Legal', link: '/legal' };
      Routing.navigateToLink(item);

      expect(navigateToSpy).toHaveBeenCalledTimes(1);
      expect(navigateToSpy).toHaveBeenCalledWith('/legal');
      expect(navigateToExternalLinkSpy).not.toHaveBeenCalled();
    });

    it('should navigate to external link', () => {
      const item = { label: 'Docs', externalLink: { url: 'https://example.com', sameWindow: false } };
      Routing.navigateToLink(item);

      expect(navigateToExternalLinkSpy).toHaveBeenCalledTimes(1);
      expect(navigateToExternalLinkSpy).toHaveBeenCalledWith({ url: 'https://example.com', sameWindow: false });
      expect(navigateToSpy).not.toHaveBeenCalled();
    });

    it('should navigate to external link for child items', () => {
      const child = { label: 'GitHub', externalLink: { url: 'https://github.com' } };
      Routing.navigateToLink(child);

      expect(navigateToExternalLinkSpy).toHaveBeenCalledTimes(1);
      expect(navigateToExternalLinkSpy).toHaveBeenCalledWith({ url: 'https://github.com' });
    });

    it('should navigate to internal link for child items', () => {
      const child = { label: 'Documentation', link: '/docs' };
      Routing.navigateToLink(child);

      expect(navigateToSpy).toHaveBeenCalledTimes(1);
      expect(navigateToSpy).toHaveBeenCalledWith('/docs');
    });
  });

  describe('prepareForTests helper', () => {
    it('should generate test id with footer prefix', () => {
      const testId = NavigationHelpers.prepareForTests('Legal Information', 'footer');
      expect(typeof testId).toBe('string');
      expect(testId).toContain('legal');
    });
  });
});
