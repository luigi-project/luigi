import runtimeSource from './compound/runtime-source';

function escapeAttribute(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

/** The runtime is authored as modules and bundled at build time, not maintained
 * as JavaScript inside a template string. Only escaped stylesheet URLs enter HTML.
 */
export function getCompoundIframeBootstrapScript(cssLinks = []) {
  if (!runtimeSource) throw new Error('Compound iframe runtime was not bundled');
  const links = cssLinks.map((href) => `<link rel="stylesheet" href="${escapeAttribute(href)}">`).join('\n');
  const script = runtimeSource.replace(/<\/script/gi, '<\\/script');
  return `<!doctype html><html><head>${links}<style>html,body{margin:0;padding:0;width:100%;height:100%}</style></head><body><script>${script}</script></body></html>`;
}
