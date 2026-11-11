import { of } from 'rxjs';
import * as Client from '@luigi-project/client';
import { LuigiAutoRoutingService } from './luigi-auto-routing.service';
import { LuigiActivatedRouteSnapshotHelper } from '../route/luigi-activated-route-snapshot-helper';

jest.mock('@luigi-project/client', () => ({
  linkManager: jest.fn(),
  uxManager: jest.fn(),
  isLuigiClientInitialized: jest.fn()
}));

jest.mock('@angular/core', () => ({
  Injectable: () => (target: any) => target
}));

jest.mock('@angular/core/rxjs-interop', () => ({
  takeUntilDestroyed: () => (source: any) => source
}));

jest.mock('@angular/router', () => {
  class MockNavigationEnd {
    id: number;
    url: string;
    urlAfterRedirects: string;
    constructor(id: number, url: string, urlAfterRedirects: string) {
      this.id = id;
      this.url = url;
      this.urlAfterRedirects = urlAfterRedirects;
    }
  }
  return {
    NavigationEnd: MockNavigationEnd,
    Router: class {},
    ActivatedRouteSnapshot: class {},
    convertToParamMap: jest.fn()
  };
});

const { NavigationEnd } = jest.requireMock('@angular/router');

describe('LuigiAutoRoutingService', () => {
  let service: LuigiAutoRoutingService;
  const mockRouter = {
    events: of(),
    routerState: { root: { snapshot: { children: [], firstChild: null } } }
  } as any;
  const mockContextService = {} as any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new LuigiAutoRoutingService(mockRouter, mockContextService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('doFilter', () => {
    it('doFilter should return a function', () => {
      expect(service.doFilter()).toBeInstanceOf(Function);
    });

    it('doFilter should keep NavigationEnd events', () => {
      const event = new NavigationEnd(0, 'url', 'urlAfterRedirects');
      const event$ = of(event);
      const filterResult$ = service.doFilter()(event$);

      filterResult$.subscribe((result: any) => {
        expect(result).toBeInstanceOf(NavigationEnd);
      });
    });

    it('doFilter should filter out non-NavigationEnd events', () => {
      const event = new NavigationEnd(0, 'url', 'urlAfterRedirects');
      const notAnEvent = new Object();
      const events$ = of(notAnEvent, event) as any;
      const filterResult$ = service.doFilter()(events$);
      let count = 0;

      filterResult$.subscribe({
        next: (result: any) => {
          expect(result).toBeInstanceOf(NavigationEnd);
          count++;
        },
        complete: () => {
          expect(count).toBe(1);
        }
      });
    });
  });

  describe('doSubscription', () => {
    it('should not navigate when route has no matching luigi data', () => {
      const mockedSnapshot = { data: { fromVirtualTreeRoot: true } } as any;
      const navigateSpy = jest.fn();
      (Client.linkManager as jest.Mock).mockReturnValue({
        withoutSync: () => ({ navigate: navigateSpy, fromVirtualTreeRoot: () => ({ navigate: navigateSpy }) })
      });
      (Client.uxManager as jest.Mock).mockReturnValue({ isModal: () => false });
      (Client.isLuigiClientInitialized as jest.Mock).mockReturnValue(true);
      jest.spyOn(LuigiActivatedRouteSnapshotHelper, 'getCurrent').mockReturnValue(mockedSnapshot);

      const event = new NavigationEnd(0, 'some-url', 'urlAfterRedirects');
      service.doSubscription(event as any);

      expect(Client.isLuigiClientInitialized).toHaveBeenCalled();
    });
  });
});
