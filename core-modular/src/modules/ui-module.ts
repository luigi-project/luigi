import Events, { LuigiCompoundContainer, LuigiContainer } from '@luigi-project/container';
import type { Luigi } from '../core-api/luigi';
import { NavigationService } from '../services/navigation.service';
import { PreloadingService } from '../services/preloading.service';
import { RoutingService } from '../services/routing.service';
import { serviceRegistry } from '../services/service-registry';
import { ViewUrlDecoratorSvc } from '../services/viewurl-decorator';
import { RoutingHelpers } from '../utilities/helpers/routing-helpers';
import { ModalService, type ModalPromiseObject } from '../services/modal.service';
import { NodeDataManagementService } from '../services/node-data-management.service';
import type { DrawerSettings, ModalSettings, Node } from '../types/navigation';
import { NavigationHelpers } from '../utilities/helpers/navigation-helpers';
import type { LuigiParams } from '../types/routing';
import { GenericHelpers } from '../utilities/helpers/generic-helpers';
import { AuthHelpers } from '../utilities/helpers/auth-helpers';

const createContainer = async (node: Node, luigi: Luigi, luigiParams?: LuigiParams): Promise<HTMLElement> => {
  const userSettingGroups = await luigi.readUserSettings();
  const hasUserSettings = node.userSettingsGroup && typeof userSettingGroups === 'object' && userSettingGroups !== null;
  const userSettings = hasUserSettings && node.userSettingsGroup ? userSettingGroups[node.userSettingsGroup] : null;
  const nodeParams = luigiParams?.nodeParams || {};
  const pathParams = luigiParams?.pathParams || {};
  const searchParams = luigiParams?.searchParams || {};

  if (node.webcomponent && node.viewUrl && !RoutingHelpers.checkWCUrl(node.viewUrl, luigi)) {
    console.warn(`View URL '${node.viewUrl}' not allowed to be included`);
    return document.createElement('div');
  }

  if (node.compound) {
    const lcc: LuigiCompoundContainer = document.createElement('luigi-compound-container') as LuigiCompoundContainer;

    lcc.setAttribute('lui_container', 'true');
    lcc.viewurl = node.viewUrl
      ? serviceRegistry
          .get(ViewUrlDecoratorSvc)
          .applyDecorators(
            RoutingHelpers.substituteViewUrl(node, pathParams, nodeParams, luigi),
            node.decodeViewUrl ?? false
          )
      : '';
    lcc.webcomponent = node.webcomponent ?? false;
    lcc.compoundConfig = node.compound;
    (lcc as any).context = node.context;
    lcc.clientPermissions = node.clientPermissions ?? {};
    lcc.nodeParams = nodeParams;
    lcc.pathParams = pathParams;
    (lcc as any).userSettingsGroup = node.userSettingsGroup;
    lcc.userSettings = userSettings;
    lcc.searchParams = searchParams;
    lcc.activeFeatureToggleList = luigi.featureToggles().getActiveFeatureToggleList();
    lcc.locale = luigi.i18n().getCurrentLocale();
    lcc.theme = luigi.theming().getCurrentTheme();
    (lcc as any).viewGroup = node.viewGroup;
    (lcc as any).virtualTree = node.virtualTree || node._virtualTree;
    (lcc as any).virtualTreeRootNode = NavigationHelpers.findVirtualTreeRootNode(node);
    luigi.getEngine()._comm.addListeners(lcc, luigi);
    return lcc;
  } else {
    const lc: LuigiContainer = document.createElement('luigi-container') as LuigiContainer;

    lc.setAttribute('lui_container', 'true');
    lc.viewurl = node.viewUrl
      ? serviceRegistry
          .get(ViewUrlDecoratorSvc)
          .applyDecorators(
            RoutingHelpers.substituteViewUrl(node, pathParams, nodeParams, luigi),
            node.decodeViewUrl ?? false
          )
      : '';
    lc.webcomponent = node.webcomponent ?? false;
    (lc as any).context = node.context;
    lc.authData = AuthHelpers.getStoredAuthData();
    lc.clientPermissions = node.clientPermissions ?? {};
    (lc as any).cssVariables = await luigi.theming().getCSSVariables();
    lc.nodeParams = nodeParams;
    lc.pathParams = pathParams;
    (lc as any).userSettingsGroup = node.userSettingsGroup;
    lc.userSettings = userSettings;
    lc.searchParams = searchParams;
    lc.activeFeatureToggleList = luigi.featureToggles().getActiveFeatureToggleList();
    lc.locale = luigi.i18n().getCurrentLocale();
    lc.theme = luigi.theming().getCurrentTheme();
    (lc as any).viewGroup = node.viewGroup;
    (lc as any).virtualTree = node.virtualTree || node._virtualTree;
    (lc as any).virtualTreeRootNode = NavigationHelpers.findVirtualTreeRootNode(node);
    setSandboxRules(lc, luigi);
    setAllowRules(lc, luigi);
    luigi.getEngine()._comm.addListeners(lc, luigi);
    (lc as any).luigiMfId = GenericHelpers.getRandomId();
    return lc;
  }
};

const setSandboxRules = (container: LuigiContainer, luigi: Luigi): void => {
  const customSandboxRules: string[] = luigi.getConfigValue('settings.customSandboxRules');

  if (!customSandboxRules?.length) {
    return;
  }

  const luigiDefaultSandboxRules: string[] = [
    'allow-forms', // Allows the resource to submit forms. If this keyword is not used, form submission is blocked.
    'allow-modals', // Lets the resource open modal windows.
    // 'allow-orientation-lock', // Lets the resource lock the screen orientation.
    // 'allow-pointer-lock', // Lets the resource use the Pointer Lock API.
    'allow-popups', // Allows popups (such as window.open(), _blank as target attribute, or showModalDialog()). If this keyword is not used, the popup will silently fail to open.
    'allow-popups-to-escape-sandbox', // Lets the sandboxed document open new windows without those windows inheriting the sandboxing. For example, this can safely sandbox an advertisement without forcing the same restrictions upon the page the ad links to.
    // 'allow-presentation', // Lets the resource start a presentation session.
    'allow-same-origin', // If this token is not used, the resource is treated as being from a special origin that always fails the same-origin policy.
    'allow-scripts' // Lets the resource run scripts (but not create popup windows).
    // 'allow-storage-access-by-user-activation', // Lets the resource request access to the parent's storage capabilities with the Storage Access API.
    // 'allow-top-navigation', // Lets the resource navigate the top-level browsing context (the one named _top).
    // 'allow-top-navigation-by-user-activation', // Lets the resource navigate the top-level browsing context, but only if initiated by a user gesture.
    // 'allow-downloads-without-user-activation' // Allows for downloads to occur without a gesture from the user.
  ];
  const activeSandboxRules: string[] = customSandboxRules
    ? [...new Set([...luigiDefaultSandboxRules, ...customSandboxRules])]
    : luigiDefaultSandboxRules;

  container.sandboxRules = activeSandboxRules;
};

const setAllowRules = (container: LuigiContainer, luigi: Luigi): void => {
  const allowRules: string[] = luigi.getConfigValue('settings.allowRules');

  if (!allowRules?.length) {
    return;
  }

  allowRules.forEach((rule: string, index: number) => {
    allowRules[index] = rule + (rule.indexOf(';') != -1 ? '' : ';');
  });

  container.allowRules = allowRules;
};

export const UIModule = {
  navService: undefined as unknown as NavigationService,
  routingService: undefined as unknown as RoutingService,
  luigi: undefined as unknown as Luigi,
  modalContainer: [] as any,
  drawerContainer: undefined as any,
  init: (luigi: Luigi) => {
    UIModule.navService = serviceRegistry.get(NavigationService);
    UIModule.routingService = serviceRegistry.get(RoutingService);
    UIModule.luigi = luigi;
    luigi.getEngine()._connector?.renderMainLayout();
    const preloadingService = serviceRegistry.get(PreloadingService);
    preloadingService.shouldPreload = true;
    preloadingService.preload(true);
    preloadingService.shouldPreload = false;
  },
  update: async (scopes?: string[]) => {
    const croute = UIModule.routingService.getCurrentRoute();
    if (!croute) {
      return;
    }
    const noScopes = !scopes || scopes.length === 0;

    /*
      Available scopes:

        navigation
        navigation.nodes
        navigation.profile
        navigation.contextSwitcher
        navigation.viewgroupdata
        navigation.productSwitcher
        settings
        settings.theming
        settings.footer
        settings.header
    */

    if (
      noScopes ||
      scopes.includes('settings.header') ||
      scopes.includes('settings') ||
      scopes.includes('navigation') ||
      scopes.includes('navigation.profile') ||
      scopes.includes('navigation.contextSwitcher') ||
      scopes.includes('navigation.productSwitcher')
    ) {
      UIModule.luigi.getEngine()._connector?.renderTopNav(await UIModule.navService.getTopNavData(croute.path));
    }
    if (
      noScopes ||
      scopes.includes('navigation') ||
      scopes.includes('navigation.nodes') ||
      scopes.includes('navigation.viewgroupdata') ||
      scopes.includes('settings') ||
      scopes.includes('settings.footer')
    ) {
      serviceRegistry.get(NodeDataManagementService).deleteCache();
      UIModule.luigi.getEngine()._connector?.renderLeftNav(await UIModule.navService.getLeftNavData(croute.path));
      UIModule.luigi.getEngine()._connector?.renderTabNav(await UIModule.navService.getTabNavData(croute.path));
      const uiConnector = UIModule.luigi.getEngine()._connector;
      uiConnector?.renderBreadcrumbs(
        await UIModule.navService.getBreadcrumbData(croute.path, undefined, (resolved) => {
          uiConnector?.renderBreadcrumbs(resolved);
        })
      );
    }
    if (
      noScopes ||
      scopes.includes('navigation') ||
      scopes.includes('navigation.nodes') ||
      scopes.includes('navigation.viewgroupdata') ||
      scopes.includes('settings.theming')
    ) {
      serviceRegistry.get(NodeDataManagementService).deleteCache();
      if (croute.node) {
        UIModule.updateMainContent(croute.node, UIModule.luigi);
      }
    }
  },
  updateMainContent: async (
    currentNode: Node,
    luigi: Luigi,
    luigiParams?: LuigiParams,
    withoutSync?: boolean,
    preventContextUpdate?: boolean
  ) => {
    const userSettingGroups = await luigi.readUserSettings();
    const hasUserSettings =
      currentNode.userSettingsGroup && typeof userSettingGroups === 'object' && userSettingGroups !== null;
    const userSettings =
      hasUserSettings && currentNode.userSettingsGroup ? userSettingGroups[currentNode.userSettingsGroup] : null;
    const containerWrapper = luigi.getEngine()._connector?.getContainerWrapper();
    luigi.getEngine()._connector?.hideLoadingIndicator(containerWrapper);
    const nodeParams = luigiParams?.nodeParams || {};
    const pathParams = luigiParams?.pathParams || {};
    const searchParams = luigiParams?.searchParams || {};

    if (currentNode && containerWrapper) {
      let viewGroupContainer: any;
      let currentVirtualTreeRootNode: any;

      if (currentNode.virtualTree || currentNode._virtualTree) {
        currentVirtualTreeRootNode = NavigationHelpers.findVirtualTreeRootNode(currentNode);
      }

      [...containerWrapper.childNodes].forEach((element: any) => {
        if (element.tagName?.indexOf('LUIGI-') !== 0) return;

        if (element.viewGroup && currentNode.viewGroup !== element.viewGroup) {
          element.style.display = 'none';
          const vgSettings = luigi.getConfigValue('navigation.viewGroupSettings')?.[element.viewGroup];
          if (vgSettings?.preloadUrl) {
            element.viewurl = vgSettings.preloadUrl;
            element.context = {};
            element.nodeParams = {};
            element.pathParams = {};
          }
        } else {
          if (
            element.viewGroup ||
            (element.virtualTree && currentVirtualTreeRootNode === element.virtualTreeRootNode)
          ) {
            viewGroupContainer = element;
          } else {
            element.remove();
          }
        }
      });

      if (viewGroupContainer && viewGroupContainer._luigiPreloading) {
        viewGroupContainer._luigiPreloading = false;
        serviceRegistry.get(PreloadingService).viewGroupLoaded(viewGroupContainer);
      }

      if (viewGroupContainer) {
        if (!withoutSync) {
          viewGroupContainer.style.display = 'block';
          viewGroupContainer.viewurl = currentNode.viewUrl
            ? serviceRegistry
                .get(ViewUrlDecoratorSvc)
                .applyDecorators(
                  RoutingHelpers.substituteViewUrl(currentNode, pathParams, nodeParams, luigi),
                  currentNode.decodeViewUrl ?? false
                )
            : '';
          viewGroupContainer.nodeParams = nodeParams;
          viewGroupContainer.pathParams = pathParams;
          viewGroupContainer.clientPermissions = currentNode.clientPermissions;
          viewGroupContainer.searchParams = searchParams;
          viewGroupContainer.locale = luigi.i18n().getCurrentLocale();
          viewGroupContainer.theme = luigi.theming().getCurrentTheme();
          viewGroupContainer.activeFeatureToggleList = luigi.featureToggles().getActiveFeatureToggleList();
          viewGroupContainer.userSettingsGroup = currentNode.userSettingsGroup;
          viewGroupContainer.userSettings = userSettings;

          setSandboxRules(viewGroupContainer, luigi);
          setAllowRules(viewGroupContainer, luigi);
        }

        if (!preventContextUpdate) {
          //IMPORTANT!!! This needs to be at the end
          viewGroupContainer.updateContext(currentNode.context || {});
        }
      } else {
        const container = await createContainer(currentNode, luigi, luigiParams);
        containerWrapper?.appendChild(container);
        const connector = luigi.getEngine()._connector;
        if (currentNode.loadingIndicator?.enabled !== false) {
          connector?.showLoadingIndicator(containerWrapper);
        }
      }
    }
  },
  openModal: async (luigi: Luigi, node: Node, modalSettings: ModalSettings, onCloseCallback?: () => void) => {
    const lc = await createContainer(node, luigi);
    UIModule.modalContainer.push(lc);
    const routingService = serviceRegistry.get(RoutingService);
    const modalService = serviceRegistry.get(ModalService);

    let resolved = false;
    let resolveFn: (() => void) | undefined;
    let onCloseRequestHandler: (() => void) | undefined;

    const onCloseRequest = () => {
      return new Promise<void>((resolve) => {
        resolveFn = () => {
          if (resolved) return;
          resolved = true;
          resolve();
          modalService.removeLastModalFromStack();
        };

        onCloseRequestHandler = () => {
          resolveFn && resolveFn();
          if (luigi.getConfigValue('routing.showModalPathInUrl') && modalService.getModalStackLength() === 0) {
            routingService.removeModalDataFromUrl(true);
          }
        };

        lc.addEventListener(Events.CLOSE_CURRENT_MODAL_REQUEST, onCloseRequestHandler);
      });
    };

    const closePromise = onCloseRequest();

    const modalPromiseObj: ModalPromiseObject = {
      closePromise,
      resolveFn,
      onCloseRequestHandler,
      onInternalClose: () => {
        try {
          modalPromiseObj.resolveFn && modalPromiseObj.resolveFn();
        } catch (e) {
          console.warn('onInternalClose failed', e);
        }
      },
      modalsettings: modalSettings
    };

    modalService.registerModal(modalPromiseObj);

    luigi.getEngine()._connector?.renderModal(
      lc,
      modalSettings,
      () => {
        onCloseCallback?.();
        modalService.removeLastModalFromStack();
        if (luigi.getConfigValue('routing.showModalPathInUrl') && modalService.getModalStackLength() === 0) {
          routingService.removeModalDataFromUrl(true);
        }
      },
      () => closePromise
    );

    const connector = luigi.getEngine()._connector;
    if (node.loadingIndicator?.enabled !== false) {
      connector?.showLoadingIndicator(lc.parentElement as HTMLElement);
    }
  },
  updateModalSettings: (modalSettings: ModalSettings, addHistoryEntry: boolean, luigi: Luigi) => {
    const modalService = serviceRegistry.get(ModalService);
    if (modalService.getModalStackLength() === 0) {
      return;
    }
    modalService.updateFirstModalSettings(modalSettings);
    const routingService = serviceRegistry.get(RoutingService);

    const modalPath = RoutingHelpers.getModalPathFromPath(luigi);
    if (modalPath) {
      routingService.updateModalDataInUrl(modalPath, modalService.getModalSettings(), addHistoryEntry);
    }
    luigi.getEngine()._connector?.updateModalSettings(modalService.getModalSettings());
  },
  openDrawer: async (luigi: Luigi, node: Node, drawerSettings: DrawerSettings, onCloseCallback?: () => void) => {
    const lc = await createContainer(node, luigi);
    UIModule.drawerContainer = lc;
    luigi.getEngine()._connector?.renderDrawer(lc, drawerSettings, onCloseCallback);
    const connector = luigi.getEngine()._connector;
    if (node.loadingIndicator?.enabled !== false) {
      connector?.showLoadingIndicator(lc.parentElement as HTMLElement);
    }
  }
};
