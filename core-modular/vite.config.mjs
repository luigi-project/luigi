import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import dts from 'vite-plugin-dts';
import { dirname, resolve } from 'node:path';
import fs from 'node:fs';

const luigiPlugin = () => {
  return {
    enforce: 'pre',
    name: 'luigi-postprocess',
    generateBundle: (options, bundle) => {
      const jsFile = bundle['luigi.js'];
      jsFile.code = jsFile.code.replace('__luigi_dyn_import_____________(', 'import(/* webpackIgnore: true */');
    }
  };
};

// Pass the pre-built container's map to Vite so it chains the original
// TypeScript/Svelte sources into luigi.js.map without changing the bundle code.
const containerSourcemapPlugin = () => ({
  name: 'luigi-container-sourcemap',
  enforce: 'pre',
  load(id) {
    if (!/(?:@luigi-project\/container|container\/public)\/bundle\.js$/.test(id.replace(/\\/g, '/'))) return;
    const mapPath = `${id}.map`;
    if (!fs.existsSync(mapPath)) return;
    this.addWatchFile(mapPath);

    const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
    // Published maps use ../src, which otherwise loses the container namespace.
    // These are display paths; the original files are embedded in sourcesContent.
    map.sources = map.sources.map((source) =>
      resolve(dirname(id), map.sourceRoot || '', source.replace(/^\.\.\/src\//, 'src/'))
    );
    delete map.sourceRoot;
    return { code: fs.readFileSync(id, 'utf8'), map };
  }
});

export default defineConfig({
  assetsInclude: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
  base: '',
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 650,
    lib: {
      entry: 'src/main.ts',
      name: 'Luigi',
      formats: ['es'],
      fileName: () => 'luigi.js'
    },
    outDir: 'public'
  },
  publicDir: 'public_root',
  plugins: [luigiPlugin(), svelte(), dts(), containerSourcemapPlugin()]
});
