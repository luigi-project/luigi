import { makeEnvironmentProviders } from '@angular/core';
import { LuigiContextService } from './service/luigi-context.service';
import { LuigiContextServiceImpl } from './service/luigi-context.service.impl';
import { RouteReuseStrategy } from '@angular/router';
import { LuigiRouteStrategy } from './route/luigi-route-strategy';
import { LuigiAutoRoutingService } from './service/luigi-auto-routing.service';

export function provideLuigiAngular() {
  return makeEnvironmentProviders([
    {
      provide: LuigiContextService,
      useClass: LuigiContextServiceImpl
    },
    {
      provide: RouteReuseStrategy,
      useClass: LuigiRouteStrategy
    },
    LuigiAutoRoutingService
  ]);
}
