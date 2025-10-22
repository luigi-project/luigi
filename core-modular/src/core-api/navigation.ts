import type { Luigi } from './luigi';
import { NavigationService } from '../services/navigation.service';
import type { ModalSettings } from '../services/navigation.service';
import { serviceRegistry } from '../services/service-registry';
import { RoutingService } from '../services/routing.service';

export class Navigation {
  luigi: Luigi;
  hashRouting: boolean = false;
  navService: NavigationService;
  routingService: RoutingService;

  constructor(luigi: Luigi) {
    this.luigi = luigi;
    this.hashRouting = luigi.getConfig().routing?.useHashRouting;
    this.navService = serviceRegistry.get(NavigationService);
    this.routingService = serviceRegistry.get(RoutingService);
  }

  navigate = (path: string, preserveView?: string, modalSettings?: ModalSettings) => {
    const normalizedPath = path.replace(/\/\/+/g, '/');

    if (this.hashRouting) {
      if (modalSettings) {
        this.openAsModal(path, modalSettings);
      } else {
        location.hash = normalizedPath;
      }
    } else {
      console.log('path routing not yet implemented');
    }
  };

  openAsModal = (path: string, modalSettings: ModalSettings, onCloseCallback?: Function) => {
    const normalizedPath = path.replace(/\/\/+/g, '/');
    const node = this.navService.getCurrentNode(normalizedPath);
    const settings = modalSettings || {};
    if (!settings.title) {
      settings.title = node.label;
    }
    if (this.luigi.getConfigValue('routing.showModalPathInUrl')) {
      this.routingService.appendModalDataToUrl(normalizedPath, settings);
    }
    this.luigi.getEngine()._ui.openModal(this.luigi, node, settings, onCloseCallback);
  };

  openAsDrawer = (path: string, modalSettings: ModalSettings, onCloseCallback?: Function) => {
    const normalizedPath = path.replace(/\/\/+/g, '/');
    const node = this.navService.getCurrentNode(normalizedPath);
    const settings = modalSettings || {};
    if (!settings.title) {
      settings.title = node.label;
    }
    this.luigi.getEngine()._ui.openDrawer(this.luigi, node, settings, onCloseCallback);
  };
}
