/** Fail early instead of allowing postMessage to throw on functions or cyclic configuration. */
function serializable(value, path, ancestors = new Set()) {
  if (value === undefined || value === null || ['string', 'boolean'].includes(typeof value)) return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (
    typeof value !== 'object' ||
    ancestors.has(value) ||
    (!Array.isArray(value) && ![Object.prototype, null].includes(Object.getPrototypeOf(value)))
  ) {
    throw new Error(`Unsupported isolated compound configuration at ${path}`);
  }
  const next = new Set(ancestors).add(value);
  if (Array.isArray(value)) return value.map((item, index) => serializable(item, `${path}[${index}]`, next));
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, serializable(item, `${path}.${key}`, next)])
  );
}

function listeners(value, path) {
  return (value || []).map((listener) => {
    if (listener.dataConverter) throw new Error(`Event dataConverter is not supported in isolated mode (${path})`);
    return serializable({ source: listener.source, name: listener.name, action: listener.action }, path);
  });
}

/** Normalize only supported properties. Never send the live navigation tree to the iframe. */
export function normalizeCompoundConfig(navNode, componentData, { resolveUrl, getSnapshot }) {
  const compound = navNode.compound;
  if (compound.renderer?.use && compound.renderer.use !== 'grid') {
    throw new Error('Only default and grid renderers are supported in isolated compound mode');
  }
  const context = serializable(componentData.context || {}, 'context');
  const ids = new Set(['_root']);
  const normalizeNode = (node, nodeId, nodeContext) => ({
    id: nodeId,
    viewUrl: node.viewUrl ? resolveUrl(node.viewUrl, nodeContext) : undefined,
    webcomponent: node.webcomponent
      ? serializable(
          {
            tagName: node.webcomponent.tagName,
            selfRegistered: node.webcomponent.selfRegistered,
            type: node.webcomponent.type
          },
          `${nodeId}.webcomponent`
        )
      : undefined,
    context: serializable(node.context, `${nodeId}.context`),
    layoutConfig: serializable(node.layoutConfig, `${nodeId}.layoutConfig`),
    eventListeners: listeners(node.eventListeners, nodeId)
  });
  const children = (compound.children || []).map((child, index) => {
    const id = child.id || 'gen_' + index;
    if (typeof id !== 'string' || ids.has(id)) throw new Error(`Invalid or duplicate compound child id: ${id}`);
    ids.add(id);
    if (!child.viewUrl) throw new Error(`Missing viewUrl for compound child ${id}`);
    return normalizeNode(child, id, { ...context, ...child.context });
  });
  const root = normalizeNode(navNode, '_root', context);
  return serializable(
    {
      navNode: {
        ...root,
        compound: {
          children,
          renderer: compound.renderer,
          lazyLoadingOptions: compound.lazyLoadingOptions,
          eventListeners: listeners(compound.eventListeners, 'compound')
        }
      },
      context,
      pathParams: componentData.pathParams || {},
      nodeParams: componentData.nodeParams || {},
      snapshot: getSnapshot()
    },
    'compound'
  );
}
