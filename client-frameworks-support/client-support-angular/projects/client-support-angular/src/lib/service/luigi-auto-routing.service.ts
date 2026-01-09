import { Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, Event, NavigationEnd, ParamMap, Router, convertToParamMap } from '@angular/router';
import { linkManager, uxManager, isLuigiClientInitialized } from '@luigi-project/client';
import { OperatorFunction } from 'rxjs';
import { filter } from 'rxjs/operators';
import { LuigiActivatedRouteSnapshotHelper } from '../route/luigi-activated-route-snapshot-helper';
import { LuigiContextService } from './luigi-context.service';

@Injectable({
  providedIn: 'root'
})
export class LuigiAutoRoutingService {
  constructor(
    private router: Router,
    private luigiContextService: LuigiContextService
  ) {
    this.router.events
      .pipe(this.doFilter(), takeUntilDestroyed())
      .subscribe((event: NavigationEnd) => this.doSubscription(event));
  }

  doFilter(): OperatorFunction<Event, NavigationEnd> {
    return filter(
      (event: Event): event is NavigationEnd =>
        !!(event instanceof NavigationEnd && event?.url?.length && !history?.state?.luigiInduced)
    );
  }

  /**
   * This method will be take in consideration angular route that having in data object the paramter
   * fromVirtualTreeRoot: true, here an example:
   * {path: 'demo', component: DemoComponent, data:{fromVirtualTreeRoot: true}}
   * Another option is to specify the LuigiPath: if you add in route data luigiRoute:'/xxxx/xxx';
   * in the case we will update the path in LuigiCore navigation, here an example
   * {path: 'demo', component: DemoComponent, data:{luigiRoute: '/home/demo''}}
   * If updateModalPathParam is specified, than modalPathParam will be updated upon internal navigation:
   * {path: 'demo', component: DemoComponent, data:{updateModalPathParam: true}}
   * @param event the NavigationEnd event
   */
  doSubscription(event: NavigationEnd): void {
    let current: ActivatedRouteSnapshot | null = LuigiActivatedRouteSnapshotHelper.getCurrent();

    if (!current) {
      current = this.router.routerState.root.snapshot;

      while (current?.children?.length) {
        // handle multiple children
        let primary: ActivatedRouteSnapshot | null = null;

        current.children.forEach((childSnapshot: ActivatedRouteSnapshot) => {
          if (childSnapshot?.outlet === 'primary') {
            primary = childSnapshot;
          }
        });

        if (primary) {
          current = primary;
        } else if (current.firstChild) {
          current = current.firstChild;
        } else {
          break;
        }
      }
    }

    if (current?.data && this.isClientInitialized()) {
      const ux = uxManager();
      let lm = linkManager().withoutSync();
      let route: string | undefined;

      if (current.data.luigiRoute) {
        route = this.getResolvedLuigiRoute(current);

        if (current.data.fromContext) {
          if (!this.luigiContextService.getContext()) {
            console.debug('Ignoring auto navigation request, luigi context not set');
            return;
          }

          if (current.data.fromContext === true) {
            lm = lm.fromClosestContext();
          } else {
            lm = lm.fromContext(current.data.fromContext);
          }
        }
      } else if (current.data.fromVirtualTreeRoot) {
        let url = event.url;
        const truncate = current.data.fromVirtualTreeRoot.truncate;

        if (truncate) {
          if (truncate.indexOf('*') === 0) {
            const index = url.indexOf(truncate.substring(1));

            url = url.substring(index + truncate.length - 1);
          } else if (url.indexOf(truncate) === 0) {
            url = url.substring(truncate.length);
          }
        }

        route = url;
        console.debug('Calling fromVirtualTreeRoot for url ==> ' + route);
        lm = lm.fromVirtualTreeRoot();
      }

      if (ux.isModal()) {
        if (current.data.updateModalDataPath) {
          lm.updateModalPathInternalNavigation(route as string, {}, current.data.addHistoryEntry);
        }
      } else if (route) {
        lm.navigate(route);
      }
    }
  }

  getResolvedLuigiRoute(current: ActivatedRouteSnapshot): string | undefined {
    let route: string | undefined = current.data.luigiRoute;
    const allParams = this.getAllParamsFromParents(current);

    if (!route || !allParams) {
      return route;
    }

    const pmap: ParamMap = convertToParamMap(allParams);

    pmap.keys.forEach((key: string) => {
      pmap.getAll(key).forEach((param: string) => {
        route = route?.replace(':' + key, param);
      });
    });

    return route;
  }

  getAllParamsFromParents(current: ActivatedRouteSnapshot): { [key: string]: string } | undefined {
    let allParams: { [key: string]: string } = {};
    let currentToCheck: ActivatedRouteSnapshot | null = current;

    while (currentToCheck) {
      if (currentToCheck.params) {
        allParams = { ...allParams, ...currentToCheck.params };
      }

      currentToCheck = currentToCheck.parent;
    }

    return allParams;
  }

  private isClientInitialized(): boolean {
    return isLuigiClientInitialized();
  }
}
