import { getCompoundIframeBootstrapScript } from './compound-iframe-bootstrap';
import { GenericHelpers, EventListenerHelpers } from '../utilities/helpers';

/**
 * Service for managing isolated compound views rendered inside sandboxed iframes.
 *
 * When compound.isolated is true and settings.experimental.compoundIsolation is enabled,
 * compound web components are rendered inside a sandboxed iframe (sandbox="allow-scripts",
 * without allow-same-origin) for true security isolation.
 *
 * @experimental Part of the compoundIsolation experimental feature
 */
class CompoundIframeSvcClass {
  constructor() {
    /** @type {HTMLIFrameElement|null} */
    this._iframe = null;
    /** @type {Function|null} */
    this._messageHandler = null;
    /** @type {Object} */
    this._pendingConfig = null;
  }

  /**
   * Creates an isolated compound view inside a sandboxed iframe.
   *
   * @param {Object} navNode - navigation node with compound config
   * @param {HTMLElement} iframeContainer - DOM element to insert the iframe into
   * @param {Object} componentData - component data from the store (context, pathParams, etc.)
   */
  createIsolatedCompound(navNode, iframeContainer, componentData) {
    this.cleanup();
    console.log('CompoundIframe: createIsolatedCompound called', navNode, iframeContainer);

    const iframe = document.createElement('iframe');
    iframe.sandbox = 'allow-scripts';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.setAttribute('data-testid', 'luigi-compound-iframe');

    // Build the compound config to send to the iframe
    const config = this._buildIframeConfig(navNode, componentData);
    this._pendingConfig = config;

    // Set up the parent-side message handler
    this._messageHandler = (event) => this._handleMessage(event, iframe);
    EventListenerHelpers.addEventListener('message', this._messageHandler);

    // codeql[js/html-injection] - srcdoc content is a static template from
    // compound-iframe-bootstrap.js. No user input flows into the template.
    // CSS links are collected from the parent document's own stylesheet elements.
    const cssLinks = this._collectCssLinks();
    iframe.srcdoc = getCompoundIframeBootstrapScript(cssLinks);

    // Store reference and insert
    this._iframe = iframe;

    iframeContainer.appendChild(iframe);
  }

  /**
   * Builds the serialized config payload to send to the iframe.
   * Resolves all viewUrls to absolute and strips non-serializable properties.
   */
  _buildIframeConfig(navNode, componentData) {
    const context = componentData.context || {};
    const compound = navNode.compound;

    // Build navNode representation for the iframe (serializable only)
    const iframeNavNode = {
      children: (compound.children || []).map((child) => {
        const resolved = Object.assign({}, child);
        resolved.viewUrl = this._resolveToAbsoluteUrl(child.viewUrl);
        // Strip dataConverter functions from eventListeners (not serializable)
        if (resolved.eventListeners) {
          resolved.eventListeners = resolved.eventListeners.map((el) => ({
            source: el.source,
            name: el.name,
            action: el.action
          }));
        }
        return resolved;
      })
    };

    // Handle renderer
    if (compound.renderer) {
      if (typeof compound.renderer.use === 'string' || !compound.renderer.use) {
        iframeNavNode.renderer = compound.renderer;
      } else {
        console.warn(
          'Luigi: Custom compound renderers with function references are not supported in isolated mode. Using default renderer.'
        );
      }
    }

    // Handle nested WC (viewUrl on the node itself)
    if (navNode.webcomponent && navNode.viewUrl) {
      iframeNavNode.viewUrl = this._resolveToAbsoluteUrl(navNode.viewUrl);
      iframeNavNode.webcomponent = navNode.webcomponent;
    }

    // Handle root-level event listeners
    if (compound.eventListeners) {
      iframeNavNode.eventListeners = compound.eventListeners.map((el) => ({
        source: el.source,
        name: el.name,
        action: el.action
      }));
    }

    return {
      navNode: iframeNavNode,
      context: context,
      pathParams: componentData.pathParams || {},
      clientPermissions: navNode.clientPermissions || {},
      nodeParams: componentData.nodeParams || {},
      _luigiInternalContext: {
        _locale: window.Luigi ? window.Luigi.i18n().getCurrentLocale() : '',
        _featureToggles: window.Luigi ? window.Luigi.featureToggles().getActiveFeatureToggleList() : []
      }
    };
  }

  /**
   * Resolves a potentially relative URL to an absolute URL.
   */
  _resolveToAbsoluteUrl(url) {
    if (!url) return url;
    try {
      return new URL(url, window.location.href).href;
    } catch (e) {
      return url;
    }
  }

  /**
   * Collects absolute hrefs of Luigi-related CSS stylesheets from the parent document.
   * These are injected into the compound iframe so that Fundamental Styles,
   * icon fonts, and Luigi layout CSS are available inside the iframe.
   */
  _collectCssLinks() {
    return Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .map((link) => link.href)
      .filter((href) => href && /luigi[_.].*\.css/i.test(href));
  }

  /**
   * Handles postMessage events from the compound iframe.
   * Routes messages to the appropriate Luigi core API.
   */
  _handleMessage(event, iframe) {
    console.log(
      'CompoundIframe: message received',
      event.data,
      'source match:',
      event.source === iframe?.contentWindow,
      'iframe.contentWindow:',
      iframe?.contentWindow
    );
    if (!iframe || !iframe.contentWindow || event.source !== iframe.contentWindow) {
      return;
    }

    const data = event.data;
    if (!data || !data.msg) return;

    switch (data.msg) {
      case 'luigi.compound.ready':
        // Iframe is ready, send the compound config
        if (this._pendingConfig) {
          iframe.contentWindow.postMessage({ msg: 'luigi.compound.init', config: this._pendingConfig }, '*');
          this._pendingConfig = null;
        }
        break;

      case 'luigi.compound.rendered':
        // Compound rendering complete
        break;

      case 'luigi.compound.navigate':
        if (window.Luigi) {
          const nav = window.Luigi.navigation();
          if (data.options) {
            let lm = nav;
            if (data.options.fromContext) lm = lm.fromContext(data.options.fromContext);
            if (data.options.fromClosestContext) lm = lm.fromClosestContext();
            if (data.options.fromVirtualTreeRoot) lm = lm.fromVirtualTreeRoot();
            if (data.options.fromParent) lm = lm.fromParent();
            if (data.options.nodeParams) lm = lm.withParams(data.options.nodeParams);
            lm.navigate(data.path);
          } else {
            nav.navigate(data.path);
          }
        }
        break;

      case 'luigi.compound.openAsModal':
        if (window.Luigi) {
          window.Luigi.navigation().openAsModal(data.path, data.modalSettings, (value) => {
            this._respond(iframe, data.correlationId, { goBackValue: value });
          });
        }
        break;

      case 'luigi.compound.openAsDrawer':
        if (window.Luigi) {
          window.Luigi.navigation().openAsDrawer(data.path, data.drawerSettings);
        }
        break;

      case 'luigi.compound.openAsSplitView':
        if (window.Luigi) {
          const sv = window.Luigi.navigation().openAsSplitView(data.path, data.splitViewSettings);
          this._respond(iframe, data.correlationId, sv);
        }
        break;

      case 'luigi.compound.goBack':
        if (window.Luigi) {
          window.Luigi.navigation().goBack(data.value);
        }
        break;

      case 'luigi.compound.pathExists':
        if (window.Luigi) {
          window.Luigi.navigation()
            .pathExists(data.path)
            .then((exists) => {
              this._respond(iframe, data.correlationId, exists);
            });
        }
        break;

      case 'luigi.compound.getCurrentRoute':
        if (window.Luigi) {
          const route = window.Luigi.navigation().getCurrentRoute();
          Promise.resolve(route).then((r) => {
            this._respond(iframe, data.correlationId, r);
          });
        }
        break;

      case 'luigi.compound.showAlert':
        if (window.Luigi) {
          window.Luigi.ux()
            .showAlert(data.settings)
            .then((dismissKey) => {
              this._respond(iframe, data.correlationId, dismissKey);
            });
        }
        break;

      case 'luigi.compound.showConfirmationModal':
        if (window.Luigi) {
          window.Luigi.ux()
            .showConfirmationModal(data.settings)
            .then(() => {
              this._respond(iframe, data.correlationId, true);
            })
            .catch(() => {
              this._respond(iframe, data.correlationId, false);
            });
        }
        break;

      case 'luigi.compound.showLoadingIndicator':
        if (window.Luigi) {
          window.Luigi.ux().showLoadingIndicator();
        }
        break;

      case 'luigi.compound.hideLoadingIndicator':
        if (window.Luigi) {
          window.Luigi.ux().hideLoadingIndicator();
        }
        break;

      case 'luigi.compound.closeCurrentModal':
        if (window.Luigi) {
          window.Luigi.ux().closeCurrentModal();
        }
        break;

      case 'luigi.compound.setDocumentTitle':
        if (window.Luigi) {
          window.Luigi.ux().setDocumentTitle(data.title);
        }
        break;

      case 'luigi.compound.getCoreSearchParams':
        if (window.Luigi) {
          const params = window.Luigi.routing().getCoreSearchParams();
          this._respond(iframe, data.correlationId, params);
        }
        break;

      case 'luigi.compound.getAnchor':
        if (window.Luigi) {
          const anchor = window.Luigi.routing().getAnchor();
          this._respond(iframe, data.correlationId, anchor);
        }
        break;

      case 'luigi.compound.getUserSettings':
        if (window.Luigi) {
          window.Luigi.userSettings()
            .getUserSettings()
            .then((settings) => {
              this._respond(iframe, data.correlationId, settings);
            })
            .catch(() => {
              this._respond(iframe, data.correlationId, null);
            });
        }
        break;

      case 'luigi.compound.setViewGroupData':
        // View group data setting requires node reference — not supported in isolated mode
        console.warn('Luigi: setViewGroupData is not supported in isolated compound mode.');
        break;

      default:
        break;
    }
  }

  /**
   * Sends a response back to the iframe for request/response patterns.
   */
  _respond(iframe, correlationId, result) {
    if (iframe && iframe.contentWindow && correlationId) {
      iframe.contentWindow.postMessage({ correlationId: correlationId, result: result }, '*');
    }
  }

  /**
   * Forwards a context update to the compound iframe.
   */
  forwardContextUpdate(ctx) {
    if (this._iframe && this._iframe.contentWindow) {
      this._iframe.contentWindow.postMessage({ msg: 'luigi.compound.contextUpdate', context: ctx }, '*');
    }
  }

  /**
   * Returns true if there is an active isolated compound iframe.
   */
  isActive() {
    return !!this._iframe;
  }

  /**
   * Returns the active compound iframe element, or null.
   */
  getIframe() {
    return this._iframe;
  }

  /**
   * Cleans up the current compound iframe and message handler.
   */
  cleanup() {
    if (this._messageHandler) {
      EventListenerHelpers.removeEventListener('message', this._messageHandler);
      this._messageHandler = null;
    }
    if (this._iframe && this._iframe.parentNode) {
      this._iframe.parentNode.removeChild(this._iframe);
    }
    this._iframe = null;
    this._pendingConfig = null;
  }
}

export const CompoundIframeService = new CompoundIframeSvcClass();
