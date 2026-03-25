import type { Luigi } from './luigi';
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
}
