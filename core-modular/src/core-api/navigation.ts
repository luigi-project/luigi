import { ModalService } from '../services/modal.service';
import { NavigationService } from '../services/navigation.service';
import { RoutingService } from '../services/routing.service';
import { serviceRegistry } from '../services/service-registry';
import type {
  ModalSettings,
  NavigationOptions,
  NavigationRequestParams,
  Node,
  RunTimeErrorHandler
} from '../types/navigation';
import { GenericHelpers } from '../utilities/helpers/generic-helpers';
import { RoutingHelpers } from '../utilities/helpers/routing-helpers';
import type { Luigi } from './luigi';

export class Navigation {
  luigi: Luigi;
  hashRouting: boolean = false;
  navService: NavigationService;
  routingService: RoutingService;
  modalService: ModalService;
  options: NavigationOptions = {
    fromContext: null,
    fromClosestContext: false,
    fromVirtualTreeRoot: false,
    fromParent: false
  };

  constructor(luigi: Luigi) {
    this.luigi = luigi;
    this.hashRouting = luigi.getConfig().routing?.useHashRouting;
    this.navService = serviceRegistry.get(NavigationService);
    this.routingService = serviceRegistry.get(RoutingService);
    this.modalService = serviceRegistry.get(ModalService);
  }

  navigate = async (
    path: string,
    preserveView?: string,
    modalSettings?: ModalSettings,
    splitViewSettings?: any,
    drawerSettings?: any
  ) => {
    const navRequestParams: NavigationRequestParams = {
      modalSettings,
      newTab: false,
      options: this.options,
      path,
      preserveView,
      preventContextUpdate: false,
      preventHistoryEntry: false,
      withoutSync: false
    };

    this.navService.handleNavigationRequest(navRequestParams, undefined);
  };

  openAsModal = async (path: string, modalSettings: ModalSettings, onCloseCallback?: () => void) => {
    if (!modalSettings?.keepPrevious) {
      await this.modalService.closeModals();
    }
    const normalizedPath = path.replace(/\/\/+/g, '/');
    const node = await this.navService.getCurrentNode(normalizedPath);
    const settings = modalSettings || {};
    if (!settings.title) {
      settings.title = node?.label;
    }
    // Append modal data to URL only if configured and if no other modals are open
    if (this.luigi.getConfigValue('routing.showModalPathInUrl') && this.modalService.getModalStackLength() === 0) {
      this.routingService.appendModalDataToUrl(normalizedPath, settings);
    }
    this.luigi.getEngine()._ui.openModal(this.luigi, node, settings, onCloseCallback);
  };

  openAsDrawer = async (path: string, modalSettings: ModalSettings, onCloseCallback?: () => void) => {
    const normalizedPath = path.replace(/\/\/+/g, '/');
    const node = await this.navService.getCurrentNode(normalizedPath);
    const settings = modalSettings || {};
    if (!settings.title) {
      settings.title = node?.label;
    }
    this.luigi.getEngine()._ui.openDrawer(this.luigi, node, settings, onCloseCallback);
  };

  runTimeErrorHandler = async (errorObj: object): Promise<void> => {
    const { path } = RoutingHelpers.getCurrentPath(this.luigi.getConfig().routing?.useHashRouting);
    const currentNode: Node | undefined = await this.navService.getCurrentNode(path);
    const defaultRunTimeErrorHandler: RunTimeErrorHandler = this.luigi.getConfigValue(
      'navigation.defaults.runTimeErrorHandler'
    );

    if (
      currentNode?.runTimeErrorHandler?.errorFn &&
      GenericHelpers.isFunction(currentNode?.runTimeErrorHandler?.errorFn)
    ) {
      currentNode.runTimeErrorHandler.errorFn(errorObj, currentNode);
    } else if (defaultRunTimeErrorHandler?.errorFn && GenericHelpers.isFunction(defaultRunTimeErrorHandler.errorFn)) {
      defaultRunTimeErrorHandler.errorFn(errorObj, currentNode);
    }
  };

  /**
   * Checks if the path you can navigate to exists in the main application. For example, you can use this helper method conditionally to display a DOM element like a button.
   * @param {string} path - path which existence you want to check
   * @returns {Promise<boolean>} A promise which resolves to a boolean variable specifying whether the path exists or not
   * @example
   *  let pathExists;
   *  Luigi
   *  .navigation()
   *  .pathExists('projects/pr2')
   *  .then(
   *    (pathExists) => {  }
   *  );
   */
  pathExists = async (path: string): Promise<boolean> => {
    return await RoutingHelpers.pathExists(path, this.luigi);
  };

   /**
   * Sets the current navigation base to the parent node that is defined as virtualTree. This method works only when the currently active micro frontend is inside a virtualTree.
   * @returns {Navigation} navigation instance
   * @example
   * Luigi.navigation().fromVirtualTreeRoot().navigate('/users/groups/stakeholders')
   */
  fromVirtualTreeRoot(): Navigation {
    this.options.fromContext = null;
    this.options.fromClosestContext = false;
    this.options.fromVirtualTreeRoot = true;
    this.options.fromParent = false;
    return this;
  }

  /**
   * Allows navigation from the node which has the navigation context set.
   * @param navigationContext
   * @returns {Navigation} navigation instance
   */
  fromContext(navigationContext: string): Navigation {
    this.options.fromContext = navigationContext;
    return this;
  }

  /**
   * Allows navigation from the closest node which has the navigation context set. If there are multiple nodes with the same navigation context, the closest one will be used as the navigation base.
   * @returns {Navigation} navigation instance
   */
  fromClosestContext(): Navigation {
    this.options.fromContext = null;
    this.options.fromClosestContext = true;
    this.options.fromParent = false;
    return this;
  }
}
