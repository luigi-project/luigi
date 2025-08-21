import { NavigationHelpers } from '../utilities/helpers/navigation-helpers';
import { RoutingHelpers } from '../utilities/helpers/routing-helpers';
import { NavigationService, type ModalSettings } from '../services/navigation.service';
import { LuigiCompoundContainer, LuigiContainer } from '@luigi-project/container';
import type { Luigi } from '../core-api/luigi';
import { serviceRegistry } from '../services/service-registry';

const createContainer = (node: any, luigi: Luigi): HTMLElement => {
  if (node.compound) {
    const lcc: LuigiCompoundContainer = document.createElement('luigi-compound-container') as LuigiCompoundContainer;
    lcc.viewurl = node.viewUrl;
    lcc.webcomponent = node.webcomponent;
    lcc.compoundConfig = node.compound;
    lcc.context = node.context;
    lcc.nodeParams = node.nodeParams;
    (lcc as any).viewGroup = node.viewGroup;
    luigi.getEngine()._comm.addListeners(lcc, luigi);
    return lcc;
  } else {
    const lc: LuigiContainer = document.createElement('luigi-container') as LuigiContainer;
    lc.viewurl = node.viewUrl;
    lc.webcomponent = node.webcomponent;
    lc.context = node.context;
    lc.nodeParams = node.nodeParams;
    (lc as any).viewGroup = node.viewGroup;
    luigi.getEngine()._comm.addListeners(lc, luigi);
    return lc;
  }
};

export const UIModule = {
  navService: undefined as unknown as NavigationService,
  luigi: undefined as unknown as Luigi,
  init: (luigi: Luigi) => {
    console.log('Init UI...');
    UIModule.navService = serviceRegistry.get(NavigationService);
    UIModule.luigi = luigi;
    luigi.getEngine()._connector?.renderMainLayout();
    UIModule.update();
  },
  update: (scope?: string) => {
    if (scope) {
      // TBD
    } else {
      const pathRaw = NavigationHelpers.normalizePath(location.hash);
      const [path, query] = pathRaw.split('?');
      const urlSearchParams = new URLSearchParams(query);
      const paramsObj: Record<string, string> = {};
      urlSearchParams.forEach((value, key) => {
        paramsObj[key] = value;
      });
      const nodeParams = RoutingHelpers.filterNodeParams(paramsObj, UIModule.luigi);
      const redirect = UIModule.navService.shouldRedirect(path);
      if (redirect) {
        UIModule.luigi.navigation().navigate(redirect);
        return;
      }

      UIModule.luigi.getEngine()._connector?.renderTopNav(UIModule.navService.getTopNavData(path));
      UIModule.luigi.getEngine()._connector?.renderLeftNav(UIModule.navService.getLeftNavData(path));
      UIModule.luigi.getEngine()._connector?.renderTabNav(UIModule.navService.getTabNavData(path));

      const currentNode = UIModule.navService.getCurrentNode(path);
      currentNode.nodeParams = nodeParams || {};
      if (currentNode) {
        UIModule.updateMainContent(currentNode, UIModule.luigi);
      }
    }
  },
  updateMainContent: (currentNode: any, luigi: Luigi) => {
    const containerWrapper = luigi.getEngine()._connector?.getContainerWrapper();
    if (currentNode && containerWrapper) {
      let viewGroupContainer: any;
      containerWrapper.childNodes.forEach((element: any) => {
        if (element.viewGroup) {
          if (currentNode.viewGroup === element.viewGroup) {
            viewGroupContainer = element;
          } else {
            element.style.display = 'none';
          }
        } else {
          element.remove();
        }
      });
      if (viewGroupContainer) {
        viewGroupContainer.style.display = 'block';
        viewGroupContainer.updateViewUrl(currentNode.viewUrl);
        viewGroupContainer.nodeParams = currentNode.nodeParams;
        viewGroupContainer.updateContext(currentNode.context || {});
      } else {
        containerWrapper?.appendChild(createContainer(currentNode, luigi));
      }
    }
  },
  openModal: (luigi: Luigi, node: any, modalSettings: ModalSettings, onCloseCallback?: Function) => {
    const lc = createContainer(node, luigi);
    luigi.getEngine()._connector?.renderModal(lc, modalSettings, onCloseCallback);
  },
  openDrawer: (luigi: Luigi, node: any, modalSettings: ModalSettings, onCloseCallback?: Function) => {
    const lc = createContainer(node, luigi);
    luigi.getEngine()._connector?.renderDrawer(lc, modalSettings, onCloseCallback);
  }
};
