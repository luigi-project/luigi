// Type definitions for Luigi Client web components

export declare interface ConfirmationModalSettings {
  body?: string;
  buttonConfirm?: string | boolean;
  buttonDismiss?: string;
  header?: string;
  type?: string;
}

export declare interface ModalSettings {
  closebtn_data_testid?: string;
  height?: string;
  keepPrevious?: boolean;
  size?: 'fullscreen' | 'l' | 'm' | 's';
  title?: string;
  width?: string;
}

export declare interface SplitViewSettings {
  collapsed?: boolean;
  size?: number;
  title?: string;
}

export type SplitViewEvents = 'close' | 'collapse' | 'expand' | 'resize';

export declare interface SplitViewInstance {
  collapse: () => void;
  exists: () => boolean;
  expand: () => void;
  getSize: () => number;
  isCollapsed: () => boolean;
  isExpanded: () => boolean;
  on: (key: SplitViewEvents, callback: () => void) => string;
  setSize: (value: number) => void;
}

export declare interface DrawerSettings {
  backdrop?: boolean;
  header?: any;
  overlap?: boolean;
  size?: 'l' | 'm' | 's' | 'xs';
}

export declare interface AlertSettings {
  closeAfter?: number;
  links?: {
    [key: string]: { text: string; url?: string; dismissKey?: string };
  };
  text?: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export declare interface NodeParams {
  [key: string]: string;
}

export declare interface UserSettings {
  [key: string]: number | string | boolean;
}

/**
 * Returns the anchor of active URL.
 * @returns {String} the anchor string
 * @memberof Lifecycle
 * @example
 * LuigiClient.getAnchor();
 */
export function getAnchor(): String;
export type getAnchor = () => String;

/**
 * Returns the current user settings.
 * @returns {Object} current user settings
 * @memberof Lifecycle
 */
export function getUserSettings(): UserSettings;
export type getUserSettings = () => UserSettings;

/**
 * Allows you to change node labels within the same view group, e.g. in your node config: `label: 'my Node {viewGroupData.vg1}'`.
 * @param {Object} value a data object containing the view group name and desired label
 * @memberof Lifecycle
 * @example
 * LuigiClient.setViewGroupData({'vg1':' Luigi rocks!'})
 */
export function setViewGroupData(value: Object): void;
export type setViewGroupData = (value: Object) => void;

export declare interface UxManager {
  /**
   * Gets the current theme.
   * @returns {*} current themeObj
   * @memberof uxManager
   */
  getCurrentTheme: () => any;

  /**
   * Gets the dirty status, which is set by the Client.
   * @returns {boolean} dirty status
   * @memberof uxManager
   */
  getDirtyStatus: () => boolean;

  /**
   * Removes the backdrop.
   * @memberof uxManager
   */
  removeBackdrop: () => void;

  /**
   * Hides the app loading indicator.
   * @memberof uxManager
   */
  hideAppLoadingIndicator: () => void;

  /**
   * Shows an alert.
   * @memberof uxManager
   * @param {Object} settings the settings for the alert
   * @param {string} settings.text the content of the alert. To add a link to the content, you have to set up the link in the `links` object. The key(s) in the `links` object must be used in the text to reference the links, wrapped in curly brackets with no spaces. If you don't specify any text, the alert is not displayed
   * @param {('info'|'success'|'warning'|'error')} settings.type sets the type of alert
   * @param {Object} settings.links provides links data
   * @param {Object} settings.links.LINK_KEY object containing the data for a particular link. To properly render the link in the alert message refer to the description of the **settings.text** parameter
   * @param {string} settings.links.LINK_KEY.text text which replaces the link identifier in the alert content
   * @param {string} settings.links.LINK_KEY.url URL to navigate when you click the link. Currently, only internal links are supported in the form of relative or absolute paths
   * @param {string} settings.links.LINK_KEY.dismissKey dismissKey which represents the key of the link.
   * @param {number} settings.closeAfter (optional) time in milliseconds that tells Luigi when to close the Alert automatically. If not provided, the Alert will stay on until closed manually. It has to be greater than `100`
   * @returns {promise} which is resolved when the alert is dismissed
   * @example
   * import LuigiClient from '@luigi-project/client';
   * const settings = {
   *  text: "Ut enim ad minim veniam, {goToHome} quis nostrud exercitation ullamco {relativePath}. Duis aute irure dolor {goToOtherProject} or {neverShowItAgain}",
   *  type: 'info',
   *  links: {
   *    goToHome: { text: 'homepage', url: '/overview' },
   *    goToOtherProject: { text: 'other project', url: '/projects/pr2' },
   *    relativePath: { text: 'relative hide side nav', url: 'hideSideNav' },
   *    neverShowItAgain: { text: 'Never show it again', dismissKey: 'neverShowItAgain' }
   *  },
   *  closeAfter: 3000
   * }
   * LuigiClient
   *  .uxManager()
   *  .showAlert(settings)
   *  .then(() => {
   *     // Logic to execute when the alert is dismissed
   *  });
   */
  showAlert: (settings: AlertSettings) => Promise<Object>;

  /**
   * Shows a confirmation modal.
   * @memberof uxManager
   * @param {Object} settings the settings of the confirmation modal. If you don't provide any value for any of the fields, a default value is used
   * @param {string} [settings.header="Confirmation"] the content of the modal header
   * @param {string} [settings.body="Are you sure you want to do this?"] the content of the modal body
   * @param {string} [settings.buttonConfirm="Yes"] the label for the modal confirm button
   * @param {string} [settings.buttonDismiss="No"] the label for the modal dismiss button
   * @returns {promise} which is resolved when accepting the confirmation modal and rejected when dismissing it
   * @example
   * import LuigiClient from '@luigi-project/client';
   * const settings = {
   *  header: "Confirmation",
   *  body: "Are you sure you want to do this?",
   *  buttonConfirm: "Yes",
   *  buttonDismiss: "No"
   * }
   * LuigiClient
   *  .uxManager()
   *  .showConfirmationModal(settings)
   *  .then(() => {
   *     // Logic to execute when the confirmation modal is dismissed
   *  });
   */
  showConfirmationModal: (settings: ConfirmationModalSettings) => Promise<void>;

  /**
   * Set the document title
   * @memberof UX
   * @param {string} documentTitle
   * @since 1.4.0
   * @example LuigiClient.uxManager().setDocumentTitle('Luigi');
   */
  setDocumentTitle: (documentTitle: string) => void;

  /**
   * Get the document title
   * @memberof UX
   * @since 1.4.0
   * @returns a string, which is displayed in the tab.
   * @example LuigiClient.uxManager().getDocumentTitle();
   */
  getDocumentTitle: () => string;

  /**
   * Set the collapsed state of the left side navigation
   * @memberof UX
   * @param {boolean} state
   * @since 1.5.0
   */
  collapseLeftSideNav: (state: boolean) => void;

  /**
   * Open user settings dialog
   * @memberof UX
   * @since 1.7.1
   */
  openUserSettings: () => void;

  /**
   * Close user settings dialog
   * @memberof UX
   * @since 1.7.1
   */
  closeUserSettings: () => void;
}

export declare interface LinkManager {
  /**
   * Refreshes top navigation badge counters by rendering the navigation again.
   * @memberof linkManager
   * @example
   * LuigiClient.linkManager().updateTopNavigation();
   */
  updateTopNavigation: () => void;

  /**
   * Navigates to the given path in the application. It contains either a full absolute path or a relative path without a leading slash that uses the active route as a base. This is the standard navigation.
   * @memberof LuigiNavigation
   * @param {string} path path to be navigated to
   * @param {boolean} preserveView preserve a view by setting it to `true`. It keeps the current view opened in the background and opens the new route in a new frame. Use the {@link #goBack goBack()} function to navigate back. You can use this feature across different levels. Preserved views are discarded as soon as you use the standard {@link #navigate navigate()} function instead of {@link #goBack goBack()}
   * @param {Object} modalSettings opens a view in a modal. Use these settings to configure the modal's title and size
   * @param {string} modalSettings.title modal title. By default, it is the node label. If there is no label, it is left empty
   * @param {('fullscreen'|'l'|'m'|'s')} [modalSettings.size="l"] size of the modal
   * @param {string} modalSettings.width updates the `width` of the modal. Allowed units are 'px', '%', 'rem', 'em', 'vh' and 'vw'.
   * @param {string} modalSettings.height updates the `height` of the modal. Allowed units are 'px', '%', 'rem', 'em', 'vh' and 'vw'.
   * @param {boolean} modalSettings.keepPrevious Lets you open multiple modals. Keeps the previously opened modal and allows to open another modal on top of the previous one. By default the previous modals are discarded.
   * @param {string} modalSettings.closebtn_data_testid lets you specify a `data_testid` for the close button. Default value is `lui-modal-index-0`. If multiple modals are opened the index will be increased per modal.
   * @param {Object} splitViewSettings opens a view in a split view. Use these settings to configure the split view's behaviour
   * @param {string} splitViewSettings.title split view title. By default, it is the node label. If there is no label, it is left empty
   * @param {number} [splitViewSettings.size=40] height of the split view in percent
   * @param {boolean} [splitViewSettings.collapsed=false] opens split view in collapsed state
   * @param {Object} drawerSettings opens a view in a drawer. Use these settings to configure if the drawer has a header, backdrop and size.
   * @param {any} drawerSettings.header By default, the header is visible. The default title is the node label, but the header could also be an object with a `title` attribute allowing you to specify your own title.  An 'x' icon is displayed to close the drawer view.
   * @param {boolean} drawerSettings.backdrop By default, it is set to `false`. If it is set to `true` the rest of the screen has a backdrop.
   * @param {('l'|'m'|'s'|'xs')} [drawerSettings.size="s"] size of the drawer
   * @example
   * LuigiClient.linkManager().navigate('/overview')
   * LuigiClient.linkManager().navigate('users/groups/stakeholders')
   * LuigiClient.linkManager().navigate('/settings', null, true) // preserve view
   */
  navigate: (
    path: string,
    preserveView?: boolean,
    modalSettings?: ModalSettings,
    splitViewSettings?: SplitViewSettings,
    drawerSettings?: DrawerSettings
  ) => void;

  /**
   * Offers an alternative way of navigating with intents. This involves specifying a semanticSlug and an object containing
   * parameters.
   * This method internally generates a URL of the form `#?intent=<semantic object>-<action>?<param_name>=<param_value>` through the given
   * input arguments. This then follows a call to the original `linkManager.navigate(...)` function.
   * Consequently, the following calls shall have the exact same effect:
   * - linkManager().navigateToIntent('Sales-settings', {project: 'pr2', user: 'john'})
   * - linkManager().navigate('/#?intent=Sales-settings?project=pr2&user=john')
   * @memberof LuigiNavigation
   * @param {string} semanticSlug concatenation of semantic object and action connected with a dash (-), i.e.: `<semanticObject>-<action>`
   * @param {Object} params an object representing all the parameters passed, i.e.: `{param1: '1', param2: 2, param3: 'value3'}`.
   * @example
   * LuigiClient.linkManager().navigateToIntent('Sales-settings', {project: 'pr2', user: 'john'})
   * LuigiClient.linkManager().navigateToIntent('Sales-settings')
   */
  navigateToIntent: (semanticSlug: string, params?: Object) => void;

  /**
   * Opens a view in a modal. You can specify the modal's title and size. If you do not specify the title, it is the node label. If there is no node label, the title remains empty.  The default size of the modal is `l`, which means 80%. You can also use `m` (60%) and `s` (40%) to set the modal size. Optionally, use it in combination with any of the navigation functions.
   * @memberof linkManager
   * @param {string} path navigation path
   * @param {Object} [modalSettings] opens a view in a modal. Use these settings to configure the modal's title and size
   * @param {string} modalSettings.title modal title. By default, it is the node label. If there is no label, it is left empty
   * @param {('fullscreen'|'l'|'m'|'s')} [modalSettings.size="l"] size of the modal
   * @param {string} modalSettings.width updates the `width` of the modal. Allowed units are 'px', '%', 'rem', 'em', 'vh' and 'vw'.
   * @param {string} modalSettings.height updates the `height` of the modal. Allowed units are 'px', '%', 'rem', 'em', 'vh' and 'vw'.
   * @param {boolean} modalSettings.keepPrevious Lets you open multiple modals. Keeps the previously opened modal and allows to open another modal on top of the previous one. By default the previous modals are discarded.
   * @param {string} modalSettings.closebtn_data_testid lets you specify a `data_testid` for the close button. Default value is `lui-modal-index-0`. If multiple modals are opened the index will be increased per modal.
   * @param {Function} onCloseCallback callback function called upon closing the opened modal
   * @example
   * LuigiClient.linkManager().openAsModal('projects/pr1/users', {title:'Users', size:'m'});
   */
  openAsModal: (nodepath: string, modalSettings?: ModalSettings, onCloseCallback?: Function) => void;

  /**
   * Opens a view in a split view. You can specify the split view's title and size. If you don't specify the title, it is the node label. If there is no node label, the title remains empty. The default size of the split view is 40, which means 40% height of the split view.
   * @memberof linkManager
   * @param {string} path navigation path
   * @param {Object} splitViewSettings opens a view in a split view. Use these settings to configure the split view's behaviour
   * @param {string} splitViewSettings.title split view title. By default, it is the node label. If there is no label, it is left empty
   * @param {number} [splitViewSettings.size=40] height of the split view in percent
   * @param {boolean} [splitViewSettings.collapsed=false] opens split view in collapsed state
   * @returns {Object} an instance of the SplitView. It provides functions to control its behavior.
   * @see {@link https://docs.luigi-project.io/docs/luigi-client-api?section=splitview|SplitView Client} for further documentation. These methods from the Client SplitView are also implemented for Luigi Core: `close`, `collapse`, `expand`, `isCollapsed`, `isExpanded`, `exists`
   *
   * @since 0.7.6
   * @example
   * LuigiClient.linkManager().openAsSplitView('projects/pr1/users', {title:'Users', size:'40'});
   */
  openAsSplitView: (path: string, splitViewSettings?: SplitViewSettings) => SplitViewInstance;

  /**
   * Opens a view in a drawer. You can specify if the drawer has a header, if a backdrop is active in the background and configure the size of the drawer. By default the header is shown. The backdrop is not visible and has to be activated. The size of the drawer is by default set to `s` which means 25% of the micro frontend size. You can also use `l`(75%), `m`(50%) or `xs`(15.5%). Optionally, use it in combination with any of the navigation functions.
   * @memberof linkManager
   * @param {string} path navigation path
   * @param {Object} [drawerSettings] opens a view in a drawer. Use these settings to configure if the drawer has a header, backdrop and size.
   * @param {any} drawerSettings.header By default, the header is visible. Title is node label and 'x' is displayed to close the drawer view. The header could also be an object with a `title` attribute to specify an own title for the drawer component.
   * @param {boolean} drawerSettings.backdrop By default, it is set to `false`. If it is set to `true` the rest of the screen has a backdrop.
   * @param {('l'|'m'|'s'|'xs')} [drawerSettings.size="s"] size of the drawer
   * @since 1.6.0
   * @example
   * LuigiClient.linkManager().openAsDrawer('projects/pr1/drawer', {header:true, backdrop:true, size:'s'});
   * LuigiClient.linkManager().openAsDrawer('projects/pr1/drawer', {header:{title:'My drawer component'}, backdrop:true, size:'xs'});
   */
  openAsDrawer: (nodepath: string, drawerSettings?: DrawerSettings) => void;

  /**
   * Sets the current navigation context to that of a specific parent node which has the {@link navigation-configuration.md navigationContext} field declared in the navigation configuration. This navigation context is then used by the `navigate` function.
   * @memberof linkManager
   * @param {string} navigationContext
   * @returns {linkManager} link manager instance
   * @example
   * LuigiClient.linkManager().fromContext('project').navigate('/settings')
   */
  fromContext: (navigationContext: string) => this;

  /**
   * Enables navigating to sibling nodes without knowing the absolute path
   * @memberof linkManager
   * @returns {linkManager} link manager instance
   * @example
   * LuigiClient.linkManager().fromParent().navigate('/sibling')
   */
  fromParent: () => this;

  /**
   * Sets the current navigation context which is then used by the `navigate` function. This has to be a parent navigation context, it is not possible to use the child navigation contexts.
   * @memberof linkManager
   * @returns {linkManager} link manager instance
   * @example
   * LuigiClient.linkManager().fromClosestContext().navigate('/users/groups/stakeholders')
   */
  fromClosestContext: () => this;

  /**
   * Sets the current navigation base to the parent node that is defined as virtualTree. This method works only when the currently active micro frontend is inside a virtualTree.
   * @memberof linkManager
   * @returns {linkManager} link manager instance
   * @since 1.0.1
   * @example
   * LuigiClient.linkManager().fromVirtualTreeRoot().navigate('/users/groups/stakeholders')
   */
  fromVirtualTreeRoot: () => this;

  /**
   * Sends node parameters to the route. The parameters are used by the `navigate` function. Use it optionally in combination with any of the navigation functions and receive it as part of the context object in Luigi Client.
   * @memberof linkManager
   * @param {Object} nodeParams
   * @returns {linkManager} link manager instance
   * @example
   * LuigiClient.linkManager().withParams({foo: "bar"}).navigate("path")
   *
   * // Can be chained with context setting functions such as:
   * LuigiClient.linkManager().fromContext("currentTeam").withParams({foo: "bar"}).navigate("path")
   */
  withParams: (nodeParams: NodeParams) => this;

  /** @lends linkManager */
  /**
   * Checks if the path you can navigate to exists in the main application. For example, you can use this helper method conditionally to display a DOM element like a button.
   * @memberof linkManager
   * @param {string} path path which existence you want to check
   * @returns {promise} a promise which resolves to a Boolean variable specifying whether the path exists or not
   * @example
   *  let pathExists;
   *  LuigiClient
   *  .linkManager()
   *  .pathExists('projects/pr2')
   *  .then(
   *    (pathExists) => {  }
   *  );
   */
  pathExists: (path: string) => Promise<boolean>;

  /**
   * Discards the active view and navigates back to the last visited view. Works with preserved views, and also acts as the substitute of the browser **back** button. **goBackContext** is only available when using preserved views.
   * @memberof linkManager
   * @param {any} goBackValue data that is passed in the **goBackContext** field to the last visited view when using preserved views
   * @example
   * LuigiClient.linkManager().goBack({ foo: 'bar' });
   * LuigiClient.linkManager().goBack(true);
   */
  goBack: (goBackValue: any) => this;

  /**
   * Checks if there is one or more preserved views. You can use it to show a **back** button.
   * @memberof linkManager
   * @returns {boolean} indicating if there is a preserved view you can return to
   */
  hasBack: () => boolean;

  /**
   * Gets the luigi route associated with the current micro frontend.
   * @returns {promise} a promise which resolves to a String value specifying the current luigi route
   * @since NEXTRELEASE
   * @example
   * LuigiClient.linkManager().getCurrentRoute();
   */
  getCurrentRoute: () => Promise<string>;
}

export declare interface Options {
  /**
   *
   *if `true` shadowRoot mode is "open" otherwise shadowRoot mode is "closed".
   */
  openShadow: boolean;

  /**
   * if `true` LuigiClient initialization will be defered, until `LuigiClient.luigiClientInit()` will be called.
   */
  deferLuigiClientWCInit: boolean;
}

/**
 * Html string processing according to luigi functionality.
 * Also useful in combination with LitElement VS Code plugins.
 *
 * @param {String} literal The literal to process.
 * @returns {String} Returns the processed literal.
 */
export declare const html: (strings: TemplateStringsArray, ...keys: unknown[]) => string;

export interface LuigiClient {
  /**
   * @returns {Object} node parameters, where the object property name is the node parameter name without the prefix, and its value is the value of the node parameter. For example `{sort: 'asc', page: 3}`
   * @memberof LuigiClient
   */
  getActiveFeatureToggles: () => Array<String>;
  /**
   * Gets the current locale.
   * @returns {string} current locale
   * @memberof LuigiClient
   */
  getCurrentLocale: () => string;
  linkManager: () => LinkManager;
  uxManager: () => UxManager;
  publishEvent: (event: Event) => void;
  /**
   * Sets node parameters in Luigi Core. The parameters will be added to the URL.
   * @param {Object} params
   * @param {boolean} keepBrowserHistory
   * @memberof LuigiClient
   */
  addNodeParams: (params: Object, keepBrowserHistory: boolean) => void;
  /**
   * Returns the node parameters of the active URL.
   * Node parameters are defined like URL query parameters but with a specific prefix allowing Luigi to pass them to the micro frontend view. The default prefix is **~** and you can use it in the following way: `https://my.luigi.app/home/products?~sort=asc&~page=3`.
   * <!-- add-attribute:class:warning -->
   * > **NOTE:** some special characters (`<`, `>`, `"`, `'`, `/`) in node parameters are HTML-encoded.
   * @param {boolean} shouldDesanitise defines whether the specially encoded characters should be desanitised
   * @returns {Object} node parameters, where the object property name is the node parameter name without the prefix, and its value is the value of the node parameter. For example `{sort: 'asc', page: 3}`
   * @memberof LuigiClient
   */
  getNodeParams: (shouldDesanitise: boolean) => Object;
  /**
   * Sends anchor to Luigi Core. The anchor will be added to the URL.
   * @param {string} anchor
   * @memberof LuigiClient
   */
  setAnchor: (anchor: string) => void;
  /**
   * Retrieves the search params from the active URL
   * @returns {Object} containing the search params
   * @memberof LuigiClient
   */
  getCoreSearchParams: () => Object;
  /**
   * Returns the dynamic path parameters of the active URL.
   * Path parameters are defined by navigation nodes with a dynamic **pathSegment** value starting with **:**, such as **productId**.
   * All path parameters in the current navigation path (as defined by the active URL) are returned.
   * <!-- add-attribute:class:warning -->
   * > **NOTE:** some special characters (`<`, `>`, `"`, `'`, `/`) in path parameters are HTML-encoded.
   * @returns {Object} path parameters, where the object property name is the path parameter name without the prefix, and its value is the actual value of the path parameter. For example ` {productId: 1234, ...}`
   * @memberof LuigiClient
   */
  getPathParams: () => Object;
  /**
   * Returns the current client permissions as specified in the navigation node or an empty object. For details, see [Node parameters](navigation-parameters-reference.md).
   * @returns {Object} client permissions as specified in the navigation node
   * @memberof LuigiClient
   */
  getClientPermissions(): () => Object;
}

export declare class LuigiElement extends HTMLElement {
  private deferLuigiClientWCInit;
  private LuigiClient;
  private luigiConfig;
  private _shadowRoot;
  private __initialized;
  private __lui_ctx;

  constructor(options?: Options);

  /**
   * Invoked by luigi core if present, internal, don't override.
   * @private
   */
  __postProcess(ctx: Record<string, any>, luigiClient: any, module_location_path: string): void;

  /**
   * Override to execute logic after initialization of the web component, i.e.
   * after internal rendering and all context data set.
   *
   * @param {*} ctx The context object passed by luigi core
   */
  afterInit(ctx: Record<string, any>): void;

  /**
   * Override to return the html template string defining the web component view.
   *
   * @param {*} ctx The context object passed by luigi core
   */
  render(ctx: Record<string, any>): string;

  /**
   * Override to execute logic after an attribute of this web component has changed.
   */
  update(): void;

  /**
   * Override to execute logic when a new context object is set.
   *
   * @param {*} ctx The new context object passed by luigi core
   */
  onContextUpdate(ctx: Record<string, any>): void;

  /**
   * Query selector operating on shadow root.
   *
   * @see ParentNode.querySelector
   */
  querySelector(selector: string): HTMLElement | null;

  /**
   * Handles changes on the context property.
   *
   * @private
   */
  set context(ctx: Record<string, any>);
  get context(): Record<string, any>;

  /**
   * Handles changes on attributes.
   *
   * @private
   */
  attributeChangedCallback(name?: string, oldVal?: any, newVal?: any): void;
}
