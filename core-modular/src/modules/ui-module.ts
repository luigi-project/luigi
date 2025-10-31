import { LuigiCompoundContainer, LuigiContainer } from '@luigi-project/container';
import type { Luigi } from '../core-api/luigi';
import { NavigationService, type ModalSettings } from '../services/navigation.service';
import { RoutingService } from '../services/routing.service';
import { serviceRegistry } from '../services/service-registry';
import { ViewUrlDecoratorSvc } from '../services/viewurl-decorator';
import { RoutingHelpers } from '../utilities/helpers/routing-helpers';

const createContainer = async (node: any, luigi: Luigi): Promise<HTMLElement> => {
  const userSettingGroups = await luigi.readUserSettings();
  const hasUserSettings = node.userSettingsGroup && typeof userSettingGroups === 'object' && userSettingGroups !== null;
  const userSettings = hasUserSettings ? userSettingGroups[node.userSettingsGroup] : null;
  if (node.compound) {
    const lcc: LuigiCompoundContainer = document.createElement('luigi-compound-container') as LuigiCompoundContainer;

    lcc.setAttribute('lui_container', 'true');
    lcc.viewurl = serviceRegistry.get(ViewUrlDecoratorSvc).applyDecorators(node.viewUrl, node.decodeViewUrl);
    lcc.webcomponent = node.webcomponent;
    lcc.compoundConfig = node.compound;
    lcc.context = node.context;
    lcc.clientPermissions = node.clientPermissions;
    lcc.nodeParams = node.nodeParams;
    (lcc as any).userSettingsGroup = node.userSettingsGroup;
    lcc.userSettings = userSettings;
    lcc.searchParams = node.searchParams;
    lcc.locale = luigi.i18n().getCurrentLocale();
    lcc.theme = luigi.theming().getCurrentTheme();
    (lcc as any).viewGroup = node.viewGroup;
    luigi.getEngine()._comm.addListeners(lcc, luigi);
    return lcc;
  } else {
    const lc: LuigiContainer = document.createElement('luigi-container') as LuigiContainer;

    lc.setAttribute('lui_container', 'true');
    lc.viewurl = serviceRegistry.get(ViewUrlDecoratorSvc).applyDecorators(node.viewUrl, node.decodeViewUrl);
    lc.webcomponent = node.webcomponent;
    lc.context = node.context;
    lc.clientPermissions = node.clientPermissions;
    (lc as any).cssVariables = await luigi.theming().getCSSVariables();
    lc.nodeParams = node.nodeParams;
    (lc as any).userSettingsGroup = node.userSettingsGroup;
    lc.userSettings = userSettings;
    lc.searchParams = node.searchParams;
    lc.locale = luigi.i18n().getCurrentLocale();
    lc.theme = luigi.theming().getCurrentTheme();
    (lc as any).viewGroup = node.viewGroup;
    setSandboxRules(lc, luigi);
    setAllowRules(lc, luigi);
    luigi.getEngine()._comm.addListeners(lc, luigi);
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
  init: (luigi: Luigi) => {
    console.log('Init UI...');
    UIModule.navService = serviceRegistry.get(NavigationService);
    UIModule.routingService = serviceRegistry.get(RoutingService);
    UIModule.luigi = luigi;
    luigi.getEngine()._connector?.renderMainLayout();
  },
  update: (scopes?: string[]) => {
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
      UIModule.luigi.getEngine()._connector?.renderTopNav(UIModule.navService.getTopNavData(croute.path));
    }
    if (
      noScopes ||
      scopes.includes('navigation') ||
      scopes.includes('navigation.nodes') ||
      scopes.includes('navigation.viewgroupdata') ||
      scopes.includes('settings') ||
      scopes.includes('settings.footer')
    ) {
      UIModule.luigi.getEngine()._connector?.renderLeftNav(UIModule.navService.getLeftNavData(croute.path));
      UIModule.luigi.getEngine()._connector?.renderTabNav(UIModule.navService.getTabNavData(croute.path));
    }
    if (
      noScopes ||
      scopes.includes('navigation') ||
      scopes.includes('navigation.nodes') ||
      scopes.includes('navigation.viewgroupdata') ||
      scopes.includes('settings.theming')
    ) {
      UIModule.updateMainContent(croute.node, UIModule.luigi);
    }
  },
  updateMainContent: async (currentNode: any, luigi: Luigi) => {
    const userSettingGroups = await luigi.readUserSettings();
    const hasUserSettings =
      currentNode.userSettingsGroup && typeof userSettingGroups === 'object' && userSettingGroups !== null;
    const userSettings = hasUserSettings ? userSettingGroups[currentNode.userSettingsGroup] : null;
    const containerWrapper = luigi.getEngine()._connector?.getContainerWrapper();
    luigi.getEngine()._connector?.hideLoadingIndicator(containerWrapper);

    if (currentNode && containerWrapper) {
      let viewGroupContainer: any;

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
        viewGroupContainer.viewurl = serviceRegistry
          .get(ViewUrlDecoratorSvc)
          .applyDecorators(currentNode.viewUrl, currentNode.decodeViewUrl);
        viewGroupContainer.nodeParams = currentNode.nodeParams;
        viewGroupContainer.clientPermissions = currentNode.clientPermissions;
        viewGroupContainer.searchParams = RoutingHelpers.prepareSearchParamsForClient(currentNode, luigi);
        viewGroupContainer.locale = luigi.i18n().getCurrentLocale();
        viewGroupContainer.theme = luigi.theming().getCurrentTheme();
        viewGroupContainer.userSettingsGroup = currentNode.userSettingsGroup;
        viewGroupContainer.userSettings = userSettings;

        setSandboxRules(viewGroupContainer, luigi);
        setAllowRules(viewGroupContainer, luigi);

        //IMPORTANT!!! This needs to be at the end
        viewGroupContainer.updateContext(currentNode.context || {});
      } else {
        const container = await createContainer(currentNode, luigi);
        containerWrapper?.appendChild(container);
        const connector = luigi.getEngine()._connector;
        if (currentNode.loadingIndicator?.enabled !== false) {
          connector?.showLoadingIndicator(containerWrapper);
        }
      }
    }
  },
  openModal: async (luigi: Luigi, node: any, modalSettings: ModalSettings, onCloseCallback?: Function) => {
    const lc = await createContainer(node, luigi);
    const routingService = serviceRegistry.get(RoutingService);
    luigi.getEngine()._connector?.renderModal(lc, modalSettings, () => {
      onCloseCallback?.();
      if (luigi.getConfigValue('routing.showModalPathInUrl')) {
        routingService.removeModalDataFromUrl(true);
      }
    });
    const connector = luigi.getEngine()._connector;
    if (node.loadingIndicator?.enabled !== false) {
      connector?.showLoadingIndicator(lc.parentElement as HTMLElement);
    }
  },
  openDrawer: async (luigi: Luigi, node: any, modalSettings: ModalSettings, onCloseCallback?: Function) => {
    const lc = await createContainer(node, luigi);
    luigi.getEngine()._connector?.renderDrawer(lc, modalSettings, onCloseCallback);
    const connector = luigi.getEngine()._connector;
    if (node.loadingIndicator?.enabled !== false) {
      connector?.showLoadingIndicator(lc.parentElement as HTMLElement);
    }
  }
};
