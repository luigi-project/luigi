import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';
import dts from 'vite-plugin-dts';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Resolve @luigi-project/container to the container's TypeScript/Svelte
// sources instead of its pre-minified public/bundle.js. Vite then compiles
// the container itself, so the generated sourcemaps point at the real
// .svelte/.ts files and the container is debuggable in the browser - in the
// production build too, not just under simpledev. The resulting luigi.js is
// still minified (minification is only turned off for the dev server), it is
// just built from source rather than re-bundling the published bundle.
const containerSrcAlias = {
  '@luigi-project/container/LuigiContainer.svelte': resolve(__dirname, '../container/src/LuigiContainer.svelte'),
  '@luigi-project/container': resolve(__dirname, '../container/src/main.ts')
};

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
  resolve: {
    alias: containerSrcAlias
  },
  // Compile the aliased container .svelte files (which live outside this
  // project root) from source, mirroring the container's own rollup build
  // (see container/rollup.config.js): svelte-preprocess with sourcemaps strips
  // their <script lang="ts"> and customElement:true keeps the
  // <svelte:options customElement=...> web-component definitions working.
  plugins: [
    luigiPlugin(),
    svelte({
      preprocess: sveltePreprocess({ sourceMap: true }),
      compilerOptions: { customElement: true }
    }),
    dts()
  ]
});
