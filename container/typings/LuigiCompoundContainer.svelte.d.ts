export declare interface WebComponentSettings {
  type?: string;
  selfRegistered?: boolean;
  tagName?: string;
}

export default class LuigiCompoundContainer extends HTMLElement {
  /**
   * The URL used for the renderer.
   *
   * @since 1.0.0
   * @example <luigi-container viewurl="/index.html"></luigi-container>
   * @example myContainer.viewurl = "/index.html"
   */
  viewurl: string;

  /**
   * The configuration for the compound microfrontend.
   * Take a look at the [compound parameter](https://docs.luigi-project.io/docs/navigation-parameters-reference/?section=compound) for details.
   * @since 1.0.0
   *
   * @example renderer = { use: 'grid', config: { columns: '1fr 1fr 1fr 2fr', layouts: [{maxWidth: 600, columns: '1fr', gap: 0, ...}]}};
   * children = [{ viewUrl: '/main.js', context: { label: 'WC', ...}, layoutConfig: {column: '1 / -1', ...}, eventListeners: [{ source: 'input1', ...}}]}];
   * myContainer.compoundConfig = { renderer, children };
   */
  compoundConfig: Object;

  /**
   * If set to true defers from initializing the microfronted automatically. In that case init() can be used.
   * @since 1.0.0
   *
   * @example <luigi-container viewurl="/index.html" defer-init></luigi-container>
   * @example myContainer.deferInit = true
   */
  deferInit: boolean;

  /**
   *
   * The locale to be passed to the compound micro frontend.
   * @since 1.4.0
   *
   * @example <luigi-container locale="en_us"></luigi-container>
   * @example myContainer.locale = "en_us"
   */
  locale: string;

  /**
   * The parameters to be passed to the compound micro frontend. Will not be passed to the compound children.
   * @since 1.0.0
   *
   * @example <luigi-container viewurl="/index.html" node-params='{"node":"param"}'></luigi-container>
   * @example myContainer.nodeParams = {foo: bar}
   */
  nodeParams: Object;

  /**
   * If set to true, the Luigi compound container webcomponent will not use the shadow DOM for rendering.
   * @since 1.2.0
   *
   * @example <luigi-container viewurl="/index.html" no-shadow></luigi-container>
   * @example myContainer.noShadow = true
   */
  noShadow: boolean;

  /**
   * The search parameters to be passed to the compound micro frontend.
   * @since 1.0.0
   *
   * @example <luigi-container viewurl="/index.html" search-params='{"search":"param"}'></luigi-container>
   * @example myContainer.searchParams = {foo: bar}
   */
  searchParams: Object;

  /**
   * The path parameters to be passed to the compound micro frontend.
   * @since 1.0.0
   *
   * @example <luigi-container viewurl="/index.html" path-params='{"path":"param"}'></luigi-container>
   * @example myContainer.pathParams = {foo: "bar"}
   */
  pathParams: Object;

  /**
   * The stringified context to be passed to the compound microfrontend.
   * @since 1.0.0
   *
   * @example <luigi-container viewUrl="/index.html" context='{"label": "Dashboard"}'></luigi-container>
   * @example myContainer.context = {label: "Dashboard"}
   */
  context: string;

  /**
   * The clientPermissions to be passed to the compound micro frontend.
   * @since 1.0.0
   *
   * @example <luigi-container viewurl="/index.html" client-permissions='{"permission": "adminGroup"}'></luigi-container>
   * @example myContainer.clientPermissions = {permission: "adminGroup"}
   */
  clientPermissions: Object;

  /**
   * The user settings to be passed to the compound micro frontend.
   * @since 1.0.0
   *
   * @example <luigi-container viewurl="/index.html" user-settings='{"language": "de", "theme":"sap_horizon"}'></luigi-container>
   * @example myContainer.userSettings = {language: 'de', theme: 'sap_horizon'}
   */
  userSettings: Object;

  /**
   * The anchor value to be passed to the compound micro frontend.
   * @since 1.0.0
   *
   * @example <luigi-container viewurl="/index.html" anchor='#foo'></luigi-container>
   * @example myContainer.anchor = '#foo'
   */
  anchor: string;

  /**
   * The document title value to be passed to the compound micro frontend.
   * @since 1.2.0
   *
   * @example <luigi-container viewurl="/index.html" document-title='Luigi App'></luigi-container>
   * @example myContainer.documentTitle = 'Luigi App'
   */
  documentTitle: string;

  /**
   * The hasBack value to be passed to the compound micro frontend.
   * It indicates that there is one or more preserved views. Useful when you need to show a back button.
   * @since 1.2.0
   *
   * @example <luigi-container viewurl="/index.html" has-back></luigi-container>
   * @example myContainer.hasBack = true
   */
  hasBack: boolean;

  /**
   * The dirty status value to be passed to the compound micro frontend.
   * It's used to indicate that there are unsaved changes when navigating away.
   * @since 1.2.0
   *
   * @example <luigi-container viewurl="/index.html" dirty-status></luigi-container>
   * @example myContainer.dirtyStatus = true
   */
  dirtyStatus: boolean;

  /**
   * The following properties can be set for the web component object. By default, the web component is set to true.
   * @param {Object} [WebComponentSettings]
   * @param {string} WebComponentSettings.type: string, like module.
   * @param {boolean} WebComponentSettings.selfRegistered: if it is true, the web component bundle will be added via script tag.
   * @param {string} WebComponentSettings.tagName: tag name where web component is added to DOM.
   * @param {string} string must be a stringified JSON object from type `WebComponentSettings`.
   * @since 1.0.0
   *
   * @example <luigi-container webcomponent="{ type: 'module', selfRegistered: true, tagName: 'my-webcomponent'}"></luigi-container>
   * @example myContainer.webcomponent = { type: 'module', selfRegistered: true, tagName: 'my-webcomponent'}
   */
  webcomponent: boolean | WebComponentSettings | string;

  /**
   * If set to true, skips handshake and ready event is fired immediately.
   * @since 1.4.0
   *
   * @example <luigi-container viewurl="/index.html" skipInitCheck></luigi-container>
   * @example myContainer.skipInitCheck = true
   */
  skipInitCheck: boolean;

  /**
   * The list of active feature toggles to be passed to the compound microfrontend.
   * @since 1.4.0
   *
   *
   * @example <luigi-container viewUrl="/index.html" active-feature-toggle-list='["enable-foo", "allow-bar"]'></luigi-container>
   * @example myContainer.activeFeatureToggleList = ["enable-foo", "allow-bar"]
   */
  activeFeatureToggleList: string[];

  /**
   * The theme to be passed to the compound microfrontend.
   * @since 1.4.0
   *
   *
   * @example <luigi-container viewUrl="/index.html" theme='sap_horizon'></luigi-container>
   * @example myContainer.theme = 'sap_horizon'
   */
  theme: string;

  /**
   * Function that updates the context of the compound microfrontend.
   * @param contextObj The context data
   * @example
   * containerElement.updateContext({newContextData: 'some data'})
   * @since 1.0.0
   */
  updateContext(contextObj: Object): void;

  /**
   * A function that notifies the microfrontend that the opened alert has been closed.
   * @param id the id of the opened alert
   * @param dismissKey the key specifying which dismiss link was clicked on the alert message (optional)
   * @example
   * containerElement.notifyAlertClosed('my-alert-id', 'my-dismiss-key')
   * @since 1.7.0
   */
  notifyAlertClosed(id: string, dismissKey?: string): void;

  /**
   * A function that notifies the microfrontend if the confirmation modal was confirmed or declined.
   * @param {boolean} value if the confirmation modal was confirmed or declined.
   * @example
   * containerElement.notifyAlertClosed(true)
   * @since 1.7.0
   */
  notifyConfirmationModalClosed(confirmed: boolean): void;

  /**
   * Manually triggers the micro frontend rendering process when using the defer-init attribute.
   * @since 1.0.0
   */
  init(): void;
}
