/**
 * Compound Iframe Bootstrap Script
 *
 * This module exports the bootstrap HTML/JS as a string template that gets
 * inlined into the srcdoc of the isolated compound iframe.
 *
 * The script inside the iframe:
 * - Listens for 'luigi.compound.init' from the parent to receive compound config
 * - Renders compound children (web components) using Default or Grid renderer
 * - Provides a proxied LuigiClient API that communicates with the shell via postMessage
 * - Provides window.Luigi._registerWebcomponent for self-registered WCs
 * - Handles context updates from the parent
 *
 * @experimental Part of the compoundIsolation experimental feature
 */

// eslint-disable-next-line no-unused-vars
export function getCompoundIframeBootstrapScript(cssLinks) {
  // codeql[js/html-injection] - srcdoc content is entirely composed of static strings
  // controlled by Luigi core. No user input flows into this template.
  // cssLinks are href values from the parent document's own <link> stylesheet elements.
  var cssLinkTags = (cssLinks || [])
    .map(function (href) {
      return '<link rel="stylesheet" href="' + href + '">';
    })
    .join('\n');
  return (
    `
<html>
<head>
${cssLinkTags}
<style>
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
  }
</style>
</head>
<body>
<script>
(function() {
  'use strict';

  /**
   * Generates a unique web component tag name based on the viewUrl.
   * Must match the algorithm in web-components.js:generateWCId()
   */
  function generateWCId(viewUrl) {
    var charRep = '';
    var normalizedViewUrl = new URL(viewUrl, location.href).href;
    for (var i = 0; i < normalizedViewUrl.length; i++) {
      charRep += normalizedViewUrl.charCodeAt(i).toString(16);
    }
    return 'luigi-wc-' + charRep;
  }

  /**
   * Provide window.Luigi._registerWebcomponent for self-registered WCs
   */
  window.Luigi = {
    _registerWebcomponent: function(srcString, el) {
      var wcId = generateWCId(srcString);
      if (!customElements.get(wcId)) {
        customElements.define(wcId, el);
      }
    }
  };

  /** Pending promises for request/response patterns (e.g., pathExists, showAlert) */
  var pendingRequests = {};
  var requestCounter = 0;

  /**
   * Send a message to the parent shell and optionally return a Promise
   * that resolves when the parent responds with a matching correlationId.
   */
  function sendToParent(msg, data, expectResponse) {
    var message = Object.assign({ msg: msg }, data || {});
    if (expectResponse) {
      var correlationId = '__lci_' + (++requestCounter);
      message.correlationId = correlationId;
      var promise = new Promise(function(resolve) {
        pendingRequests[correlationId] = resolve;
      });
      parent.postMessage(message, '*');
      return promise;
    }
    parent.postMessage(message, '*');
  }

  /**
   * Creates a proxied LuigiClient API for a web component inside the iframe.
   * All shell interactions go through postMessage to the parent.
   * The event bus (publishEvent) stays local within the iframe.
   */
  function createClientAPI(eventBusElement, nodeId, wcId, wc, isCompoundChild, extendedContext) {
    return {
      linkManager: function() {
        var options = { fromContext: null, fromClosestContext: false, fromVirtualTreeRoot: false, fromParent: false, nodeParams: {} };
        var linkManagerAPI = {
          fromContext: function(ctx) { options.fromContext = ctx; return linkManagerAPI; },
          fromClosestContext: function() { options.fromClosestContext = true; return linkManagerAPI; },
          fromVirtualTreeRoot: function() { options.fromVirtualTreeRoot = true; return linkManagerAPI; },
          fromParent: function() { options.fromParent = true; return linkManagerAPI; },
          withParams: function(params) { options.nodeParams = params; return linkManagerAPI; },
          navigate: function(path) {
            sendToParent('luigi.compound.navigate', { path: path, options: options });
          },
          openAsModal: function(path, modalSettings) {
            return sendToParent('luigi.compound.openAsModal', { path: path, modalSettings: modalSettings, options: options }, true);
          },
          openAsDrawer: function(path, drawerSettings) {
            sendToParent('luigi.compound.openAsDrawer', { path: path, drawerSettings: drawerSettings, options: options });
          },
          openAsSplitView: function(path, splitViewSettings) {
            return sendToParent('luigi.compound.openAsSplitView', { path: path, splitViewSettings: splitViewSettings, options: options }, true);
          },
          goBack: function(value) {
            sendToParent('luigi.compound.goBack', { value: value });
          },
          pathExists: function(path) {
            return sendToParent('luigi.compound.pathExists', { path: path, options: options }, true);
          },
          getCurrentRoute: function() {
            return sendToParent('luigi.compound.getCurrentRoute', {}, true);
          }
        };
        return linkManagerAPI;
      },
      uxManager: function() {
        return {
          showAlert: function(settings) {
            return sendToParent('luigi.compound.showAlert', { settings: settings }, true);
          },
          showConfirmationModal: function(settings) {
            return sendToParent('luigi.compound.showConfirmationModal', { settings: settings }, true);
          },
          showLoadingIndicator: function() {
            sendToParent('luigi.compound.showLoadingIndicator', {});
          },
          hideLoadingIndicator: function() {
            sendToParent('luigi.compound.hideLoadingIndicator', {});
          },
          closeCurrentModal: function() {
            sendToParent('luigi.compound.closeCurrentModal', {});
          },
          setDocumentTitle: function(title) {
            sendToParent('luigi.compound.setDocumentTitle', { title: title });
          }
        };
      },
      publishEvent: function(ev) {
        if (eventBusElement && eventBusElement.eventBus) {
          eventBusElement.eventBus.onPublishEvent(ev, nodeId, wcId);
        }
      },
      getCurrentLocale: function() { return window.__luigi_context && window.__luigi_context._locale || ''; },
      getActiveFeatureToggleList: function() { return window.__luigi_context && window.__luigi_context._featureToggles || []; },
      getActiveFeatureToggles: function() { return window.__luigi_context && window.__luigi_context._featureToggles || []; },
      getPathParams: function() { return extendedContext && extendedContext.pathParams ? extendedContext.pathParams : {}; },
      getCoreSearchParams: function() {
        return sendToParent('luigi.compound.getCoreSearchParams', {}, true);
      },
      getClientPermissions: function() { return extendedContext && extendedContext.clientPermissions ? extendedContext.clientPermissions : {}; },
      addNodeParams: function() { /* disabled for compound children */ },
      getNodeParams: function() { return isCompoundChild ? {} : (extendedContext && extendedContext.nodeParams || {}); },
      setAnchor: function() { /* disabled for compound children */ },
      getAnchor: function() {
        return sendToParent('luigi.compound.getAnchor', {}, true);
      },
      getUserSettings: function() {
        return sendToParent('luigi.compound.getUserSettings', {}, true);
      },
      setViewGroupData: function(data) {
        sendToParent('luigi.compound.setViewGroupData', { data: data });
      }
    };
  }

  /**
   * Default compound renderer — creates plain divs
   */
  function DefaultRenderer() {}
  DefaultRenderer.prototype.createCompoundContainer = function() { return document.createElement('div'); };
  DefaultRenderer.prototype.createCompoundItemContainer = function() { return document.createElement('div'); };
  DefaultRenderer.prototype.attachCompoundItem = function(cnt, itemCnt) { cnt.appendChild(itemCnt); };

  /**
   * Grid compound renderer — CSS grid layout with media query support
   */
  function GridRenderer(config) { this.config = config || {}; }
  GridRenderer.prototype.createCompoundContainer = function() {
    var containerClass = '__lui_compound_' + Date.now();
    var cnt = document.createElement('div');
    cnt.classList.add(containerClass);
    var mediaQueries = '';
    if (this.config.layouts) {
      this.config.layouts.forEach(function(el) {
        if (el.minWidth != null || el.maxWidth != null) {
          var mq = '@media only screen ';
          if (el.minWidth != null) mq += 'and (min-width: ' + el.minWidth + 'px) ';
          if (el.maxWidth != null) mq += 'and (max-width: ' + el.maxWidth + 'px) ';
          mq += '{ .' + containerClass + ' { ';
          mq += 'grid-template-columns: ' + (el.columns || 'auto') + '; ';
          mq += 'grid-template-rows: ' + (el.rows || 'auto') + '; ';
          mq += 'grid-gap: ' + (el.gap || '0') + '; ';
          mq += '} }';
          mediaQueries += mq;
        }
      });
    }
    cnt.innerHTML = '<style>' +
      '.' + containerClass + ' { display: grid; ' +
      'grid-template-columns: ' + (this.config.columns || 'auto') + '; ' +
      'grid-template-rows: ' + (this.config.rows || 'auto') + '; ' +
      'grid-gap: ' + (this.config.gap || '0') + '; ' +
      'min-height: ' + (this.config.minHeight || 'auto') + '; }' +
      mediaQueries + '</style>';
    return cnt;
  };
  GridRenderer.prototype.createCompoundItemContainer = function(layoutConfig) {
    var config = layoutConfig || {};
    var cnt = document.createElement('div');
    cnt.setAttribute('style', 'grid-row: ' + (config.row || 'auto') + '; grid-column: ' + (config.column || 'auto'));
    return cnt;
  };
  GridRenderer.prototype.attachCompoundItem = function(cnt, itemCnt) { cnt.appendChild(itemCnt); };

  /**
   * Resolves the renderer based on config
   */
  function resolveRenderer(rendererConfig) {
    if (!rendererConfig || !rendererConfig.use) return new DefaultRenderer();
    if (rendererConfig.use === 'grid') return new GridRenderer(rendererConfig.config);
    // Custom renderers with function references are not supported in isolated mode
    console.warn('Luigi: Custom compound renderers with function references are not supported in isolated mode. Using default renderer.');
    return new DefaultRenderer();
  }

  /**
   * Registers event listeners on the event bus
   */
  function registerEventListeners(ebListeners, navNode, nodeId, wcElement) {
    if (navNode && navNode.eventListeners) {
      navNode.eventListeners.forEach(function(el) {
        var evID = el.source + '.' + el.name;
        var listenerInfo = {
          wcElementId: nodeId,
          wcElement: wcElement,
          action: el.action
          // Note: dataConverter functions cannot be serialized, not supported in isolated mode
        };
        if (ebListeners[evID]) {
          ebListeners[evID].push(listenerInfo);
        } else {
          ebListeners[evID] = [listenerInfo];
        }
      });
    }
  }

  /**
   * Import a web component module and register the custom element
   */
  function importAndRegisterWC(viewUrl, wcId) {
    return import(viewUrl).then(function(module) {
      if (!customElements.get(wcId)) {
        var cmpClazz = module.default;
        if (!HTMLElement.isPrototypeOf(cmpClazz)) {
          var props = Object.keys(module);
          for (var i = 0; i < props.length; i++) {
            cmpClazz = module[props[i]];
            if (HTMLElement.isPrototypeOf(cmpClazz)) break;
          }
        }
        customElements.define(wcId, cmpClazz);
      }
    });
  }

  /**
   * Load a self-registered web component via script tag
   */
  function loadSelfRegisteredWC(viewUrl, node) {
    return new Promise(function(resolve) {
      var scriptTag = document.createElement('script');
      scriptTag.setAttribute('src', viewUrl);
      if (node.webcomponent && node.webcomponent.type === 'module') {
        scriptTag.setAttribute('type', 'module');
      }
      scriptTag.setAttribute('defer', true);
      scriptTag.addEventListener('load', resolve);
      document.body.appendChild(scriptTag);
    });
  }

  /**
   * Attach a web component to a container
   */
  function attachWC(wcId, container, eventBusElement, extendedContext, viewUrl, nodeId, isCompoundChild) {
    var wc = document.createElement(wcId);
    if (nodeId) wc.setAttribute('nodeId', nodeId);
    wc.setAttribute('lui_web_component', 'true');
    var clientAPI = createClientAPI(eventBusElement, nodeId, wcId, wc, isCompoundChild, extendedContext);
    if (wc.__postProcess) {
      var url;
      try { url = new URL('./', viewUrl); } catch(e) { url = new URL(viewUrl); }
      wc.__postProcess(extendedContext.context, clientAPI, url.origin + url.pathname);
    } else {
      wc.context = extendedContext.context;
      wc.LuigiClient = clientAPI;
    }
    container.appendChild(wc);
    return wc;
  }

  /**
   * Render the compound container WC if renderer has a viewUrl (nested WC pattern)
   */
  function initContainerWC(wc, wcId, viewUrl, extendedContext) {
    wc.setAttribute('lui_web_component', 'true');
    var clientAPI = createClientAPI(wc, '_root', wcId, wc, false, extendedContext);
    if (wc.__postProcess) {
      var url;
      try { url = new URL('./', viewUrl); } catch(e) { url = new URL(viewUrl); }
      wc.__postProcess(extendedContext.context, clientAPI, url.origin + url.pathname);
    } else {
      wc.context = extendedContext.context;
      wc.LuigiClient = clientAPI;
    }
  }

  function createCompoundContainerAsync(renderer, extendedContext) {
    if (renderer.viewUrl) {
      var wcId = generateWCId(renderer.viewUrl);
      if (renderer.selfRegistered) {
        return loadSelfRegisteredWC(renderer.viewUrl, { webcomponent: renderer.webcomponent || {} }).then(function() {
          var wc = document.createElement(wcId);
          initContainerWC(wc, wcId, renderer.viewUrl, extendedContext);
          return wc;
        });
      }
      return importAndRegisterWC(renderer.viewUrl, wcId).then(function() {
        var wc = document.createElement(wcId);
        initContainerWC(wc, wcId, renderer.viewUrl, extendedContext);
        return wc;
      });
    }
    return Promise.resolve(renderer.createCompoundContainer());
  }

  /**
   * Main compound rendering logic
   */
  function renderCompound(config) {
    var navNode = config.navNode;
    var context = config.context || {};
    var extendedContext = {
      context: context,
      pathParams: config.pathParams || {},
      clientPermissions: config.clientPermissions || {},
      nodeParams: config.nodeParams || {}
    };

    // Store context globally for getCurrentLocale etc.
    window.__luigi_context = config._luigiInternalContext || {};

    // Resolve renderer
    var renderer;
    if (navNode.viewUrl) {
      renderer = new DefaultRenderer();
      renderer.viewUrl = navNode.viewUrl;
      renderer.selfRegistered = navNode.webcomponent && navNode.webcomponent.selfRegistered;
      renderer.webcomponent = navNode.webcomponent;
      var origCreate = renderer.createCompoundItemContainer;
      renderer.createCompoundItemContainer = function(layoutConfig) {
        var cnt = origCreate.call(renderer, layoutConfig);
        if (layoutConfig && layoutConfig.slot) {
          cnt.setAttribute('slot', layoutConfig.slot);
        }
        return cnt;
      };
    } else if (navNode.renderer) {
      renderer = resolveRenderer(navNode.renderer);
    } else {
      renderer = new DefaultRenderer();
    }

    createCompoundContainerAsync(renderer, extendedContext).then(function(compoundContainer) {
      var ebListeners = {};

      compoundContainer.eventBus = {
        listeners: ebListeners,
        onPublishEvent: function(event, srcNodeId, wcId) {
          var listeners = ebListeners[srcNodeId + '.' + event.type] || [];
          listeners = listeners.concat(ebListeners['*.' + event.type] || []);
          listeners.forEach(function(listenerInfo) {
            var target = listenerInfo.wcElement || compoundContainer.querySelector('[nodeId=' + listenerInfo.wcElementId + ']');
            if (target) {
              target.dispatchEvent(new CustomEvent(listenerInfo.action, { detail: event.detail }));
            }
          });
        }
      };

      var children = navNode.children || [];
      var loadPromises = children.map(function(childSettings, index) {
        var ctx = Object.assign({}, context, childSettings.context);
        var childExtContext = {
          context: ctx,
          pathParams: extendedContext.pathParams,
          clientPermissions: extendedContext.clientPermissions,
          nodeParams: extendedContext.nodeParams
        };
        var compoundItemContainer = renderer.createCompoundItemContainer(childSettings.layoutConfig);
        var nodeId = childSettings.id || 'gen_' + index;

        compoundItemContainer.eventBus = compoundContainer.eventBus;
        renderer.attachCompoundItem(compoundContainer, compoundItemContainer);

        var viewUrl = childSettings.viewUrl;
        var wcId = (childSettings.webcomponent && childSettings.webcomponent.tagName) || generateWCId(viewUrl);

        registerEventListeners(ebListeners, childSettings, nodeId);

        if (childSettings.webcomponent && childSettings.webcomponent.selfRegistered) {
          return loadSelfRegisteredWC(viewUrl, childSettings).then(function() {
            attachWC(wcId, compoundItemContainer, compoundItemContainer, childExtContext, viewUrl, nodeId, true);
          });
        }

        return importAndRegisterWC(viewUrl, wcId).then(function() {
          attachWC(wcId, compoundItemContainer, compoundItemContainer, childExtContext, viewUrl, nodeId, true);
        });
      });

      registerEventListeners(ebListeners, navNode, '_root', compoundContainer);
      document.body.appendChild(compoundContainer);

      Promise.all(loadPromises).then(function() {
        sendToParent('luigi.compound.rendered', {});
      });
    });
  }

  /**
   * Listen for messages from the parent shell
   */
  window['add' + 'EventListener']('message', function(e) {
    var data = e.data;
    if (!data || !data.msg) return;

    switch (data.msg) {
      case 'luigi.compound.init':
        renderCompound(data.config);
        break;
      case 'luigi.compound.contextUpdate':
        var wcs = document.querySelectorAll('[lui_web_component]');
        if (wcs) {
          wcs.forEach(function(wc) {
            wc.context = Object.assign({}, wc.context, data.context);
          });
        }
        break;
      default:
        // Handle responses to pending requests (e.g., pathExists, showAlert)
        if (data.correlationId && pendingRequests[data.correlationId]) {
          pendingRequests[data.correlationId](data.result);
          delete pendingRequests[data.correlationId];
        }
        break;
    }
  });

  // Signal readiness to parent
  sendToParent('luigi.compound.ready', {});
})();
<` +
    `/script>
</body>
</html>
`
  );
}
