/**
 * @summary Base class for Luigi web component micro frontends.
 * @augments HTMLElement
 * @class
 */
export default class LuigiElement extends HTMLElement {
  /**
   * Override to execute logic after initialization of the web component, i.e.
   * after internal rendering and all context data set.
   * @param {any} ctx - the context object passed by luigi core
   * @memberof LuigiElement
   * @returns {void} no explicit return type
   */
  afterInit(ctx: Record<string, any>): void {};

  /**
   * Override to return the html template string defining the web component view.
   * @param {any} ctx - the context object passed by luigi core
   * @memberof LuigiElement
   * @returns {string} string value
   */
  render(ctx: Record<string, any>): string {};

  /**
   * Override to execute logic after an attribute of this web component has changed.
   * @memberof LuigiElement
   * @returns {void} no explicit return type
   */
  update(): void {};

  /**
   * Override to execute logic when a new context object is set.
   * @param {any} ctx - the new context object passed by luigi core
   * @memberof LuigiElement
   * @returns {void} no explicit return type
   */
  onContextUpdate(ctx: Record<string, any>): void {};

  /**
   * Query selector operating on shadow root.
   * @see ParentNode.querySelector
   * @memberof LuigiElement
   * @returns {HTMLElement | null} HTML element or null
   */
  override querySelector(selector: string): HTMLElement | null {};
}
