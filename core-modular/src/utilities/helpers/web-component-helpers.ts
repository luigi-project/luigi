/**
 * Default compound renderer.
 */
class DefaultCompoundRendererClass {
  rendererObject: any;
  config: any;

  constructor(rendererObj?: any) {
    if (rendererObj) {
      this.rendererObject = rendererObj;
      this.config = rendererObj.config || {};
    } else {
      this.config = {};
    }
  }

  createCompoundContainer(): HTMLElement {
    return document.createElement('div');
  }

  createCompoundItemContainer(): HTMLElement {
    return document.createElement('div');
  }

  attachCompoundItem(compoundCnt: HTMLElement, compoundItemCnt: HTMLElement): void {
    compoundCnt.appendChild(compoundItemCnt);
  }
}

export const DefaultCompoundRenderer = DefaultCompoundRendererClass;

/**
 * Compound Renderer for custom rendering as defined in luigi config.
 */
class CustomCompoundRendererClass extends DefaultCompoundRendererClass {
  superRenderer: any;

  constructor(rendererObj?: any) {
    super(rendererObj || { use: {} });
    if (rendererObj?.use?.extends) {
      this.superRenderer = resolveRenderer({
        use: rendererObj.use.extends,
        config: rendererObj.config
      });
    }
  }

  createCompoundContainer(): HTMLElement {
    if (this.rendererObject?.use?.createCompoundContainer) {
      return this.rendererObject.use.createCompoundContainer(this.config, this.superRenderer);
    } else if (this.superRenderer) {
      return this.superRenderer.createCompoundContainer();
    }
    return super.createCompoundContainer();
  }

  createCompoundItemContainer(layoutConfig?: any): HTMLElement {
    if (this.rendererObject?.use?.createCompoundItemContainer) {
      return this.rendererObject.use.createCompoundItemContainer(layoutConfig, this.config, this.superRenderer);
    } else if (this.superRenderer) {
      return this.superRenderer.createCompoundItemContainer(layoutConfig);
    }
    return super.createCompoundItemContainer();
  }

  attachCompoundItem(compoundCnt: HTMLElement, compoundItemCnt: HTMLElement): void {
    if (this.rendererObject?.use?.attachCompoundItem) {
      this.rendererObject.use.attachCompoundItem(compoundCnt, compoundItemCnt, this.superRenderer);
    } else if (this.superRenderer) {
      this.superRenderer.attachCompoundItem(compoundCnt, compoundItemCnt);
    } else {
      super.attachCompoundItem(compoundCnt, compoundItemCnt);
    }
  }
}

export const CustomCompoundRenderer = CustomCompoundRendererClass;

/**
 * Compound Renderer for a css grid compound view.
 */
class GridCompoundRendererClass extends DefaultCompoundRendererClass {
  createCompoundContainer(): HTMLElement {
    const containerClass = '__lui_compound_' + new Date().getTime();
    const compoundCnt = document.createElement('div');
    compoundCnt.classList.add(containerClass);
    let mediaQueries = '';

    if (this.config.layouts) {
      this.config.layouts.forEach((el: any) => {
        if (el.minWidth || el.maxWidth) {
          let mq = '@media only screen ';
          if (el.minWidth != null) {
            mq += `and (min-width: ${el.minWidth}px) `;
          }
          if (el.maxWidth != null) {
            mq += `and (max-width: ${el.maxWidth}px) `;
          }

          mq += `{
            .${containerClass} {
              grid-template-columns: ${el.columns || 'auto'};
              grid-template-rows: ${el.rows || 'auto'};
              grid-gap: ${el.gap || '0'};
            }
          }
          `;
          mediaQueries += mq;
        }
      });
    }

    compoundCnt.innerHTML = /*html*/ `
      <style scoped>
        .${containerClass} {
          display: grid;
          grid-template-columns: ${this.config.columns || 'auto'};
          grid-template-rows: ${this.config.rows || 'auto'};
          grid-gap: ${this.config.gap || '0'};
          min-height: ${this.config.minHeight || 'auto'};
        }
        ${mediaQueries}
      </style>
    `;
    return compoundCnt;
  }

  createCompoundItemContainer(layoutConfig?: any): HTMLElement {
    const config = layoutConfig || {};
    const compoundItemCnt = document.createElement('div');
    compoundItemCnt.setAttribute(
      'style',
      `grid-row: ${config.row || 'auto'}; grid-column: ${config.column || 'auto'}`
    );
    return compoundItemCnt;
  }
}

export const GridCompoundRenderer = GridCompoundRendererClass;

/**
 * Returns the compound renderer class for a given config.
 * If no specific one is found, {DefaultCompoundRenderer} is returned.
 *
 * @param {*} rendererConfig the renderer config object defined in luigi config
 */
export const resolveRenderer = (rendererConfig: any): any => {
  const rendererDef = rendererConfig.use;
  if (!rendererDef) {
    return new DefaultCompoundRenderer(rendererConfig);
  } else if (rendererDef === 'grid') {
    return new GridCompoundRenderer(rendererConfig);
  } else if (
    rendererDef.createCompoundContainer ||
    rendererDef.createCompoundItemContainer ||
    rendererDef.attachCompoundItem
  ) {
    return new CustomCompoundRenderer(rendererConfig);
  }
  return new DefaultCompoundRenderer(rendererConfig);
};

/**
 * Registers event listeners defined at the navNode.
 *
 * @param {*} eventbusListeners a map of event listener arrays with event id as key
 * @param {*} navNode the web component node configuration object
 * @param {*} nodeId the web component node id
 * @param {*} wcElement the web component element - optional
 */
export const registerEventListeners = (
  eventbusListeners: Record<string, any[]>,
  navNode: any,
  nodeId: string,
  wcElement?: any
): void => {
  if (navNode.eventListeners) {
    navNode.eventListeners.forEach((el: any) => {
      const evID = el.source + '.' + el.name;
      const listenerList = eventbusListeners[evID];
      const listenerInfo = {
        wcElementId: nodeId,
        wcElement: wcElement,
        action: el.action,
        converter: el.dataConverter
      };

      if (listenerList) {
        listenerList.push(listenerInfo);
      } else {
        eventbusListeners[evID] = [listenerInfo];
      }
    });
  }
};

/**
 * Desanitization of an object
 * @param {Object} paramsMap
 * @returns
 */
export const deSanitizeParamsMap = (paramsMap: Record<string, any>): Record<string, any> => {
  return Object.entries(paramsMap).reduce((sanitizedMap: Record<string, any>, [key, value]) => {
    sanitizedMap[deSanitizeParam(key)] = deSanitizeParam(value);
    return sanitizedMap;
  }, {});
};

const deSanitizeParam = (param: any = ''): string => {
  return String(param)
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&sol;', '/');
};
