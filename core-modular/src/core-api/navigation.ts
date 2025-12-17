import { ModalService } from '../services/modal.service';
import type { ModalSettings } from '../services/navigation.service';
import { NavigationService } from '../services/navigation.service';
import { RoutingService } from '../services/routing.service';
import { serviceRegistry } from '../services/service-registry';
import type { Luigi } from './luigi';

export class Navigation {
  luigi: Luigi;
  hashRouting: boolean = false;
  navService: NavigationService;
  routingService: RoutingService;
  modalService: ModalService;

  constructor(luigi: Luigi) {
    this.luigi = luigi;
    this.hashRouting = luigi.getConfig().routing?.useHashRouting;
    this.navService = serviceRegistry.get(NavigationService);
    this.routingService = serviceRegistry.get(RoutingService);
    this.modalService = serviceRegistry.get(ModalService);
  }

  navigate = (path: string, preserveView?: string, modalSettings?: ModalSettings) => {
    const normalizedPath = path.replace(/\/\/+/g, '/');
    const preventContextUpdate = false; //TODO just added for popState eventDetails
    const navSync = true; //TODO just added for popState eventDetails

    if (modalSettings) {
      this.openAsModal(path, modalSettings);
    } else {
      this.modalService.closeModals();
      if (this.hashRouting) {
        location.hash = normalizedPath;
      } else {
        window.history.pushState({ path: normalizedPath }, '', normalizedPath);
        const eventDetail = {
          detail: {
            preventContextUpdate,
            withoutSync: !navSync
          }
        };
        const event = new CustomEvent('popstate', eventDetail);

        window.dispatchEvent(event);
      }
    }
  };

  openAsModal = async (path: string, modalSettings: ModalSettings, onCloseCallback?: () => void) => {
    if (!modalSettings.keepPrevious) {
      await this.modalService.closeModals();
    }
    const normalizedPath = path.replace(/\/\/+/g, '/');
    const node = this.navService.getCurrentNode(normalizedPath);
    const settings = modalSettings || {};
    if (!settings.title) {
      settings.title = node.label;
    }
    // Append modal data to URL only if configured and if no other modals are open
    if (this.luigi.getConfigValue('routing.showModalPathInUrl') && this.modalService.getModalStackLength() === 0) {
      this.routingService.appendModalDataToUrl(normalizedPath, settings);
    }
    this.luigi.getEngine()._ui.openModal(this.luigi, node, settings, onCloseCallback);
  };

  openAsDrawer = (path: string, modalSettings: ModalSettings, onCloseCallback?: () => void) => {
    const normalizedPath = path.replace(/\/\/+/g, '/');
    const node = this.navService.getCurrentNode(normalizedPath);
    const settings = modalSettings || {};
    if (!settings.title) {
      settings.title = node.label;
    }
    this.luigi.getEngine()._ui.openDrawer(this.luigi, node, settings, onCloseCallback);
  };
}
