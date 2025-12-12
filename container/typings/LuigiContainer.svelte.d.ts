export declare interface WebComponentSettings {
  type?: string;
  selfRegistered?: boolean;
  tagName?: string;
}

/**
 * @summary Base class for Luigi container.
 * @augments HTMLElement
 * @class
 */
export default class LuigiContainer extends HTMLElement {
  /**
   * The URL of the microfrontend to be rendered. <br><br>
   * Type: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
   * @since 1.0.0
   * @type {String}
   * @kind member
   * @memberof LuigiContainer
   * @example <luigi-container viewurl="/index.html"></luigi-container>
   * @example myContainer.viewurl = "/index.html"
   */
  viewurl: string;

  /**
   * If set to true defers from initializing the microfronted automatically. In that case init() can be used. <br><br>
   * Type: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
   * @since 1.0.0
   * @type {Boolean}
   * @kind member
   * @memberof LuigiContainer
   * @example <luigi-container viewurl="/index.html" defer-init></luigi-container>
   * @example myContainer.deferInit = true
   */
  deferInit: boolean;

  /**
   * The stringified context object to be passed to the microfrontend. <br><br>
   * Type: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
   * @since 1.0.0
   * @type {String}
   * @kind member
   * @memberof LuigiContainer
   * @example <luigi-container viewurl="/index.html" context='{"label": "Dashboard"}'></luigi-container>
   * @example myContainer.context = {label: "Dashboard"}
   */
  context: string;

  /**
   * Label information for the microfrontend. <br><br>
   * Type: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
   * @since 1.0.0
   * @type {String}
   * @kind member
   * @memberof LuigiContainer
   * @example <luigi-container viewurl="/index.html" label="Dashboard"></luigi-container>
   * @example myContainer.label = "Dashboard"
   */
  label: string;

  /**
   * @description Predicate that sets whether the microfrontend is to be rendered in a web component or not. It can also be an object with the attributes shown in a table below. <br><br>Type: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean) | WebComponentSettings | [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
   * @summary <blockquote class="warning"><p><strong>Note:</strong> If you have to use the mechanism of `selfRegistered`, we recommend using the following code in your web component:</p></blockquote> <pre><code>window.Luigi._registerWebcomponent(new URL(document.currentScript?.getAttribute('src'), location), <YOUR_WEBCOMPONENT_CLASS>);</code></pre> The advantage of this line of code is: you don't have to specify a tag name, thus avoiding the duplication of self-defined tag names. <br><br>
   * @param {boolean} specifies - if a microfrontend is a webcomponent or not without any other settings
   * @param {Object} [WebComponentSettings] - specifies that the microfrontend is a webcomponent with addtional settings
   * @param {string} WebComponentSettings.type - a string, like module
   * @param {boolean} WebComponentSettings.selfRegistered - if it is true, the web component bundle will be added via script tag
   * @param {string} WebComponentSettings.tagName - tag name where web component is added to DOM
   * @param {string} string - must be a stringified boolean or JSON object from type `WebComponentSettings`
   * @since 1.0.0
   * @type {Boolean|WebComponentSettings|String}
   * @kind member
   * @memberof LuigiContainer
   * @example <luigi-container webcomponent='{"type": "module", "selfRegistered": true, "tagName": "my-webcomponent"}'></luigi-container>
   * @example myContainer.webcomponent = { type: 'module', selfRegistered: true, tagName: 'my-webcomponent'}
   */
  webcomponent: boolean | WebComponentSettings | string;

  /**
   * The locale to be passed to the web-component-based micro frontend. <br><br>
   * Type: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
   * @since 1.0.0
   * @type {String}
   * @kind member
   * @memberof LuigiContainer
   * @example <luigi-container locale="en_us"></luigi-container>
   * @example myContainer.locale = "en_us"
   */
  locale: string;

  /**
   * The theme to be passed to the  web-component-based micro frontend. <br><br>
   * Type: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
   * @since 1.0.0
   * @type {String}
   * @kind member
   * @memberof LuigiContainer
   * @example <luigi-container viewurl="/index.html" theme='sap_horizon'></luigi-container>
   * @example myContainer.theme = 'sap_horizon'
   */
  theme: string;

  /**
   * The list of active feature toggles to be passed to the web-component-based micro frontend. <br><br>
   * Type: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>
   * @since 1.0.0
   * @type {Array<string>}
   * @kind member
   * @memberof LuigiContainer
   * @example myContainer.activeFeatureToggleList = ["enable-foo", "allow-bar"]
   * @example <luigi-container viewurl="/index.html" active-feature-toggle-list='["enable-foo", "allow-bar"]'></luigi-container>
   */
  activeFeatureToggleList: string[];

  /**
   * If set to true, skips third party cookie check. <br><br>
   * Type: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
   * @since 1.4.0
   * @type {Boolean}
   * @kind member
   * @memberof LuigiContainer
   * @example <luigi-container viewurl="/index.html" skipCookieCheck></luigi-container>
   * @example myContainer.skipCookieCheck = true
   */
  skipCookieCheck: boolean;

  /**
   * If set to true, skips handshake and ready event is fired immediately. <br><br>
   * Type: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
   * @since 1.0.0
   * @type {Boolean}
   * @kind member
   * @memberof LuigiContainer
   * @example <luigi-container viewurl="/index.html" skipInitCheck></luigi-container>
   * @example myContainer.skipInitCheck = true
   */
  skipInitCheck: boolean;

  /**
   * The parameters to be passed to the web-component-based micro frontend. <br><br>
   * Type: [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
   * @since 1.0.0
   * @type {Object}
   * @kind member
   * @memberof LuigiContainer
   * @example <luigi-container viewurl="/index.html" node-params='{"node":"param"}'></luigi-container>
   * @example myContainer.nodeParams = {foo: bar}
   */
  nodeParams: object;

  /**
   * If set to true, the Luigi container webcomponent will not use the shadow DOM for rendering. <br><br>
   * Type: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
   * @since 1.2.0
   * @type {Boolean}
   * @kind member
   * @memberof LuigiContainer
   * @example <luigi-container viewurl="/index.html" no-shadow></luigi-container>
   * @example myContainer.noShadow = true
   */
  noShadow: boolean;

  /**
   * The search parameters to be passed to the web-component-based micro frontend. <br><br>
   * Type: [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
   * @since 1.0.0
   * @type {Object}
   * @kind member
   * @memberof LuigiContainer
   * @example <luigi-container viewurl="/index.html" search-params='{"search":"param"}'></luigi-container>
   * @example myContainer.searchParams = {foo: bar}
   */
  searchParams: object;

  /**
   * The path parameters to be passed to the web-component-based micro frontend. <br><br>
   * Type: [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
   * @since 1.0.0
   * @type {Object}
   * @kind member
   * @memberof LuigiContainer
   * @example <luigi-container viewurl="/index.html" path-params='{"path":"param"}'></luigi-container>
   * @example myContainer.pathParams = {foo: "bar"}
   */
  pathParams: object;

  /**
   * The clientPermissions to be passed to the web-component-based micro frontend. <br><br>
   * Type: [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
   * @since 1.0.0
   * @type {Object}
   * @kind member
   * @memberof LuigiContainer
   * @example <luigi-container viewurl="/index.html" client-permissions='{"permission": "adminGroup"}'></luigi-container>
   * @example myContainer.clientPermissions = {permission: "adminGroup"}
   */
  clientPermissions: object;

  /**
   * The user settings to be passed to the web-component-based micro frontend. <br><br>
   * Type: [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
   * @since 1.0.0
   * @type {Object}
   * @kind member
   * @memberof LuigiContainer
   * @example <luigi-container viewurl="/index.html" user-settings='{"language": "de", "theme":"sap_horizon"}'></luigi-container>
   * @example myContainer.userSettings = {language: 'de', theme: 'sap_horizon'}
   */
  userSettings: object;

  /**
   * The anchor value to be passed to the web-component-based micro frontend. <br><br>
   * Type: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
   * @since 1.0.0
   * @type {String}
   * @kind member
   * @memberof LuigiContainer
   * @example <luigi-container viewurl="/index.html" anchor='#foo'></luigi-container>
   * @example myContainer.anchor = '#foo'
   */
  anchor: string;

  /**
   * The list of rules for the content in the iframe, managed by the HTML `allow` attribute.
   * You can use one or more rules by adding them to the array, for example allowRules: ["microphone", "camera"]. <br><br>
   * Type: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>
   * @since 1.2.0
   * @type {Array<string>}
   * @kind member
   * @memberof LuigiContainer
   * @example <luigi-container viewurl="/index.html" allow-rules='["microphone", "camera"]'></luigi-container>
   * @example containerElement.allowRules = ['microphone', 'camera']
   */
  allowRules: string[];

  /**
   * The list of rules for the content in the iframe, managed by the HTML `sandbox` attribute.
   * You can use one or more rules by adding them to the array, for example sandboxRules: ["allow-scripts", "allow-same-origin"]. <br><br>
   * Type: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>
   * @since 1.2.0
   * @type {Array<string>}
   * @kind member
   * @memberof LuigiContainer
   * @example <luigi-container viewurl="/index.html" sandbox-rules='["allow-scripts", "allow-same-origin"]'></luigi-container>
   * @example containerElement.sandboxRules = ['allow-modals', 'allow-popups']
   */
  sandboxRules: string[];

  /**
   * The document title value to be passed to the web-component-based micro frontend. <br><br>
   * Type: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
   * @since 1.2.0
   * @type {String}
   * @kind member
   * @memberof LuigiContainer
   * @example <luigi-container viewurl="/index.html" document-title='Luigi App'></luigi-container>
   * @example myContainer.documentTitle = 'Luigi App'
   */
  documentTitle: string;

  /**
   * The hasBack value to be passed to the web-component-based micro frontend.
   * It indicates that there is one or more preserved views. Useful when you need to show a back button. <br><br>
   * Type: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
   * @since 1.2.0
   * @type {Boolean}
   * @kind member
   * @memberof LuigiContainer
   * @example <luigi-container viewurl="/index.html" has-back></luigi-container>
   * @example myContainer.hasBack = true
   */
  hasBack: boolean;

  /**
   * The dirty status value to be passed to the web-component-based micro frontend.
   * It's used to indicate that there are unsaved changes when navigating away. <br><br>
   * Type: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
   * @since 1.2.0
   * @type {Boolean}
   * @kind member
   * @memberof LuigiContainer
   * @example <luigi-container viewurl="/index.html" dirty-status></luigi-container>
   * @example myContainer.dirtyStatus = true
   */
  dirtyStatus: boolean;

  /**
   * The authData value to be passed to the iframe-based micro frontend. <br><br>
   * Type: [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
   * @since 1.2.0
   * @type {Object}
   * @kind member
   * @memberof LuigiContainer
   */
  authData: object;

  /**
   * Function that updates the context of the microfrontend.
   * @param {Object} contextObj - the context data
   * @param {Object} internal - internal luigi legacy data used for iframes
   * @since 1.0.0
   * @memberof LuigiContainer
   * @example containerElement.updateContext({newContextData: 'some data'})
   * @returns {void} no explicit return type
   */
  updateContext(contextObj: object, internal?: object): void {};

  /**
   * Send a custom message to the microfronted.
   * @param {String} id - a string containing the message id
   * @param {Object} data - data to be sent alongside the custom message
   * @since 1.0.0
   * @memberof LuigiContainer
   * @example containerElement.sendCustomMessage('my-message-id', {dataToSend: 'some data'})
   * @returns {void} no explicit return type
   */
  sendCustomMessage(id: string, data?: object): void {};

  /**
   * A function that notifies the microfrontend that the opened alert has been closed.
   * This function is deprecated, please use `notifyAlertClosed`.
   * @param {String} id - the id of the opened alert
   * @param {String} dismissKey - the key specifying which dismiss link was clicked on the alert message (optional)
   * @since 1.0.0
   * @memberof LuigiContainer
   * @example containerElement.closeAlert('my-alert-id', 'my-dismiss-key')
   * @returns {void} no explicit return type
   * @deprecated this is deprecated
   */
  closeAlert(id: string, dismissKey?: string): void {};

  /**
   * A function that notifies the microfrontend that the opened alert has been closed.
   * @param {String} id - the id of the opened alert
   * @param {String} dismissKey - the key specifying which dismiss link was clicked on the alert message (optional)
   * @since 1.6.0
   * @memberof LuigiContainer
   * @example containerElement.notifyAlertClosed('my-alert-id', 'my-dismiss-key')
   * @returns {void} no explicit return type
   */
  notifyAlertClosed(id: string, dismissKey?: string): void {};

  /**
   * A function that notifies the microfrontend that the opened confirmation modal has been closed.
   * @param {boolean} result - the output of the opened confirmation modal (true/false)
   * @since 1.7.0
   * @memberof LuigiContainer
   * @example containerElement.notifyConfirmationModalClosed(true)
   * @returns {void} no explicit return type
   */
  notifyConfirmationModalClosed(result: boolean): void {};

  /**
   * Updates route of the microfrontend by sending a message to the iframe that sets new view URL.
   * @param {string} viewurl - new view URL
   * @param {Object} internal - Luigi legacy data (optional)
   * @since 1.5.0
   * @memberof LuigiContainer
   * @returns {void} no explicit return type
   */
  updateViewUrl(viewurl: string, internal?: object): void {};

  /**
   * Manually triggers the micro frontend rendering process when using defer-init attribute.
   * @since 1.0.0
   * @memberof LuigiContainer
   * @example containerElement.init()
   * @returns {void} no explicit return type
   */
  init(): void {};
}
