import { rollup } from 'rollup';
import { fileURLToPath } from 'node:url';

/** Bundle a normal, lintable module graph into the existing srcdoc deployment.
 * No additional public asset or origin assumptions are required.
 */
export function compoundRuntime() {
  const entry = fileURLToPath(new URL('../src/services/compound/runtime-entry.js', import.meta.url));
  const source = fileURLToPath(new URL('../src/services/compound/runtime-source.js', import.meta.url));
  return {
    name: 'luigi-compound-runtime',
    async load(id) {
      if (id.replaceAll('\\', '/') !== source.replaceAll('\\', '/')) return null;
      const build = await rollup({ input: entry });
      try {
        build.watchFiles.forEach((file) => this.addWatchFile(file));
        const { output } = await build.generate({ format: 'iife', inlineDynamicImports: true });
        return `export default ${JSON.stringify(output[0].code)};`;
      } finally {
        await build.close();
      }
    }
  };
}
