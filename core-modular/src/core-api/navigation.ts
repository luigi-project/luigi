import type { ModalSettings } from '../services/navigation.service';
import { NavigationService } from '../services/navigation.service';
import { NodeDataManagementService } from '../services/node-data-management.service';
import { RoutingService } from '../services/routing.service';
import { serviceRegistry } from '../services/service-registry';
import { AsyncHelpers } from '../utilities/helpers/async-helpers';
import type { Luigi } from './luigi';

export class Navigation {
  luigi: Luigi;
  hashRouting: boolean = false;
  navService: NavigationService;
  nodeDataManagementService: NodeDataManagementService;
  routingService: RoutingService;

  constructor(luigi: Luigi) {
    this.luigi = luigi;
    this.hashRouting = luigi.getConfig().routing?.useHashRouting;
    this.navService = serviceRegistry.get(NavigationService);
    this.nodeDataManagementService = serviceRegistry.get(NodeDataManagementService);
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

  getChildren = async (node: any, context: any[] | undefined): any[] => {
    if (!node) {
      return [];
    }

    let children = [];

    if (!this.nodeDataManagementService.hasChildren(node)) {
      try {
        children = await AsyncHelpers.getConfigValueFromObjectAsync(node, 'children', context || node.context);

        if (children === undefined || children === null) {
          children = [];
        }

        children =
          children
            .map((child: any) => this.navService.getExpandStructuralPathSegment(child))
            .map((child: any) => this.navService.bindChildToParent(child, node)) || [];
      } catch (err) {
        console.error('Could not lazy-load children for node', err);
      }
    } else {
      const data = this.nodeDataManagementService.getChildren(node);

      if (data) children = data.children;
    }

    const filteredChildren = this.navService.getAccessibleNodes(node, children, context);

    this.nodeDataManagementService.setChildren(node, { children, filteredChildren });

    return filteredChildren;
  };

  getFilteredChildren = async (node: any): any[] => {
    return this.nodeDataManagementService.hasChildren(node)
      ? this.getChildrenFromCache(node)
      : await this.getChildren(node, undefined);
  };

  getChildrenFromCache = (node: any): any[] => {
    const data = this.nodeDataManagementService.getChildren(node);

    return data ? data.filteredChildren : [];
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
