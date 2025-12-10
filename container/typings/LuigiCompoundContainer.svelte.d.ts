export declare interface WebComponentSettings {
  type?: string;
  selfRegistered?: boolean;
  tagName?: string;
}

/**
 * @summary Base class for Luigi compound container.
 * @augments HTMLElement
 * @class
 */
export default class LuigiCompoundContainer extends HTMLElement {
  /**
   * The URL used for the renderer. <br><br>
   * Type: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
   * @since 1.0.0
   * @type {String}
   * @kind member
   * @memberof LuigiCompoundContainer
   * @example <luigi-compound-container viewurl="/index.html"></luigi-compound-container>
   * @example myContainer.viewurl = "/index.html"
   */
  viewurl: string;

  /**
   * The configuration for the compound microfrontend.
   * Take a look at the [compound parameter](https://docs.luigi-project.io/docs/navigation-parameters-reference/?section=compound) for details. <br><br>
   * Type: [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
   * @since 1.0.0
   * @type {Object}
   * @kind member
   * @memberof LuigiCompoundContainer
   * @example
   * renderer = { use: 'grid', config: { columns: '1fr 1fr 1fr 2fr', layouts: [{maxWidth: 600, columns: '1fr', gap: 0, ...}]}};
   * children = [{ viewUrl: '/main.js', context: { label: 'WC', ...}, layoutConfig: {column: '1 / -1', ...}, eventListeners: [{ source: 'input1', ...}}]}];
   * @example myContainer.compoundConfig = { renderer, children };
   */
  compoundConfig: object;

  /**
   * If set to true defers from initializing the microfronted automatically. In that case init() can be used. <br><br>
   * Type: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
   * @since 1.0.0
   * @type {Boolean}
   * @kind member
   * @memberof LuigiCompoundContainer
   * @example <luigi-compound-container viewurl="/index.html" defer-init></luigi-compound-container>
   * @example myContainer.deferInit = true
   */
  deferInit: boolean;

  /**
   *
   * The locale to be passed to the compound micro frontend. <br><br>
   * Type: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
   * @since 1.4.0
   * @type {String}
   * @kind member
   * @memberof LuigiCompoundContainer
   * @example <luigi-compound-container locale="en_us"></luigi-compound-container>
   * @example myContainer.locale = "en_us"
   */
  locale: string;

  /**
   * The parameters to be passed to the compound micro frontend. Will not be passed to the compound children. <br><br>
   * Type: [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
   * @since 1.0.0
   * @type {Object}
   * @kind member
   * @memberof LuigiCompoundContainer
   * @example <luigi-compound-container viewurl="/index.html" node-params='{"node":"param"}'></luigi-compound-container>
   * @example myContainer.nodeParams = {foo: bar}
   */
  nodeParams: object;

  /**
   * If set to true, the Luigi compound container webcomponent will not use the shadow DOM for rendering. <br><br>
   * Type: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
   * @since 1.2.0
   * @type {Boolean}
   * @kind member
   * @memberof LuigiCompoundContainer
   * @example <luigi-compound-container viewurl="/index.html" no-shadow></luigi-compound-container>
   * @example myContainer.noShadow = true
   */
  noShadow: boolean;

  /**
   * The search parameters to be passed to the compound micro frontend. <br><br>
   * Type: [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
   * @since 1.0.0
   * @type {Object}
   * @kind member
   * @memberof LuigiCompoundContainer
   * @example <luigi-compound-container viewurl="/index.html" search-params='{"search":"param"}'></luigi-compound-container>
   * @example myContainer.searchParams = {foo: bar}
   */
  searchParams: object;

  /**
   * The path parameters to be passed to the compound micro frontend. <br><br>
   * Type: [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
   * @since 1.0.0
   * @type {Object}
   * @kind member
   * @memberof LuigiCompoundContainer
   * @example <luigi-compound-container viewurl="/index.html" path-params='{"path":"param"}'></luigi-compound-container>
   * @example myContainer.pathParams = {foo: "bar"}
   */
  pathParams: object;

  /**
   * The stringified context to be passed to the compound microfrontend. <br><br>
   * Type: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
   * @since 1.0.0
   * @type {String}
   * @kind member
   * @memberof LuigiCompoundContainer
   * @example <luigi-compound-container viewurl="/index.html" context='{"label": "Dashboard"}'></luigi-compound-container>
   * @example myContainer.context = {label: "Dashboard"}
   */
  context: string;

  /**
   * The clientPermissions to be passed to the compound micro frontend. <br><br>
   * Type: [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
   * @since 1.0.0
   * @type {Object}
   * @kind member
   * @memberof LuigiCompoundContainer
   * @example <luigi-compound-container viewurl="/index.html" client-permissions='{"permission": "adminGroup"}'></luigi-compound-container>
   * @example myContainer.clientPermissions = {permission: "adminGroup"}
   */
  clientPermissions: object;

  /**
   * The user settings to be passed to the compound micro frontend. <br><br>
   * Type: [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
   * @since 1.0.0
   * @type {Object}
   * @kind member
   * @memberof LuigiCompoundContainer
   * @example <luigi-compound-container viewurl="/index.html" user-settings='{"language": "de", "theme":"sap_horizon"}'></luigi-compound-container>
   * @example myContainer.userSettings = {language: 'de', theme: 'sap_horizon'}
   */
  userSettings: object;

  /**
   * The anchor value to be passed to the compound micro frontend. <br><br>
   * Type: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
   * @since 1.0.0
   * @type {String}
   * @kind member
   * @memberof LuigiCompoundContainer
   * @example <luigi-compound-container viewurl="/index.html" anchor='#foo'></luigi-compound-container>
   * @example myContainer.anchor = '#foo'
   */
  anchor: string;

  /**
   * The document title value to be passed to the compound micro frontend. <br><br>
   * Type: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
   * @since 1.2.0
   * @type {String}
   * @kind member
   * @memberof LuigiCompoundContainer
   * @example <luigi-compound-container viewurl="/index.html" document-title='Luigi App'></luigi-compound-container>
   * @example myContainer.documentTitle = 'Luigi App'
   */
  documentTitle: string;

  /**
   * The hasBack value to be passed to the compound micro frontend.
   * It indicates that there is one or more preserved views. Useful when you need to show a back button. <br><br>
   * Type: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
   * @since 1.2.0
   * @type {Boolean}
   * @kind member
   * @memberof LuigiCompoundContainer
   * @example <luigi-compound-container viewurl="/index.html" has-back></luigi-compound-container>
   * @example myContainer.hasBack = true
   */
  hasBack: boolean;

  /**
   * The dirty status value to be passed to the compound micro frontend.
   * It's used to indicate that there are unsaved changes when navigating away. <br><br>
   * Type: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
   * @since 1.2.0
   * @type {Boolean}
   * @kind member
   * @memberof LuigiCompoundContainer
   * @example <luigi-compound-container viewurl="/index.html" dirty-status></luigi-compound-container>
   * @example myContainer.dirtyStatus = true
   */
  dirtyStatus: boolean;

  /**
   * @description The following properties can be set for the web component object. By default, the web component is set to true. <br><br>Type: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean) | WebComponentSettings | [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
   * @param {Object} [WebComponentSettings] - specifies that the microfrontend is a webcomponent with addtional settings
   * @param {String} WebComponentSettings.type - string, like module
   * @param {Boolean} WebComponentSettings.selfRegistered - if it is true, the web component bundle will be added via script tag
   * @param {String} WebComponentSettings.tagName - tag name where web component is added to DOM
   * @param {String} string - must be a stringified JSON object from type `WebComponentSettings`
   * @since 1.0.0
   * @type {Boolean|WebComponentSettings|String}
   * @kind member
   * @memberof LuigiCompoundContainer
   * @example <luigi-compound-container webcomponent='{"type": "module", "selfRegistered": true, "tagName": "my-webcomponent"}'></luigi-compound-container>
   * @example myContainer.webcomponent = { type: 'module', selfRegistered: true, tagName: 'my-webcomponent'}
   */
  webcomponent: boolean | WebComponentSettings | string;

  /**
   * If set to true, skips handshake and ready event is fired immediately. <br><br>
   * Type: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
   * @since 1.4.0
   * @type {Boolean}
   * @kind member
   * @memberof LuigiCompoundContainer
   * @example <luigi-compound-container viewurl="/index.html" skipInitCheck></luigi-compound-container>
   * @example myContainer.skipInitCheck = true
   */
  skipInitCheck: boolean;

  /**
   * The list of active feature toggles to be passed to the compound microfrontend. <br><br>
   * Type: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>
   * @since 1.4.0
   * @type {Array<string>}
   * @kind member
   * @memberof LuigiCompoundContainer
   * @example myContainer.activeFeatureToggleList = ["enable-foo", "allow-bar"]
   * @example <luigi-compound-container viewurl="/index.html" active-feature-toggle-list='["enable-foo", "allow-bar"]'></luigi-compound-container>
   */
  activeFeatureToggleList: string[];

  /**
   * The theme to be passed to the compound microfrontend. <br><br>
   * Type: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
   * @since 1.4.0
   * @type {String}
   * @kind member
   * @memberof LuigiCompoundContainer
   * @example <luigi-compound-container viewurl="/index.html" theme='sap_horizon'></luigi-compound-container>
   * @example myContainer.theme = 'sap_horizon'
   */
  theme: string;

  /**
   * Function that updates the context of the compound microfrontend.
   * @param {Object} contextObj - the context data
   * @since 1.0.0
   * @memberof LuigiCompoundContainer
   * @example containerElement.updateContext({newContextData: 'some data'})
   * @returns {void} no explicit return type
   */
  updateContext(contextObj: Object): void {};

  /**
   * A function that notifies the microfrontend that the opened alert has been closed.
   * @param {String} id - the id of the opened alert
   * @param {String} dismissKey - the key specifying which dismiss link was clicked on the alert message (optional)
   * @since 1.7.0
   * @memberof LuigiCompoundContainer
   * @example containerElement.notifyAlertClosed('my-alert-id', 'my-dismiss-key')
   * @returns {void} no explicit return type
   */
  notifyAlertClosed(id: string, dismissKey?: string): void {};

  /**
   * A function that notifies the microfrontend if the confirmation modal was confirmed or declined.
   * @param {Boolean} value - if the confirmation modal was confirmed or declined.
   * @since 1.7.0
   * @memberof LuigiCompoundContainer
   * @example containerElement.notifyAlertClosed(true)
   * @returns {void} no explicit return type
   */
  notifyConfirmationModalClosed(confirmed: boolean): void {};

  /**
   * Manually triggers the micro frontend rendering process when using the defer-init attribute.
   * @since 1.0.0
   * @memberof LuigiCompoundContainer
   * @example containerElement.init()
   * @returns {void} no explicit return type
   */
  init(): void {};
}
