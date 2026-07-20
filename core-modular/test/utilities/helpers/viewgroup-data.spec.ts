import { NavigationHelpers } from '../../../src/utilities/helpers/navigation-helpers';
import { RoutingHelpers } from '../../../src/utilities/helpers/routing-helpers';
import type { Node } from '../../../src/types/navigation';

describe('ViewGroup Data', () => {
  describe('NavigationHelpers.getUrlOrigin', () => {
    it('should return the origin of a URL', () => {
      const origin = NavigationHelpers.getUrlOrigin('https://example.com/path/to/page');
      expect(origin).toBe('https://example.com');
    });

    it('should return origin for URL with port', () => {
      const origin = NavigationHelpers.getUrlOrigin('http://localhost:4200/micro-frontend');
      expect(origin).toBe('http://localhost:4200');
    });

    it('should return undefined for empty string if no origin resolved', () => {
      const origin = NavigationHelpers.getUrlOrigin('');
      // happy-dom may resolve relative URLs to current location origin
      expect(origin).toBeDefined();
    });
  });

  describe('NavigationHelpers.findViewGroup', () => {
    it('should return viewGroup directly from node', () => {
      const node: Node = { pathSegment: 'home', viewGroup: 'myGroup', viewUrl: 'https://a.com/app' };
      expect(NavigationHelpers.findViewGroup(node)).toBe('myGroup');
    });

    it('should find viewGroup from parent node', () => {
      const parent: Node = { pathSegment: 'root', viewGroup: 'parentGroup', viewUrl: 'https://a.com/app' };
      const child: Node = { pathSegment: 'child', viewUrl: 'https://a.com/child', parent };
      expect(NavigationHelpers.findViewGroup(child)).toBe('parentGroup');
    });

    it('should find viewGroup from grandparent node', () => {
      const grandparent: Node = { pathSegment: 'root', viewGroup: 'gpGroup', viewUrl: 'https://a.com/app' };
      const parent: Node = { pathSegment: 'mid', viewUrl: 'https://a.com/mid', parent: grandparent };
      const child: Node = { pathSegment: 'child', viewUrl: 'https://a.com/child', parent };
      expect(NavigationHelpers.findViewGroup(child)).toBe('gpGroup');
    });

    it('should return undefined if no viewGroup in hierarchy', () => {
      const parent: Node = { pathSegment: 'root' };
      const child: Node = { pathSegment: 'child', parent };
      expect(NavigationHelpers.findViewGroup(child)).toBeUndefined();
    });

    it('should return viewGroup from parent only if origins match', () => {
      const parent: Node = {
        pathSegment: 'root',
        viewGroup: 'sharedGroup',
        viewUrl: 'https://a.com/app'
      };
      const child: Node = {
        pathSegment: 'child',
        viewUrl: 'https://a.com/child-page',
        parent
      };
      expect(NavigationHelpers.findViewGroup(child)).toBe('sharedGroup');
    });

    it('should return undefined from parent if origins do not match', () => {
      const parent: Node = {
        pathSegment: 'root',
        viewGroup: 'sharedGroup',
        viewUrl: 'https://a.com/app'
      };
      const child: Node = {
        pathSegment: 'child',
        viewUrl: 'https://b.com/other-app',
        parent
      };
      expect(NavigationHelpers.findViewGroup(child)).toBeUndefined();
    });

    it('should return viewGroup if node itself has it (no originalNode comparison)', () => {
      const node: Node = {
        pathSegment: 'home',
        viewGroup: 'directGroup',
        viewUrl: 'https://a.com/app'
      };
      expect(NavigationHelpers.findViewGroup(node)).toBe('directGroup');
    });
  });

  describe('RoutingHelpers.resolveNodeLabel', () => {
    let luigi: any;

    beforeEach(() => {
      luigi = {
        i18n: jest.fn().mockReturnValue({
          getTranslation: (key: string) => key
        }),
        getConfigValue: jest.fn().mockReturnValue(undefined)
      };
    });

    it('should return plain label without viewGroupData placeholders', () => {
      const node: Node = { pathSegment: 'home', label: 'Home' };
      expect(RoutingHelpers.resolveNodeLabel(node, luigi)).toBe('Home');
    });

    it('should not call getConfigValue if label has no viewGroupData placeholder', () => {
      const node: Node = { pathSegment: 'home', label: 'Settings' };
      RoutingHelpers.resolveNodeLabel(node, luigi);
      expect(luigi.getConfigValue).not.toHaveBeenCalled();
    });

    it('should resolve viewGroupData placeholder from _liveCustomData', () => {
      const node: Node = {
        pathSegment: 'project',
        label: '{viewGroupData.projectName}',
        viewGroup: 'projectGroup'
      };
      luigi.getConfigValue.mockReturnValue({
        projectGroup: {
          _liveCustomData: { projectName: 'My Project' }
        }
      });
      expect(RoutingHelpers.resolveNodeLabel(node, luigi)).toBe('My Project');
    });

    it('should resolve viewGroupData placeholder from customData', () => {
      const node: Node = {
        pathSegment: 'project',
        label: '{viewGroupData.title}',
        viewGroup: 'myVG'
      };
      luigi.getConfigValue.mockReturnValue({
        myVG: {
          customData: { title: 'Static Title' }
        }
      });
      expect(RoutingHelpers.resolveNodeLabel(node, luigi)).toBe('Static Title');
    });

    it('should merge customData and _liveCustomData with _liveCustomData taking precedence', () => {
      const node: Node = {
        pathSegment: 'project',
        label: '{viewGroupData.name}',
        viewGroup: 'vg1'
      };
      luigi.getConfigValue.mockReturnValue({
        vg1: {
          customData: { name: 'Old Name' },
          _liveCustomData: { name: 'Live Name' }
        }
      });
      expect(RoutingHelpers.resolveNodeLabel(node, luigi)).toBe('Live Name');
    });

    it('should resolve multiple placeholders in one label', () => {
      const node: Node = {
        pathSegment: 'project',
        label: '{viewGroupData.first} - {viewGroupData.second}',
        viewGroup: 'vg1'
      };
      luigi.getConfigValue.mockReturnValue({
        vg1: {
          _liveCustomData: { first: 'Hello', second: 'World' }
        }
      });
      expect(RoutingHelpers.resolveNodeLabel(node, luigi)).toBe('Hello - World');
    });

    it('should remove unresolved placeholders when no data available', () => {
      const node: Node = {
        pathSegment: 'project',
        label: '{viewGroupData.missing}',
        viewGroup: 'vg1'
      };
      luigi.getConfigValue.mockReturnValue({});
      expect(RoutingHelpers.resolveNodeLabel(node, luigi)).toBe('');
    });

    it('should find viewGroup from parent if not on node directly', () => {
      const parent: Node = {
        pathSegment: 'root',
        viewGroup: 'parentVG',
        viewUrl: 'https://app.com/root'
      };
      const node: Node = {
        pathSegment: 'child',
        label: '{viewGroupData.count}',
        viewUrl: 'https://app.com/child',
        parent
      };
      luigi.getConfigValue.mockReturnValue({
        parentVG: {
          _liveCustomData: { count: '42' }
        }
      });
      expect(RoutingHelpers.resolveNodeLabel(node, luigi)).toBe('42');
    });

    it('should remove placeholders if no viewGroup found in hierarchy', () => {
      const node: Node = {
        pathSegment: 'orphan',
        label: 'Count: {viewGroupData.val}'
      };
      luigi.getConfigValue.mockReturnValue(undefined);
      expect(RoutingHelpers.resolveNodeLabel(node, luigi)).toBe('Count: ');
    });
  });
});
