import type { Luigi } from '../../core-api/luigi';
import type { Node } from '../../services/navigation.service';
import { ViewUrlDecorator } from '../../services/viewurl-decorator';
import { GenericHelpers } from './generic-helpers';

interface MicrofrontendElement {
  active: boolean;
  container: Element;
  id: string;
  type: string;
}

interface MicrofrontendType {
  selector: string;
  type: string;
}

interface IframeType {
  dataKey: string;
  iframeConfigKey: string;
  iframeKey: string;
}

export const IframeHelpers = {
  getMicrofrontendTypes: (): MicrofrontendType[] => {
    return [
      { type: 'drawer', selector: '.iframeModalCtn._drawer iframe' },
      { type: 'main', selector: '.iframeContainer iframe' },
      { type: 'modal', selector: '.iframeModalCtn._modal iframe' },
      { type: 'split-view', selector: '.iframeSplitViewCnt iframe' },
      { type: 'user-settings', selector: '.iframeUserSettingsCtn iframe' }
    ];
  },

  getSpecialIframeTypes: (): IframeType[] => {
    return [
      {
        dataKey: 'drawerIframeData',
        iframeConfigKey: 'drawer',
        iframeKey: 'drawerIframe'
      },
      {
        dataKey: 'modalIframeData',
        iframeConfigKey: 'modal',
        iframeKey: 'modalIframe'
      },
      {
        dataKey: 'splitViewIframeData',
        iframeConfigKey: 'splitView',
        iframeKey: 'splitViewIframe'
      }
    ];
  },

  hideElementChildren: (node: Node): void => {
    if (node.children) {
      Array.from(node.children).forEach((child: any) => {
        if (child.tagName === 'IFRAME') {
          child.style.display = 'none';
        }
      });
    }
  },

  removeElementChildren: (node: Node): void => {
    const children: Node[] = [...node.children];

    children.forEach((child: any) => {
      if (!child.vg && child.tagName === 'IFRAME') {
        (node as any).removeChild(child);
      }
    });
  },

  removeIframe: (iframe: Node, node: Node): void => {
    const children = Array.from(node.children);

    children.forEach(child => {
      if (child === iframe) {
        (node as any).removeChild(child);
      }
    });
  },

  isSameUrl: (config: any, component: any): boolean => {
    if (!config.iframe) {
      return false;
    }

    const componentData = {...component};
    const previousUrl = GenericHelpers.getUrlWithoutHash(componentData.previousNodeValues.viewUrl);
    const nextUrl = GenericHelpers.getUrlWithoutHash(componentData.viewUrl);
    const previousViewGroup = componentData.previousNodeValues.viewGroup;
    const nextViewGroup = componentData.viewGroup;

    return !!(previousUrl === nextUrl && !previousViewGroup && !nextViewGroup);
  },

  isSameViewGroup: (config: any, component: any): boolean => {
    if (config.iframe) {
      const componentData = {...component};
      const previousUrl = GenericHelpers.getUrlWithoutHash(componentData.previousNodeValues.viewUrl);
      const nextUrl = GenericHelpers.getUrlWithoutHash(componentData.viewUrl);
      const previousUrlOrigin = previousUrl ? IframeHelpers.getLocation(previousUrl as string) : '';
      const nextUrlOrigin = nextUrl ? IframeHelpers.getLocation(nextUrl as string) : '';

      if (previousUrlOrigin === nextUrlOrigin) {
        const previousViewGroup = componentData.previousNodeValues.viewGroup;
        const nextViewGroup = componentData.viewGroup;

        if (previousViewGroup && nextViewGroup && previousViewGroup === nextViewGroup) {
          return true;
        }
      }
    }

    return false;
  },

  canReuseIframe: (config: any, component: any): boolean => {
    return IframeHelpers.isSameUrl(config, component) || IframeHelpers.isSameViewGroup(config, component);
  },

  getLocation: (url: string): string => {
    const element = document.createElement('a');

    element.href = url;

    if (element.origin) {
      return element.origin;
    }

    return '';
  },

  urlMatchesTheDomain: (viewUrl = '', domain: string): boolean => {
    return IframeHelpers.getLocation(viewUrl) === IframeHelpers.getLocation(domain);
  },

  iframeIsSameDomain: (viewUrl: string, domain: string): boolean => {
    return IframeHelpers.urlMatchesTheDomain(viewUrl, domain);
  },

  getIframeContainer: (): Element | undefined => {
    const containers: Element[] = Array.from(document.querySelectorAll('.iframeContainer'));

    return containers.length > 0 ? containers[0] : undefined;
  },

  /*
  [
    {id: "id-1", container: IFRAME_DO_ELEM_1, active: true, type:"main"},
    {id: "id-2", container: IFRAME_DO_ELEM_1, active: false, type:"main"},
    {id: "id-3", container: IFRAME_DO_ELEM_3, active: false, type:"modal"},
    {id: "id-4", container: IFRAME_DO_ELEM_4, active: false, type:"main"},
    {id: "id-5", container: IFRAME_DO_ELEM_5, active: false, type:"split-view"},
    {id: "id-6", container: IFRAME_DO_ELEM_6, active: false, type:"main"}
  ]
  */
  getMicrofrontendsInDom: (): MicrofrontendElement[] => {
    return IframeHelpers.getMicrofrontendTypes().map(({ type, selector }) => {
      return Array.from(document.querySelectorAll(selector)).map(container => ({
        active: GenericHelpers.isElementVisible(container),
        container,
        id: (container as any).luigi.id,
        type
      }));
    }).reduce((acc, val) => acc.concat(val), []); // flatten
  },

  getMicrofrontendIframes: (): Element[] => {
    return IframeHelpers.getMicrofrontendsInDom().map(mfObj => mfObj.container);
  },

  getCurrentWebcomponentCtnInDom: (): Element | null => {
    return document.querySelector('.iframeContainer.lui-webComponent');
  },

  getCurrentMicrofrontendIframe: (): Element | null => {
    const modalIframes = IframeHelpers.getModalIframes();
    const mainIframes = IframeHelpers.getMainIframes().filter(GenericHelpers.isElementVisible);
    const webComponentCtn = IframeHelpers.getCurrentWebcomponentCtnInDom();

    return modalIframes[0] || mainIframes[0] || webComponentCtn || null;
  },

  getIframesWithType: (type: string): Element[] => {
    return IframeHelpers.getMicrofrontendsInDom()
      .filter(mfObj => mfObj.type === type)
      .map(mfObj => mfObj.container);
  },

  getMainIframes: (): Element[] => {
    return IframeHelpers.getIframesWithType('main');
  },

  getModalIframes: (): Element[] => {
    return IframeHelpers.getIframesWithType('modal');
  },

  getVisibleIframes: (): Element[] => {
    return IframeHelpers.getMicrofrontendsInDom()
      .filter(mfObj => mfObj.active)
      .map(mfObj => mfObj.container);
  },

  sendMessageToIframe: (iframe: any, message: any): void => {
    if (!(iframe && iframe.luigi && iframe.luigi.viewUrl && iframe._ready)) {
      return;
    }

    const trustedIframeDomain = IframeHelpers.getLocation(iframe.luigi.viewUrl);

    if (trustedIframeDomain !== '' && iframe.contentWindow) {
      iframe.contentWindow.postMessage(message, trustedIframeDomain);
    }
  },

  sendMessageToVisibleIframes: (message: any): void => {
    IframeHelpers.getVisibleIframes().forEach(iframe => IframeHelpers.sendMessageToIframe(iframe, message));
  },

  broadcastMessageToAllIframes: (message: any): void => {
    IframeHelpers.getMicrofrontendIframes().forEach(iframe => IframeHelpers.sendMessageToIframe(iframe, message));
  },

  createIframe: (viewUrl: string, viewGroup: any, currentNode: any, microFrontendType: string, componentData: any, luigi: Luigi): any => {
    const luigiDefaultSandboxRules = [
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
    const customSandboxRules = luigi.getConfigValue('settings.customSandboxRules');
    const allowRules = luigi.getConfigValue('settings.allowRules');
    const activeSandboxRules = customSandboxRules
      ? [...new Set([...luigiDefaultSandboxRules, ...customSandboxRules])]
      : luigiDefaultSandboxRules;
    const iframe = document.createElement('iframe') as any;

    iframe.src = ViewUrlDecorator.hasDecorators()
      ? ViewUrlDecorator.applyDecorators(viewUrl, currentNode ? currentNode.decodeViewUrl : undefined)
      : viewUrl;

    if (allowRules) {
      allowRules.forEach((rule: any, index: any) => {
        allowRules[index] = rule + (rule.indexOf(';') != -1 ? '' : ';');
      });
      iframe.allow = allowRules.join(' ');
    }

    iframe.sandbox = activeSandboxRules.join(' ');
    iframe.luigi = {
      viewUrl,
      currentNode,
      createdAt: new Date().getTime(),
      id: GenericHelpers.getRandomId(),
      pathParams: componentData ? componentData.pathParams : undefined
    };

    if (viewGroup) {
      iframe.vg = viewGroup;
    }

    if (currentNode && currentNode.clientPermissions) {
      iframe.luigi.clientPermissions = currentNode.clientPermissions;
    }

    const iframeInterceptor = luigi.getConfigValue('settings.iframeCreationInterceptor');

    if (GenericHelpers.isFunction(iframeInterceptor)) {
      try {
        iframeInterceptor(iframe, viewGroup, currentNode, microFrontendType);
      } catch (err) {
        console.error('Error applying iframe creation interceptor: ', err);
      }
    }

    return iframe;
  },

  isMessageSource: (event: any, iframe: any): boolean => {
    return iframe && iframe.contentWindow === event.source;
  },

  getValidMessageSource: (event: any): any => {
    const allMessagesSources: any[] = [
      ...IframeHelpers.getMicrofrontendIframes(),
      { contentWindow: window, luigi: { viewUrl: window.location.href } }
    ];
    const iframe: any = allMessagesSources.find(iframe => IframeHelpers.isMessageSource(event, iframe));

    if (!iframe || !iframe.luigi || !iframe.luigi.viewUrl) {
      return undefined;
    }

    const navigateOkMsg: boolean = 'luigi.navigate.ok' === event.data.msg;

    if (navigateOkMsg && !iframe.luigi.nextViewUrl) {
      return undefined;
    }

    const viewUrl: string = navigateOkMsg ? iframe.luigi.nextViewUrl : iframe.luigi.viewUrl;

    if (!IframeHelpers.iframeIsSameDomain(viewUrl, event.origin)) {
      return undefined;
    }

    return iframe;
  },

  getSpecialIframeMessageSource: (event: any, specialIframeProps: any): IframeType[] => {
    return IframeHelpers.getSpecialIframeTypes().filter((type: IframeType) =>
      IframeHelpers.isMessageSource(event, specialIframeProps[type.iframeKey])
    );
  },

  disableA11yOfInactiveIframe: (srcIframe: any): void => {
    const nodeList = document.querySelectorAll('*');

    [...nodeList].forEach(el => {
      if (!el.getAttribute('oldTab')) {
        el.setAttribute('oldTab', el.getAttribute('tabindex') as string);
      }

      if (el !== srcIframe) {
        el.setAttribute('tabindex', '-1');
      }
    });
  },

  enableA11yOfInactiveIframe: (): void => {
    const nodeList = document.querySelectorAll('*');

    [...nodeList].forEach(el => {
      const restoreVal = el.getAttribute('oldTab');

      if (el.getAttribute('oldTab') === 'null') {
        el.removeAttribute('tabindex');
      }

      el.removeAttribute('oldTab');

      if (restoreVal && restoreVal !== 'null') {
        el.setAttribute('tabindex', restoreVal);
      }
    });
  },

  /**
   * Sets tabindex for all elements to -1, except for one element and all its children which needs the focus.
   * Setting tabindex to a negative value removes keyboard acessibility from the specified elements.
   * @param {string} targetElementClassName the class name/s of the element to be excluded
   */
  disableA11YKeyboardExceptClassName: (targetElementClassName: string): void => {
    const nodeList = document.querySelectorAll('*');

    [...nodeList].forEach(element => {
      const isNotAChildOfTargetElement = !element.closest(targetElementClassName);
      const prevTabIndex: any = element.getAttribute('tabindex');

      // save tabIndex in case one already exists
      if ((prevTabIndex || prevTabIndex === 0) && isNotAChildOfTargetElement && !element.hasAttribute('oldtab')) {
        element.setAttribute('oldtab', prevTabIndex);
      }

      // set tabindex to negative only if the current element is not a descendant of element with class 'targetElementClassName'
      isNotAChildOfTargetElement ? element.setAttribute('tabindex', '-1') : '';
    });
  },

  /**
   * Resets tabindex value to previous value if it exists, or remove altogether if not.
   * Applies to all elements except for the target element which we do not touch
   */
  enableA11YKeyboardBackdropExceptClassName: (targetElementClassName: string): void => {
    const nodeList = document.querySelectorAll('*');

    [...nodeList].forEach(element => {
      const restoreVal = element.getAttribute('oldtab');
      const isNotAChildOfTargetElement = !element.closest(targetElementClassName);

      isNotAChildOfTargetElement ? element.removeAttribute('tabindex') : '';

      if (restoreVal && restoreVal !== 'null') {
        element.setAttribute('tabindex', restoreVal);
        element.removeAttribute('oldtab');
      }
    });
  },

  applyCoreStateData: () => {
    // TODO
  }
};
