/**
 * @module luigi-element
 */

/**
 * Base class for Luigi web component micro frontends.
 * @augments HTMLElement
 * @param {any} options - the config object passed in constructor
 * @class
 */
export class LuigiElement extends HTMLElement {
  constructor(options) {
    super();
    const openShadow = options ? options.openShadow : false;
    this._shadowRoot = this.attachShadow({
      mode: openShadow ? 'open' : 'closed',
      delegatesFocus: false
    });
    this.__initialized = false;
    this.deferLuigiClientWCInit = options ? options.deferLuigiClientWCInit : false;
  }

  /**
   * Invoked by luigi core if present, internal, don't override.
   * @private
   */
  __postProcess(ctx, luigiClient, module_location_path) {
    this.LuigiClient = luigiClient;
    this.context = ctx;
    const template = document.createElement('template');
    template.innerHTML = this.render(ctx);
    const attCnt = () => {
      if (!this.__initialized) {
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        Reflect.ownKeys(Reflect.getPrototypeOf(this)).forEach((el) => {
          if (el.startsWith('$_')) {
            this._shadowRoot[el] = this[el].bind(this);
          }
        });
        const elementsWithIds = this._shadowRoot.querySelectorAll('[id]');
        if (elementsWithIds) {
          elementsWithIds.forEach((el) => {
            this['$' + el.getAttribute('id')] = el;
          });
        }
        this.afterInit(ctx);
        this.__initialized = true;
      }
    };
    if (this.luigiConfig && this.luigiConfig.styleSources && this.luigiConfig.styleSources.length > 0) {
      let nr_styles = this.luigiConfig.styleSources.length;
      const loadStylesSync = this.luigiConfig.loadStylesSync;
      const afterLoadOrError = () => {
        nr_styles--;
        if (nr_styles < 1) {
          attCnt();
        }
      };

      this.luigiConfig.styleSources.forEach((element, index) => {
        const link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('href', module_location_path + element);
        if (loadStylesSync) {
          link.addEventListener('load', afterLoadOrError);
          link.addEventListener('error', afterLoadOrError);
        }
        this._shadowRoot.appendChild(link);
      });
      if (!loadStylesSync) {
        attCnt();
      }
    } else {
      attCnt();
    }
  }

  /**
   * Override to execute logic after initialization of the web component, i.e.
   * after internal rendering and all context data set.
   *
   * @param {any} ctx - the context object passed by luigi core
   */
  afterInit(ctx) {
    return;
  }

  /**
   * Override to return the html template string defining the web component view.
   *
   * @param {any} ctx - the context object passed by luigi core
   */
  render(ctx) {
    return '';
  }

  /**
   * Override to execute logic after an attribute of this web component has changed.
   */
  update() {
    return;
  }

  /**
   * Override to execute logic when a new context object is set.
   *
   * @param {any} ctx - the new context object passed by luigi core
   */
  onContextUpdate(ctx) {
    return;
  }

  /**
   * Query selector operating on shadow root.
   * @see ParentNode.querySelector
   */
  querySelector(selector) {
    return this._shadowRoot.querySelector(selector);
  }

  /**
   * Handles changes on the context property.
   *
   * @private
   */
  set context(ctx) {
    this.__lui_ctx = ctx;
    if (this.__initialized) {
      this.onContextUpdate(ctx);
      this.attributeChangedCallback();
    }
  }

  get context() {
    return this.__lui_ctx;
  }

  /**
   * Handles changes on attributes.
   *
   * @private
   */
  attributeChangedCallback(name, oldVal, newVal) {
    this.update();
  }
}

/**
 * Html string processing according to luigi functionality.
 * Also useful in combination with LitElement VS Code plugins.
 *
 * @param {string} literal - the literal to process
 * @param {unknown[]} keys - the array of keys to process
 * @returns {string} the processed literal
 */
export function html(literal, ...keys) {
  let html = '';
  literal.forEach((el, index) => {
    html += el;
    if (index < keys.length && keys[index] !== undefined && keys[index] !== null) {
      html += keys[index];
    }
  });
  return html.replace(/\$\_/gi, 'this.getRootNode().$_');
}
