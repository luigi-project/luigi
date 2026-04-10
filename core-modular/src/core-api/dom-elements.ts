import { UIModule } from '../modules/ui-module';
import { GenericHelpers } from '../utilities/helpers/generic-helpers';
import { LuigiContainerHelpers } from '../utilities/helpers/luigi-container-helpers';
import { Luigi } from './luigi';
export class Elements {
  luigi: Luigi;

  constructor(luigi: Luigi) {
    this.luigi = luigi;
  }

  /**
   * Returns the shellbar component.
   * @returns {HTMLElement | null} the shellbar DOM element
   * @memberof Elements
   * @example
   * Luigi.elements().getShellbar();
   */
  getShellbar(): HTMLElement | null {
    return this.luigi.getEngine()._connector?.getCoreAPISupportedElements().getShellbarElement() || null;
  }

  /**
   * Returns the shellbar actions.
   * @returns {HTMLElement | null} the shellbar actions DOM element
   * @memberof Elements
   * @example
   * Luigi.elements().getShellbarActions();
   */
  getShellbarActions(): HTMLElement | null {
    return this.luigi.getEngine()._connector?.getCoreAPISupportedElements().getShellbarActions() || null;
  }

  /**
   * Returns the main container of the Luigi application.
   * @memberof Elements
   * @returns {HTMLElement | null} the Luigi container DOM element
   */
  getLuigiContainer(): HTMLElement | null {
    return this.luigi.getEngine()._connector?.getCoreAPISupportedElements().getLuigiContainer() || null;
  }

  /**
   * Returns the navigation footer container of the Luigi application.
   * @memberof Elements
   * @returns {HTMLElement | null} the navigation footer container DOM element
   */
  getNavFooterContainer(): HTMLElement | null {
    return this.luigi.getEngine()._connector?.getCoreAPISupportedElements().getNavFooterContainer() || null;
  }

  /**
   * Returns a list of all available micro frontends.
   * @returns {Array<{id: string, active: boolean, container: HTMLElement, type: 'main'|'split-view'|'modal'}>} list of objects defining all micro frontends from the DOM
   * @memberof Elements
   * @example
   * Luigi.elements().getMicrofrontends();
   */
  getMicrofrontends() {
    return LuigiContainerHelpers.getMicrofrontendsInDom(this.luigi);
  }

  /**
   * Returns all micro frontend iframes including the iframe from the modal if it exists.
   * @returns {Array<HTMLElement>} an array of all micro frontend iframes from the DOM
   * @memberof Elements
   * @example
   * Luigi.elements().getMicrofrontendIframes();
   */
  getMicrofrontendIframes(): HTMLElement[] | null {
    const containerWrapper = this.luigi.getEngine()._connector?.getContainerWrapper();
    let iframes: HTMLElement[] = [];
    if (UIModule.modalContainer) {
      for (const element of Array.from(UIModule.modalContainer) as any[]) {
        if (element.tagName?.startsWith('LUIGI-') && element.iframeHandle?.iframe) {
          iframes.push(element.iframeHandle.iframe);
        }
      }
    }
    // TODO drawer not implemented yet
    // if(UIModule.drawerContainer) {
    //   iframes.push(UIModule.drawerContainer.iframeHandle.iframe);
    // }


    if (!containerWrapper) return null;
    for (const element of Array.from(containerWrapper.childNodes) as any[]) {
      if (element.tagName?.startsWith('LUIGI-') && element.iframeHandle?.iframe) {
        iframes.push(element.iframeHandle.iframe);
      }
    }
    return iframes;
  }

  /**
   * Returns the active micro frontend iframe.
   * If there is a modal, which includes the micro frontend iframe, the function returns this iframe.
   * @returns {HTMLElement} the active micro frontend iframe DOM element
   * @memberof Elements
   * @example
   * Luigi.elements().getCurrentMicrofrontendIframe();
   */
  getCurrentMicrofrontendIframe(): HTMLElement | null {
    const containerWrapper = this.luigi.getEngine()._connector?.getContainerWrapper();
    if (!containerWrapper) return null;

    const modalIframe = UIModule.modalContainer[0]?.iframeHandle?.iframe ?? null;
    let mainIframe: HTMLElement | null = null;
    let webcomponent: HTMLElement | null = null;

    for (const element of Array.from(containerWrapper.children)) {
      if (element.tagName?.startsWith('LUIGI-') && GenericHelpers.isElementVisible(element)) {
        if ((element as any).iframeHandle?.iframe) {
          mainIframe = (element as any).iframeHandle.iframe;
        } else {
          webcomponent = (element as any).shadowRoot?.firstElementChild?.firstElementChild ?? null;
        }
      }
    }

    return modalIframe || mainIframe || webcomponent;
  }
}
