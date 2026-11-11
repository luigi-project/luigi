/**
 * DOM elements the connector exposes to Luigi's core API.
 *
 * Returned from `LuigiConnector.getCoreAPISupportedElements()` and consumed by
 * `Luigi.elements()` to give micro-frontend authors access to shell-owned
 * regions of the page.
 */
export interface CoreAPISupportedElements {
  getShellbarElement(): HTMLElement | null;
  getShellbarActions(): HTMLElement | null;
  getLuigiContainer(): HTMLElement | null;
  getNavFooterContainer(): HTMLElement | null;
}
