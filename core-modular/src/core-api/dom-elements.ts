import type { Luigi } from './luigi';
export class Elements {
  luigi: Luigi;

  constructor(luigi: Luigi) {
    this.luigi = luigi;
  }

  /**
   * Returns the shellbar component.
   * @returns {HTMLElement} the shellbar DOM element
   * @memberof Elements
   * @example
   * Luigi.elements().getShellbar();
   */
  getShellbar(): HTMLElement | null {
    return this.luigi.getEngine()._connector?.getShellbarElement() || null;
  }
}
