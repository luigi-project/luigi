import { mount } from 'svelte';
import App from './App.svelte';
import { CommunicationModule } from './modules/communicaton-module';
import { RoutingModule } from './modules/routing-module';
import { UIModule } from './modules/ui-module';
import { UXModule } from './modules/ux-module';
import { DirtyStatusService } from './services/dirty-status.service';
import { serviceRegistry } from './services/service-registry';
import { NavigationService } from './services/navigation.service';
import { RoutingService } from './services/routing.service';
import type { LuigiConnector } from './types/connector';

export class LuigiEngine {
  config: any;

  _connector: LuigiConnector | undefined;
  _app: any;
  _ui = UIModule;
  _comm = CommunicationModule;
  _ux = UXModule;
  _routing = RoutingModule;

  bootstrap(connector: LuigiConnector): void {
    this._app = mount(App, {
      target: document.body
    });
    this._connector = connector;
  }

  init(): void {
    const luigi = (window as any).Luigi;
    serviceRegistry.register(DirtyStatusService, () => new DirtyStatusService());
    serviceRegistry.register(NavigationService, () => new NavigationService(luigi));
    serviceRegistry.register(RoutingService, () => new RoutingService(luigi));
    UIModule.init(luigi);
    RoutingModule.init(luigi);
    CommunicationModule.init(luigi);
    UXModule.init(luigi);
  }
}
