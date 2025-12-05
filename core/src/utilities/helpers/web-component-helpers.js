/**
 * Default compound renderer.
 */
export class DefaultCompoundRenderer {
  constructor(rendererObj) {
    if (rendererObj) {
      this.rendererObject = rendererObj;
      this.config = rendererObj.config || {};
    } else {
      this.config = {};
    }
  }

  createCompoundContainer() {
    return document.createElement('div');
  }

  createCompoundItemContainer() {
    return document.createElement('div');
  }

  attachCompoundItem(compoundCnt, compoundItemCnt) {
    compoundCnt.appendChild(compoundItemCnt);
  }
}

/**
 * Compound Renderer for custom rendering as defined in luigi config.
 */
export class CustomCompoundRenderer extends DefaultCompoundRenderer {
  constructor(rendererObj) {
    super(rendererObj || { use: {} });
    if (rendererObj && rendererObj.use && rendererObj.use.extends) {
      this.superRenderer = resolveRenderer({
        use: rendererObj.use.extends,
        config: rendererObj.config
      });
    }
  }

  createCompoundContainer() {
    if (this.rendererObject.use.createCompoundContainer) {
      return this.rendererObject.use.createCompoundContainer(this.config, this.superRenderer);
    } else if (this.superRenderer) {
      return this.superRenderer.createCompoundContainer();
    }
    return super.createCompoundContainer();
  }

  createCompoundItemContainer(layoutConfig) {
    if (this.rendererObject.use.createCompoundItemContainer) {
      return this.rendererObject.use.createCompoundItemContainer(layoutConfig, this.config, this.superRenderer);
    } else if (this.superRenderer) {
      return this.superRenderer.createCompoundItemContainer(layoutConfig);
    }
    return super.createCompoundItemContainer(layoutConfig);
  }

  attachCompoundItem(compoundCnt, compoundItemCnt) {
    if (this.rendererObject.use.attachCompoundItem) {
      this.rendererObject.use.attachCompoundItem(compoundCnt, compoundItemCnt, this.superRenderer);
    } else if (this.superRenderer) {
      this.superRenderer.attachCompoundItem(compoundCnt, compoundItemCnt);
    } else {
      super.attachCompoundItem(compoundCnt, compoundItemCnt);
    }
  }
}

/**
 * Compound Renderer for a css grid compound view.
 */
export class GridCompoundRenderer extends DefaultCompoundRenderer {
  createCompoundContainer() {
    const containerClass = '__lui_compound_' + new Date().getTime();
    const compoundCnt = document.createElement('div');
    compoundCnt.classList.add(containerClass);
    let mediaQueries = '';

    if (this.config.layouts) {
      this.config.layouts.forEach((el) => {
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

  createCompoundItemContainer(layoutConfig) {
    const config = layoutConfig || {};
    const compoundItemCnt = document.createElement('div');
    compoundItemCnt.setAttribute('style', `grid-row: ${config.row || 'auto'}; grid-column: ${config.column || 'auto'}`);
    return compoundItemCnt;
  }
}

/**
 * Returns the compound renderer class for a given config.
 * If no specific one is found, {DefaultCompoundRenderer} is returned.
 *
 * @param {*} rendererConfig - the renderer config object defined in luigi config
 */
export const resolveRenderer = (rendererConfig) => {
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
 * @param {*} eventbusListeners - a map of event listener arrays with event id as key
 * @param {*} navNode - the web component node configuration object
 * @param {*} nodeId - the web component node id
 * @param {*} wcElement - (optional) the web component element
 */
export const registerEventListeners = (eventbusListeners, navNode, nodeId, wcElement) => {
  if (navNode.eventListeners) {
    navNode.eventListeners.forEach((el) => {
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
export const deSanitizeParamsMap = (paramsMap) => {
  return Object.entries(paramsMap).reduce((sanitizedMap, paramPair) => {
    sanitizedMap[deSanitizeParam(paramPair[0])] = deSanitizeParam(paramPair[1]);
    return sanitizedMap;
  }, {});
};

const deSanitizeParam = (param = '') => {
  return String(param)
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&sol;', '/');
};
