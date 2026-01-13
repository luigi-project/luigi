import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Event, NavigationEnd, RouterModule } from '@angular/router';
import * as Client from '@luigi-project/client';
import { Observable, of } from 'rxjs';
import { LuigiAngularSupportModule } from '../luigi.angular.support.module';
import { LuigiActivatedRouteSnapshotHelper } from '../route/luigi-activated-route-snapshot-helper';
import { LuigiAutoRoutingService } from './luigi-auto-routing.service';
import { LuigiContextService } from './luigi-context.service';

describe('LuigiAutoRoutingService', () => {
  const mockedSnapshot: ActivatedRouteSnapshot = {
    data: { fromVirtualTreeRoot: true } as any
  } as ActivatedRouteSnapshot;
  let service: LuigiAutoRoutingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LuigiContextService, LuigiAutoRoutingService],
      imports: [RouterModule.forRoot([]), LuigiAngularSupportModule]
    });

    service = TestBed.inject(LuigiAutoRoutingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('doFilter', () => {
    it('doFilter should return a function', () => {
      expect(service.doFilter()).toBeInstanceOf(Function);
    });

    it('doFilter should return a function that takes an event keeps it if that event is a NavigationEnd event', () => {
      const event = new NavigationEnd(0, 'url', 'urlAfterRedirects');
      const event$ = of(event);
      const filterResult$ = service.doFilter()(event$);

      filterResult$.subscribe((result) => {
        expect(result).toBeInstanceOf(NavigationEnd);
      });
    });

    it('doFilter should return a function that takes an event and filters it out if it is not a NavigationEnd event', () => {
      const event = new NavigationEnd(0, 'url', 'urlAfterRedirects');
      const notAnEvent = new Object();
      const wrongEvent = new CustomEvent('wrongEvent');
      const events$ = of(notAnEvent, event, wrongEvent) as unknown as Observable<Event>;
      const filterResult$ = service.doFilter()(events$);
      let count = 0;

      filterResult$.subscribe({
        next: (result) => {
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
    it('doSubscription should take a NavigationEnd event and not do anything if the navigation was set to no route with Luigi data', () => {
      const doSubscriptionSpy = spyOn(LuigiAutoRoutingService.prototype, 'doSubscription').and.callThrough();
      const navigateSpy = jasmine.createSpy('navigate');
      const linkManagerSpy = spyOn(Client, 'linkManager').and.returnValue({
        withoutSync: () => navigateSpy
      } as unknown as Client.LinkManager);
      const event = new NavigationEnd(0, 'some-url', 'urlAfterRedirects');

      spyOn(LuigiActivatedRouteSnapshotHelper, 'getCurrent').and.returnValue(mockedSnapshot);
      spyOn(service as any, 'isClientInitialized').and.returnValue(true);
      service.doSubscription(event);

      expect(doSubscriptionSpy).toHaveBeenCalled();
      expect((service as any).isClientInitialized).toHaveBeenCalled();
      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });
});
