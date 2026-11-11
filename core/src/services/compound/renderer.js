import {
  DefaultCompoundRenderer,
  registerEventListeners,
  resolveRenderer
} from '../../utilities/helpers/web-component-helpers';

export function generateWCId(viewUrl, baseUrl = encodeURI(location.href)) {
  return 'luigi-wc-' + Array.from(new URL(viewUrl, baseUrl).href, (char) => char.charCodeAt(0).toString(16)).join('');
}

export function getCompoundRenderer(navNode, resolveUrl = (url) => url) {
  if (navNode.webcomponent && navNode.viewUrl) {
    const renderer = new DefaultCompoundRenderer();
    renderer.viewUrl = resolveUrl(navNode.viewUrl);
    renderer.createCompoundItemContainer = (layoutConfig) => {
      const container = document.createElement('div');
      if (layoutConfig?.slot) container.setAttribute('slot', layoutConfig.slot);
      return container;
    };
    return renderer;
  }
  return navNode.compound.renderer ? resolveRenderer(navNode.compound.renderer) : new DefaultCompoundRenderer();
}

/** Shared DOM orchestration. Component loading and client initialization belong to the host adapter. */
export async function renderCompound({
  navNode,
  container,
  extendedContext,
  renderer,
  createContainer,
  renderChild,
  isDisposed = () => false
}) {
  const compoundContainer = await createContainer(renderer, extendedContext, navNode);
  if (isDisposed()) return;
  const listeners = Object.create(null);
  compoundContainer.eventBus = {
    listeners,
    onPublishEvent(event, source) {
      // Never mutate the registered list when adding wildcard listeners.
      const targets = [...(listeners[source + '.' + event.type] || []), ...(listeners['*.' + event.type] || [])];
      targets.forEach((listener) => {
        const target =
          listener.wcElement ||
          Array.from(compoundContainer.querySelectorAll('[nodeId]')).find(
            (wc) => wc.getAttribute('nodeId') === listener.wcElementId
          );
        target?.dispatchEvent(
          new CustomEvent(listener.action, {
            detail: listener.converter ? listener.converter(event.detail) : event.detail
          })
        );
      });
    }
  };
  const loads = (navNode.compound.children || []).map((child, index) => {
    const childContainer = renderer.createCompoundItemContainer(child.layoutConfig);
    const nodeId = child.id || 'gen_' + index;
    childContainer.eventBus = compoundContainer.eventBus;
    childContainer._luigi_node = child;
    renderer.attachCompoundItem(compoundContainer, childContainer);
    registerEventListeners(listeners, child, nodeId);
    return renderChild(
      child,
      childContainer,
      {
        ...extendedContext,
        context: { ...extendedContext.context, ...child.context },
        currentNode: child
      },
      nodeId
    );
  });
  registerEventListeners(listeners, navNode.compound, '_root', compoundContainer);
  container.appendChild(compoundContainer);
  await Promise.all(loads);
  return compoundContainer;
}

export function registerModule(module, tagName) {
  if (customElements.get(tagName)) return;
  const component = [module.default, ...Object.values(module)].find((value) => HTMLElement.isPrototypeOf(value));
  if (!component) throw new Error(`No HTMLElement export found for ${tagName}`);
  customElements.define(tagName, component);
}

export function initializeComponent(wc, clientAPI, extendedContext, viewUrl) {
  wc.extendedContext = extendedContext;
  wc.setAttribute('lui_web_component', true);
  if (wc.__postProcess) {
    const url = new URL(viewUrl, document.baseURI);
    const base = url.origin === new URL(document.baseURI).origin ? url : new URL('./', url);
    wc.__postProcess(extendedContext.context, clientAPI, base.origin + base.pathname);
  } else {
    wc.context = extendedContext.context;
    wc.nodeParams = extendedContext.nodeParams;
    wc.LuigiClient = clientAPI;
  }
}
