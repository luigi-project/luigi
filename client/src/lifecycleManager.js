import { LuigiClientBase } from './baseClass';
import { helpers } from './helpers';

/**
 * Use the functions and parameters to define the Lifecycle of listeners, navigation nodes, and Event data.
 * @name Lifecycle
 */
class LifecycleManager extends LuigiClientBase {
  /** @private */
  constructor() {
    super();
    this.luigiInitialized = false;
    this.defaultContextKeys = ['context', 'internal', 'nodeParams', 'pathParams', 'searchParams'];
    this.setCurrentContext(
      this.defaultContextKeys.reduce(function (acc, key) {
        acc[key] = {};
        return acc;
      }, {})
    );

    this._onContextUpdatedFns = {};
    this._onInactiveFns = {};
    this._onInitFns = {};
    this.authData = {};

    if (!this._isDeferInitDefined()) {
      this.luigiClientInit();
    }
  }

  /**
   * Check if the html head element contains the attribute "defer-luigi-init"
   * @private
   * @memberof Lifecycle
   */
  _isDeferInitDefined() {
    return window.document.head.hasAttribute('defer-luigi-init');
  }

  /**
   * Check if the html head element contains the attribute "disable-tpc-check"
   * @private
   * @memberof Lifecycle
   */
  _isTpcCheckDisabled() {
    return (
      window.document.head.hasAttribute('disable-tpc-check') ||
      this.currentContext?.internal?.thirdPartyCookieCheck?.disabled
    );
  }

  /**
   * Check if LuigiClient is initialized
   * @returns {boolean} client initialized state
   * @since 1.12.0
   * @memberof Lifecycle
   * @example
   * const init = LuigiClient.isLuigiClientInitialized()
   */
  isLuigiClientInitialized() {
    return this.luigiInitialized;
  }

  /**
   * Starts the handshake with Luigi Core and thereafter results in initialization of Luigi Client. It is always ran by default when importing the Luigi Client package in your micro frontend. Note that when using `defer-luigi-init` to defer default initialization, you will need to initialize the handshake using this function manually wherever needed.
   * @since 1.12.0
   * @memberof Lifecycle
   * @example
   * LuigiClient.luigiClientInit()
   */
  luigiClientInit() {
    if (this.luigiInitialized) {
      console.warn('Luigi Client has been already initialized');
      return;
    }
    /**
     * Save context data every time navigation to a different node happens
     * @private
     */
    const setContext = (rawData) => {
      for (let index = 0; index < this.defaultContextKeys.length; index++) {
        let key = this.defaultContextKeys[index];
        try {
          if (typeof rawData[key] === 'string') {
            rawData[key] = JSON.parse(rawData[key]);
          }
        } catch (e) {
          console.info('unable to parse luigi context data for', key, rawData[key], e);
        }
      }
      this.setCurrentContext(rawData);
    };

    const setAuthData = (eventPayload) => {
      if (eventPayload) {
        this.authData = eventPayload;
      }
    };

    helpers.addEventListener('luigi.init', (e) => {
      setContext(e.data);
      setAuthData(e.data.authData);
      helpers.setLuigiCoreDomain(e.origin);
      this.luigiInitialized = true;
      this._notifyInit(e.origin);
      this._tpcCheck();
      helpers.sendPostMessageToLuigiCore({ msg: 'luigi.init.ok' });
    });

    helpers.addEventListener('luigi-client.inactive-microfrontend', (e) => {
      this._notifyInactive(e.origin);
    });

    helpers.addEventListener('luigi.auth.tokenIssued', (e) => {
      setAuthData(e.data.authData);
    });

    helpers.addEventListener('luigi.navigate', (e) => {
      setContext(e.data);
      if (!this.currentContext.internal.isNavigateBack && !this.currentContext.withoutSync) {
        const previousHash = window.location.hash;
        history.replaceState({ luigiInduced: true }, '', e.data.viewUrl);
        window.dispatchEvent(new PopStateEvent('popstate', { state: 'luiginavigation' }));
        if (window.location.hash !== previousHash) {
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        }
      }
      // pass additional data to context to enable micro frontend developer to act on internal routing change
      if (this.currentContext.withoutSync) {
        Object.assign(this.currentContext.context, {
          viewUrl: e.data.viewUrl ? e.data.viewUrl : undefined,
          pathParams: e.data.pathParams ? e.data.pathParams : undefined
        });
      }
      // execute the context change listener if set by the micro frontend
      this._notifyUpdate();
      helpers.sendPostMessageToLuigiCore({ msg: 'luigi.navigate.ok' });
    });

    /**
     * Get context once initially
     * @private
     */
    window.parent.postMessage(
      {
        msg: 'luigi.get-context',
        clientVersion: require('../public/package.json').version
      },
      '*'
    );
  }

  _tpcCheck() {
    if (this._isTpcCheckDisabled()) {
      return;
    }

    let tpc = 'enabled';
    let cookies = document.cookie;
    let luigiCookie;
    if (cookies) {
      luigiCookie = cookies
        .split(';')
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie === 'luigiCookie=true');
    }
    if (luigiCookie === 'luigiCookie=true') {
      document.cookie = 'luigiCookie=; Max-Age=-99999999; SameSite=None; Secure';
    }
    document.cookie = 'luigiCookie=true; SameSite=None; Secure';
    cookies = document.cookie;
    if (cookies) {
      luigiCookie = cookies
        .split(';')
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie === 'luigiCookie=true');
    }
    if (luigiCookie === 'luigiCookie=true') {
      document.cookie = 'luigiCookie=; Max-Age=-99999999; SameSite=None; Secure';
      window.parent.postMessage({ msg: 'luigi.third-party-cookie', tpc }, '*');
    } else {
      tpc = 'disabled';
      window.parent.postMessage({ msg: 'luigi.third-party-cookie', tpc }, '*');
      console.warn('Third party cookies are not supported!');
    }
  }

  /**
   * Iterates over an object and executes all top-level functions
   * with a given payload.
   * @private
   * @memberof Lifecycle
   */
  _callAllFns(objWithFns, payload, origin) {
    for (let id in objWithFns) {
      if (objWithFns.hasOwnProperty(id) && helpers.isFunction(objWithFns[id])) {
        objWithFns[id](payload, origin);
      }
    }
  }

  /**
   * Notifies all context init listeners.
   * @private
   * @memberof Lifecycle
   */
  _notifyInit(origin) {
    this._callAllFns(this._onInitFns, this.currentContext.context, origin);
  }

  /**
   * Notifies all context update listeners.
   * @private
   * @memberof Lifecycle
   */
  _notifyUpdate() {
    this._callAllFns(this._onContextUpdatedFns, this.currentContext.context);
  }

  /**
   * Notifies all inactive listeners.
   * @private
   * @memberof Lifecycle
   */
  _notifyInactive() {
    this._callAllFns(this._onInactiveFns);
  }

  /**
   * @private
   * @memberof Lifecycle
   */
  setCurrentContext(value) {
    this.currentContext = value;
  }

  /**
   * Registers a listener called with the context object and the Luigi Core domain as soon as Luigi is instantiated. Defer your application bootstrap if you depend on authentication data coming from Luigi.
   * @param {Lifecycle~initListenerCallback} initFn the function that is called once Luigi is initialized, receives current context and origin as parameters
   * @param {boolean} disableTpcCheck if set to `true` third party cookie check will be disabled via LuigiClient.
   * @memberof Lifecycle
   * @example
   * const initListenerId = LuigiClient.addInitListener((context) => storeContextToMF(context))
   */
  addInitListener(initFn, disableTpcCheck) {
    const id = helpers.getRandomId();
    this._onInitFns[id] = initFn;
    if (disableTpcCheck) {
      document.head.setAttribute('disable-tpc-check', '');
    }
    if (this.luigiInitialized && helpers.isFunction(initFn)) {
      initFn(this.currentContext.context, helpers.getLuigiCoreDomain());
    }
    return id;
  }

  /**
   * Callback of the addInitListener
   * @callback Lifecycle~initListenerCallback
   * @param {Object} context current context data
   * @param {string} origin Luigi Core URL
   */
  /**
   * Removes an init listener.
   * @param {string} id the id that was returned by the `addInitListener` function.
   * @memberof Lifecycle
   * @example
   * LuigiClient.removeInitListener(initListenerId)
   */
  removeInitListener(id) {
    if (this._onInitFns[id]) {
      this._onInitFns[id] = undefined;
      return true;
    }
    return false;
  }

  /**
   * Registers a listener called with the context object when the URL is changed. For example, you can use this when changing environments in a context switcher in order for the micro frontend to do an API call to the environment picked.
   * @param {function} contextUpdatedFn the listener function called each time Luigi context changes
   * @memberof Lifecycle
   * @example
   * const updateListenerId = LuigiClient.addContextUpdateListener((context) => storeContextToMF(context))
   */
  addContextUpdateListener(contextUpdatedFn) {
    const id = helpers.getRandomId();
    this._onContextUpdatedFns[id] = contextUpdatedFn;
    if (this.luigiInitialized && helpers.isFunction(contextUpdatedFn)) {
      contextUpdatedFn(this.currentContext.context);
    }
    return id;
  }

  /**
   * Removes a context update listener.
   * @param {string} id the id that was returned by the `addContextUpdateListener` function
   * @memberof Lifecycle
   * @example
   * LuigiClient.removeContextUpdateListener(updateListenerId)
   */
  removeContextUpdateListener(id) {
    if (this._onContextUpdatedFns[id]) {
      this._onContextUpdatedFns[id] = undefined;
      return true;
    }
    return false;
  }

  /**
   * Registers a listener called upon micro frontend inactivity. This happens when a new micro frontend gets shown while keeping the old one cached.
   * Gets called when:
   * - navigating with **preserveView**
   * - navigating from or to a **viewGroup**
   *
   * Does not get called when navigating normally, or when `openAsModal` or `openAsSplitView` are used.
   * Once the micro frontend turns back into active state, the `addContextUpdateListener` receives an updated context.
   * @param {function} inactiveFn the listener function called each time a micro frontend turns into an inactive state
   * @memberof Lifecycle
   * @example
   * LuigiClient.addInactiveListener(() => mfIsInactive = true)
   * const inactiveListenerId = LuigiClient.addInactiveListener(() => mfIsInactive = true)
   */
  addInactiveListener(inactiveFn) {
    const id = helpers.getRandomId();
    this._onInactiveFns[id] = inactiveFn;
    return id;
  }

  /**
   * Removes a listener for inactive micro frontends.
   * @param {string} id the id that was returned by the `addInactiveListener` function
   * @memberof Lifecycle
   * @example
   * LuigiClient.removeInactiveListener(inactiveListenerId)
   */
  removeInactiveListener(id) {
    if (this._onInactiveFns[id]) {
      this._onInactiveFns[id] = undefined;
      return true;
    }
    return false;
  }

  /**
   * Registers a listener called when the micro frontend receives a custom message.
   * @param {string} customMessageId the custom message id
   * @param {Lifecycle~customMessageListenerCallback} customMessageListener the function that is called when the micro frontend receives the corresponding event
   * @memberof Lifecycle
   * @since 0.6.2
   * @example
   * const customMsgId = LuigiClient.addCustomMessageListener('myapp.project-updated', (data) => doSomething(data))
   */
  addCustomMessageListener(customMessageId, customMessageListener) {
    return helpers.addEventListener(customMessageId, (customMessage, listenerId) => {
      return customMessageListener(customMessage, listenerId);
    });
  }

  /**
   * Callback of the customMessageListener
   * @callback Lifecycle~customMessageListenerCallback
   * @param {Object} customMessage custom message object
   * @param {string} customMessage.id message id
   * @param {*} customMessage.MY_DATA_FIELD any other message data field
   * @param {string} listenerId custom message listener id to be used for unsubscription
   */
  /**
   * Removes a custom message listener.
   * @param {string} id the id that was returned by the `addInitListener` function
   * @memberof Lifecycle
   * @since 0.6.2
   * @example
   * LuigiClient.removeCustomMessageListener(customMsgId)
   */
  removeCustomMessageListener(id) {
    return helpers.removeEventListener(id);
  }

  /**
   * Returns the currently valid access token.
   * @returns {string} current access token
   * @memberof Lifecycle
   * @example
   * const accessToken = LuigiClient.getToken()
   */
  getToken() {
    return this.authData.accessToken;
  }

  /**
   * Returns the context object. Typically it is not required as the {@link #addContextUpdateListener addContextUpdateListener()} receives the same values.
   * @returns {Object} current context data
   * @memberof Lifecycle
   * @example
   * const context = LuigiClient.getContext()
   */
  getContext() {
    return this.getEventData();
  }

  /**
   * Returns the context object. It is an alias function for getContext().
   * @returns {Object} current context data
   * @memberof Lifecycle
   * @deprecated
   */
  getEventData() {
    return this.currentContext.context;
  }

  /**
   * Returns a list of active feature toggles
   * @returns {Array} a list of feature toggle names
   * @memberof Lifecycle
   * @since 1.4.0
   * @example
   * const activeFeatureToggleList = LuigiClient.getActiveFeatureToggles()
   */
  getActiveFeatureToggles() {
    return this.currentContext.internal.activeFeatureToggleList ?? [];
  }

  /**
   * Sets node parameters in Luigi Core. The parameters will be added to the URL.
   * @param {Object} params
   * @param {boolean} keepBrowserHistory
   * @memberof Lifecycle
   * @example
   * LuigiClient.addNodeParams({luigi:'rocks'}, true);
   */
  addNodeParams(params, keepBrowserHistory = true) {
    if (params) {
      helpers.sendPostMessageToLuigiCore({
        msg: 'luigi.addNodeParams',
        data: params,
        keepBrowserHistory
      });
    }
  }

  /**
   * Returns the node parameters of the active URL.
   * Node parameters are defined like URL query parameters but with a specific prefix allowing Luigi to pass them to the micro frontend view. The default prefix is **~** and you can use it in the following way: `https://my.luigi.app/home/products?~sort=asc&~page=3`.
   * <!-- add-attribute:class:warning -->
   * > **NOTE:** some special characters (`<`, `>`, `"`, `'`, `/`) in node parameters are HTML-encoded.
   * @param {boolean} shouldDesanitise defines whether the specially encoded characters should be desanitised
   * @returns {Object} node parameters, where the object property name is the node parameter name without the prefix, and its value is the value of the node parameter. For example `{sort: 'asc', page: 3}`
   * @memberof Lifecycle
   * @example
   * const nodeParams = LuigiClient.getNodeParams()
   * const nodeParams = LuigiClient.getNodeParams(true)
   */
  getNodeParams(shouldDesanitise = false) {
    return shouldDesanitise
      ? helpers.deSanitizeParamsMap(this.currentContext.nodeParams)
      : this.currentContext.nodeParams;
  }

  /**
   * Returns the dynamic path parameters of the active URL.
   * Path parameters are defined by navigation nodes with a dynamic **pathSegment** value starting with **:**, such as **productId**.
   * All path parameters in the current navigation path (as defined by the active URL) are returned.
   * <!-- add-attribute:class:warning -->
   * > **NOTE:** some special characters (`<`, `>`, `"`, `'`, `/`) in path parameters are HTML-encoded.
   * @returns {Object} path parameters, where the object property name is the path parameter name without the prefix, and its value is the actual value of the path parameter. For example ` {productId: 1234, ...}`
   * @memberof Lifecycle
   * @example
   * const pathParams = LuigiClient.getPathParams()
   */
  getPathParams() {
    return this.currentContext.pathParams;
  }

  /**
   * Read search query parameters which are sent from Luigi Core
   * @memberof Lifecycle
   * @returns Core search query parameters
   * @example
   * LuigiClient.getCoreSearchParams();
   */
  getCoreSearchParams() {
    return this.currentContext.searchParams || {};
  }

  /**
   * <!-- label-success: Web App API only  -->
   * Sends search query parameters to Luigi Core. The search parameters will be added to the URL if they are first allowed on a node level using {@link navigation-parameters-reference.md#clientpermissionsurlparameters clientPermissions.urlParameters}.

   * @param {Object} searchParams
   * @param {boolean} keepBrowserHistory
   * @memberof Lifecycle
   * @example
   * LuigiClient.addCoreSearchParams({luigi:'rocks'}, false);
   */
  addCoreSearchParams(searchParams, keepBrowserHistory = true) {
    if (searchParams) {
      helpers.sendPostMessageToLuigiCore({
        msg: 'luigi.addSearchParams',
        data: searchParams,
        keepBrowserHistory
      });
    }
  }

  /**
   * Returns the current client permissions as specified in the navigation node or an empty object. For details, see [Node parameters](navigation-parameters-reference.md).
   * @returns {Object} client permissions as specified in the navigation node
   * @memberof Lifecycle
   * @example
   * const permissions = LuigiClient.getClientPermissions()
   */
  getClientPermissions() {
    return this.currentContext.internal.clientPermissions || {};
  }

  /**
   * <!-- label-success: Web App API only  -->
   * When the micro frontend is not embedded in the Luigi Core application and there is no init handshake you can set the target origin that is used in postMessage function calls by Luigi Client. Typically used only in custom micro-frontend frameworks that are compatible with LuigiClient API.
   * @param {string} origin target origin
   * @memberof Lifecycle
   * @since 0.7.3
   * @example
   * LuigiClient.setTargetOrigin(window.location.origin)
   */
  setTargetOrigin(origin) {
    helpers.setTargetOrigin(origin);
  }

  /**
   * <!-- label-success: Web App API only  -->
   * Sends a custom message to the Luigi Core application.
   * @param {Object} message an object containing data to be sent to the Luigi Core to process it further. This object is set as an input parameter of the custom message listener on the Luigi Core side
   * @param {string} message.id a string containing the message id
   * @param {*} message.MY_DATA_FIELD any other message data field
   * @example
   * LuigiClient.sendCustomMessage({id: 'environment.created', production: false})
   * LuigiClient.sendCustomMessage({id: 'environment.created', data: environmentDataObj})
   * @memberof Lifecycle
   * @since 0.6.2
   */
  sendCustomMessage(message) {
    const customMessageInternal = helpers.convertCustomMessageUserToInternal(message);
    helpers.sendPostMessageToLuigiCore(customMessageInternal);
  }

  /**
   * Returns the current user settings based on the selected node.
   * @returns {Object} current user settings
   * @since 1.7.1
   * @memberof Lifecycle
   * @example
   * const userSettings = LuigiClient.getUserSettings()
   */
  getUserSettings() {
    return this.currentContext.internal.userSettings;
  }

  /**
   * Returns the current anchor based on active URL.
   * @memberof Lifecycle
   * @since 1.21.0
   * @returns anchor of URL
   * @example
   * LuigiClient.getAnchor();
   */
  getAnchor() {
    return this.currentContext.internal.anchor || '';
  }

  /**
   * Sends anchor to Luigi Core. The anchor will be added to the URL.
   * @param {string} anchor
   * @since 1.21.0
   * @memberof Lifecycle
   * @example
   * LuigiClient.setAnchor('luigi');
   */
  setAnchor(anchor) {
    helpers.sendPostMessageToLuigiCore({
      msg: 'luigi.setAnchor',
      anchor
    });
  }

  /**
   * This function allows you to change node labels within the same {@link navigation-advanced.md#view-groups view group}, e.g. in your node config: `label: 'my Node {viewGroupData.vg1}'`.
   * @since 2.2.0
   * @param {Object} data a data object containing the view group name and desired label
   * @memberof Lifecycle
   * @example LuigiClient.setViewGroupData({'vg1':' Luigi rocks!'})
   */
  setViewGroupData(data) {
    helpers.sendPostMessageToLuigiCore({
      msg: 'luigi.setVGData',
      data
    });
  }
}
export const lifecycleManager = new LifecycleManager();
