import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';
import dts from 'vite-plugin-dts';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// When LUIGI_DEV_CONTAINER_SRC is set (by `npm run simpledev`), resolve
// @luigi-project/container to the container's TypeScript/Svelte sources
// instead of its pre-minified public/bundle.js. Vite then transpiles the
// container itself, so its sourcemaps point at the real .svelte/.ts files
// and the container is debuggable in the browser alongside core-modular.
// The release build (`npm run build`) leaves this unset and keeps importing
// the published bundle.
const devContainerSrc = !!process.env.LUIGI_DEV_CONTAINER_SRC;
const containerSrcAlias = devContainerSrc
  ? {
      '@luigi-project/container/LuigiContainer.svelte': resolve(__dirname, '../container/src/LuigiContainer.svelte'),
      '@luigi-project/container': resolve(__dirname, '../container/src/main.ts')
    }
  : {};

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
  // Skip .d.ts generation in dev: it would try to emit types for the aliased
  // container sources and isn't needed for the simpledev server anyway.
  // In dev, compile the aliased container .svelte files (which live outside
  // this project root) from source, mirroring the container's own rollup
  // build (see container/rollup.config.js): svelte-preprocess with sourcemaps
  // strips their <script lang="ts">, customElement:true keeps the
  // <svelte:options customElement=...> web-component definitions working, and
  // dev:true enables the same runtime checks the container's dev build has.
  plugins: [
    luigiPlugin(),
    svelte(
      devContainerSrc
        ? {
            preprocess: sveltePreprocess({ sourceMap: true }),
            compilerOptions: { customElement: true, dev: true }
          }
        : {}
    ),
    ...(devContainerSrc ? [] : [dts()])
  ]
});
