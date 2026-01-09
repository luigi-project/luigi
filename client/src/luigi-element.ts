import { Options } from '../luigi-element';

/**
 * Base class for Luigi web component micro frontends.
 * @augments HTMLElement
 * @class
 */
export class LuigiElement extends HTMLElement {
  private deferLuigiClientWCInit: boolean;
  private LuigiClient!: any;
  private luigiConfig!: Record<string, any>;
  private _shadowRoot: ShadowRoot;
  private __initialized: boolean;
  private __lui_ctx!: Record<string, any>;

  constructor(options: Options) {
    super();

    const openShadow: boolean = options.openShadow || false;

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
  __postProcess(ctx: Record<string, any>, luigiClient: any, module_location_path: string): void {
    this.LuigiClient = luigiClient;
    this.context = ctx;

    const template: HTMLTemplateElement = document.createElement('template');

    template.innerHTML = this.render(ctx);

    const attCnt = (): void => {
      if (this.__initialized) {
        return;
      }

      this._shadowRoot.appendChild(template.content.cloneNode(true));
      Reflect.ownKeys(Reflect.getPrototypeOf(this) as any).forEach((el: string | symbol) => {
        if (typeof el === 'string' && el.startsWith('$_')) {
          // @ts-ignore
          this._shadowRoot[el] = this[el].bind(this);
        }
      });

      const elementsWithIds: NodeListOf<Element> = this._shadowRoot.querySelectorAll('[id]');

      if (elementsWithIds) {
        elementsWithIds.forEach((el: Element) => {
          // @ts-ignore
          this['$' + el.getAttribute('id')] = el;
        });
      }
      this.afterInit(ctx);
      this.__initialized = true;
    };

    if (this.luigiConfig && this.luigiConfig['styleSources']?.length) {
      let nr_styles: number = this.luigiConfig['styleSources'].length;
      const loadStylesSync: boolean = this.luigiConfig['loadStylesSync'];
      const afterLoadOrError = (): void => {
        nr_styles--;

        if (nr_styles < 1) {
          attCnt();
        }
      };

      this.luigiConfig['styleSources']?.forEach((element: string) => {
        const link: HTMLLinkElement = document.createElement('link');

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
   * @param {any} ctx - the context object passed by luigi core
   */
  afterInit(ctx: Record<string, any>): void {
    return;
  }

  /**
   * Override to return the html template string defining the web component view.
   * @param {any} ctx - the context object passed by luigi core
   */
  render(ctx: Record<string, any>): string {
    return '';
  }

  /**
   * Override to execute logic after an attribute of this web component has changed.
   */
  update(): void {
    return;
  }

  /**
   * Override to execute logic when a new context object is set.
   * @param {any} ctx - the new context object passed by luigi core
   */
  onContextUpdate(ctx: Record<string, any>): void {
    return;
  }

  /**
   * Query selector operating on shadow root.
   * @see ParentNode.querySelector
   */
  override querySelector(selector: string): HTMLElement | null {
    return this._shadowRoot.querySelector(selector);
  }

  /**
   * Handles changes on the context property.
   * @private
   */
  set context(ctx: Record<string, any>) {
    this.__lui_ctx = ctx;

    if (this.__initialized) {
      this.onContextUpdate(ctx);
      this.attributeChangedCallback();
    }
  }

  get context(): Record<string, any> {
    return this.__lui_ctx;
  }

  /**
   * Handles changes on attributes.
   * @private
   */
  attributeChangedCallback(name?: string, oldVal?: any, newVal?: any): void {
    this.update();
  }
}

/**
 * Html string processing according to luigi functionality.
 * Also useful in combination with LitElement VS Code plugins.
 * @param {string} literal - the literal to process
 * @param {unknown[]} keys - the array of keys to process
 * @returns {string} the processed literal
 */
export function html(literal: TemplateStringsArray, ...keys: unknown[]): string {
  let html: string = '';

  literal?.forEach((el: string, index: number) => {
    html += el;

    if (index < keys.length && keys[index] !== undefined && keys[index] !== null) {
      html += keys[index];
    }
  });

  return html.replace(/\$\_/gi, 'this.getRootNode().$_');
}
