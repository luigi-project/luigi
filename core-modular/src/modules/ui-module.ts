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
  navService: undefined,
  init: (luigi: Luigi) => {
    console.log('Init UI...');
    luigi.getEngine()._connector?.renderMainLayout();
    const navService = serviceRegistry.get(NavigationService);
    const pathRaw = NavigationHelpers.normalizePath(location.hash);
    const [path, query] = pathRaw.split('?');
    const urlSearchParams = new URLSearchParams(query);
    const paramsObj: Record<string, string> = {};
    urlSearchParams.forEach((value, key) => {
      paramsObj[key] = value;
    });
    const nodeParams = RoutingHelpers.filterNodeParams(paramsObj, luigi);
    const redirect = navService.shouldRedirect(path);
    if (redirect) {
      luigi.navigation().navigate(redirect);
      return;
    }

    luigi.getEngine()._connector?.renderTopNav(navService.getTopNavData(path));
    luigi.getEngine()._connector?.renderLeftNav(navService.getLeftNavData(path));
    luigi.getEngine()._connector?.renderTabNav(navService.getTabNavData(path));

    const currentNode = navService.getCurrentNode(path);
    currentNode.nodeParams = nodeParams || {};
    if (currentNode) {
      UIModule.updateMainContent(currentNode, luigi);
    }
  },
  updateMainContent: async (currentNode: any, luigi: Luigi) => {
    const containerWrapper = luigi.getEngine()._connector?.getContainerWrapper();

    if (currentNode && containerWrapper) {
      let viewGroupContainer: any;

      if (currentNode?.loadingIndicator?.enabled) {
        luigi.ux().showLoadingIndicator();
      }

      [...containerWrapper.childNodes].forEach((element: any) => {
        if (element.tagName?.indexOf('LUIGI-') === 0) {
          if (element.viewGroup) {
            if (currentNode.viewGroup === element.viewGroup) {
              viewGroupContainer = element;
            } else {
              element.style.display = 'none';
            }
          } else {
            element.remove();
          }
        }
      });

      if (viewGroupContainer) {
        viewGroupContainer.style.display = 'block';
        viewGroupContainer.viewurl = currentNode.viewUrl;
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
