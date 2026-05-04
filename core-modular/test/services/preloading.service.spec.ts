import { PreloadingService } from '../../src/services/preloading.service';

describe('PreloadingService', () => {
  let preloadingService: PreloadingService;
  let mockLuigi: any;
  let containerWrapper: HTMLElement;

  beforeEach(() => {
    containerWrapper = document.createElement('div');

    mockLuigi = {
      getConfigValue: jest.fn(),
      getEngine: () => ({
        _connector: {
          getContainerWrapper: () => containerWrapper
        },
        _comm: {
          addListeners: jest.fn()
        }
      })
    };

    preloadingService = new PreloadingService(mockLuigi);
  });

  describe('preloadViewGroups', () => {
    it('should not preload if preloadViewGroups config is false', () => {
      mockLuigi.getConfigValue.mockImplementation((key: string) => {
        if (key === 'navigation.preloadViewGroups') return false;
        return undefined;
      });

      preloadingService.preloadViewGroups();
      expect(containerWrapper.children.length).toBe(0);
    });

    it('should not preload if no viewGroupSettings are defined', () => {
      mockLuigi.getConfigValue.mockImplementation((key: string) => {
        if (key === 'navigation.preloadViewGroups') return true;
        if (key === 'navigation.viewGroupSettings') return undefined;
        return undefined;
      });

      preloadingService.preloadViewGroups();
      expect(containerWrapper.children.length).toBe(0);
    });

    it('should preload view groups with preloadUrl', () => {
      mockLuigi.getConfigValue.mockImplementation((key: string) => {
        if (key === 'navigation.preloadViewGroups') return true;
        if (key === 'navigation.viewGroupSettings') {
          return {
            vg1: { preloadUrl: 'http://localhost/preload1' },
            vg2: { preloadUrl: 'http://localhost/preload2' },
            vg3: {}
          };
        }
        return undefined;
      });

      preloadingService.preloadViewGroups(3);

      const children = [...containerWrapper.children] as any[];
      expect(children.length).toBe(2);
      expect(children[0].viewurl).toBe('http://localhost/preload1');
      expect(children[0].viewGroup).toBe('vg1');
      expect(children[0].style.display).toBe('none');
      expect(children[0]._luigiPreloading).toBe(true);
      expect(children[1].viewurl).toBe('http://localhost/preload2');
      expect(children[1].viewGroup).toBe('vg2');
    });

    it('should respect batchSize limit', () => {
      mockLuigi.getConfigValue.mockImplementation((key: string) => {
        if (key === 'navigation.preloadViewGroups') return true;
        if (key === 'navigation.viewGroupSettings') {
          return {
            vg1: { preloadUrl: 'http://localhost/preload1' },
            vg2: { preloadUrl: 'http://localhost/preload2' },
            vg3: { preloadUrl: 'http://localhost/preload3' }
          };
        }
        return undefined;
      });

      preloadingService.preloadViewGroups(2);

      expect(containerWrapper.children.length).toBe(2);
    });

    it('should skip already existing view groups', () => {
      const existingContainer = document.createElement('luigi-container') as any;
      existingContainer.viewGroup = 'vg1';
      containerWrapper.appendChild(existingContainer);

      mockLuigi.getConfigValue.mockImplementation((key: string) => {
        if (key === 'navigation.preloadViewGroups') return true;
        if (key === 'navigation.viewGroupSettings') {
          return {
            vg1: { preloadUrl: 'http://localhost/preload1' },
            vg2: { preloadUrl: 'http://localhost/preload2' }
          };
        }
        return undefined;
      });

      preloadingService.preloadViewGroups(3);

      const newChildren = [...containerWrapper.children].filter((el: any) => el._luigiPreloading) as any[];
      expect(newChildren.length).toBe(1);
      expect(newChildren[0].viewGroup).toBe('vg2');
    });

    it('should skip preloading when containers are still loading', () => {
      const preloadingContainer = document.createElement('luigi-container') as any;
      preloadingContainer.viewGroup = 'vgLoading';
      preloadingContainer._luigiPreloading = true;
      preloadingContainer._luigiPreloadCreatedAt = Date.now();
      containerWrapper.appendChild(preloadingContainer);

      mockLuigi.getConfigValue.mockImplementation((key: string) => {
        if (key === 'navigation.preloadViewGroups') return true;
        if (key === 'navigation.viewGroupSettings') {
          return {
            vg1: { preloadUrl: 'http://localhost/preload1' }
          };
        }
        return undefined;
      });

      preloadingService.preloadViewGroups(3);

      const newChildren = [...containerWrapper.children].filter(
        (el: any) => el.viewGroup === 'vg1'
      );
      expect(newChildren.length).toBe(0);
    });

    it('should only preload loadOnStartup containers when backgroundMfeOnly is true', () => {
      mockLuigi.getConfigValue.mockImplementation((key: string) => {
        if (key === 'navigation.preloadViewGroups') return true;
        if (key === 'navigation.viewGroupSettings') {
          return {
            vg1: { preloadUrl: 'http://localhost/preload1', loadOnStartup: true },
            vg2: { preloadUrl: 'http://localhost/preload2' }
          };
        }
        return undefined;
      });

      preloadingService.preloadViewGroups(3, true);

      const children = [...containerWrapper.children] as any[];
      expect(children.length).toBe(1);
      expect(children[0].viewGroup).toBe('vg1');
    });
  });

  describe('preload', () => {
    it('should not preload on first call (shouldPreload is false initially)', () => {
      jest.useFakeTimers();
      mockLuigi.getConfigValue.mockImplementation((key: string) => {
        if (key === 'navigation.preloadViewGroups') return true;
        if (key === 'navigation.viewGroupSettings') {
          return { vg1: { preloadUrl: 'http://localhost/preload1' } };
        }
        return undefined;
      });

      preloadingService.preload();
      jest.runAllTimers();

      expect(containerWrapper.children.length).toBe(0);
      jest.useRealTimers();
    });

    it('should preload on second call', () => {
      jest.useFakeTimers();
      mockLuigi.getConfigValue.mockImplementation((key: string) => {
        if (key === 'navigation.preloadViewGroups') return true;
        if (key === 'navigation.viewGroupSettings') {
          return { vg1: { preloadUrl: 'http://localhost/preload1' } };
        }
        return undefined;
      });

      preloadingService.preload();
      preloadingService.preload();
      jest.runAllTimers();

      expect(containerWrapper.children.length).toBe(1);
      jest.useRealTimers();
    });
  });

  describe('viewGroupLoaded', () => {
    it('should adjust batch size to 3 for fast loads (< 500ms)', () => {
      jest.useFakeTimers();
      const container = { _luigiPreloading: true, _luigiPreloadCreatedAt: Date.now() - 200 } as any;

      preloadingService.viewGroupLoaded(container);
      jest.runAllTimers();

      expect(container._luigiPreloading).toBe(false);
      jest.useRealTimers();
    });

    it('should adjust batch size to 2 for medium loads (500-1000ms)', () => {
      jest.useFakeTimers();
      const container = { _luigiPreloading: true, _luigiPreloadCreatedAt: Date.now() - 700 } as any;

      preloadingService.viewGroupLoaded(container);
      jest.runAllTimers();

      expect(container._luigiPreloading).toBe(false);
      jest.useRealTimers();
    });

    it('should not do anything for non-preloading containers', () => {
      const container = { _luigiPreloading: false } as any;

      preloadingService.viewGroupLoaded(container);

      expect(container._luigiPreloading).toBe(false);
    });
  });
});
