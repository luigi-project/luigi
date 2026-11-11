import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import dts from 'vite-plugin-dts';
import remapping from '@jridgewell/remapping';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import fs from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

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

// core-modular imports @luigi-project/container as a pre-built, minified
// bundle.js, so the sourcemap Vite generates for luigi.js only maps back to
// that minified bundle - stepping into container code in the browser shows
// minified output. The container ships its own bundle.js.map (bundle.js <-
// container/src/*.svelte|ts) right next to it. This plugin composes the two
// maps after the build so luigi.js.map points straight at the readable
// container sources. It only rewrites luigi.js.map; luigi.js itself is left
// byte-for-byte unchanged (the container is still shipped as its bundle).
const containerSourcemapPlugin = () => {
  // Depending on how the dependency is installed (symlink to ../container or a
  // plain copy under node_modules) and which build path runs, the container
  // bundle shows up in luigi.js.map under different paths, e.g.
  // ../../container/public/bundle.js or
  // ../node_modules/@luigi-project/container/bundle.js. Rather than hard-code
  // one, recognise any source that ends in the container bundle filename and
  // load its map from right next to that same file.
  const isContainerBundle = (file) => {
    if (!file) return false;
    const norm = file.replace(/\\/g, '/');
    return (
      norm.endsWith('@luigi-project/container/bundle.js') ||
      norm.endsWith('container/public/bundle.js')
    );
  };
  return {
    name: 'luigi-container-sourcemap-compose',
    writeBundle: (options) => {
      const outDir = options.dir || resolve(__dirname, 'public');
      const luigiMapPath = resolve(outDir, 'luigi.js.map');
      if (!fs.existsSync(luigiMapPath)) {
        return;
      }
      const luigiMap = JSON.parse(fs.readFileSync(luigiMapPath, 'utf8'));
      // For the single source entry that is the container bundle, load the
      // container's own map (sitting next to that bundle.js) and hand it back
      // so remapping threads luigi.js -> container sources. Every other source
      // (core-modular's own code) is left as-is.
      let composedAny = false;
      const composed = remapping(luigiMap, (file) => {
        if (!isContainerBundle(file)) return null;
        const mapPath = resolve(outDir, file) + '.map';
        if (!fs.existsSync(mapPath)) return null;
        composedAny = true;
        return JSON.parse(fs.readFileSync(mapPath, 'utf8'));
      });
      if (composedAny) {
        const out = JSON.parse(composed.toString());
        // The container map's own sources are relative to the container bundle
        // (../src/...), so after composition they resolve against the bundle's
        // location and lose the "container" segment, e.g.
        // ../node_modules/@luigi-project/src/... . Rewrite those to a clear,
        // stable label so the files show up sensibly in the browser. Content
        // is carried in sourcesContent either way, so this only fixes display.
        out.sources = out.sources.map((s) =>
          typeof s === 'string'
            ? s.replace(/^(?:\.\.\/)*node_modules\/@luigi-project\/(?:container\/)?/, '@luigi-project/container/')
            : s
        );
        fs.writeFileSync(luigiMapPath, JSON.stringify(out));
      }
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
  plugins: [luigiPlugin(), svelte(), dts(), containerSourcemapPlugin()]
});
