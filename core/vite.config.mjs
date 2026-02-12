import { createLogger, defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import * as csstree from 'css-tree';
import * as fs from 'fs';

const buildLogger = createLogger();
const loggerWarn = buildLogger.warn;

buildLogger.warn = (msg, options) => {
  if (msg.includes('css-syntax-error')) return;

  loggerWarn(msg, options);
};

const luigiPlugin = () => {
  return {
    enforce: 'pre',
    name: 'luigi-postprocess',
    generateBundle: (options, bundle) => {
      const cssFile = bundle['luigi_core.css'];
      cssFile.source = cssFile.source.replace(/(\.svelte-[a-z0-9]+){2,}/g, match => {
        const singleHash = match.match(/\.svelte-[a-z0-9]+/g)[0];
        return singleHash;
      });

      const jsFile = bundle['luigi.js'];
      jsFile.code = jsFile.code.replace('__luigi_dyn_import_____________(', 'import(/* webpackIgnore: true */');

      jsFile.code = '(function(){\n' + jsFile.code.replace('//# sourceMappingURL=luigi.js.map', '})();\n//# sourceMappingURL=luigi.js.map');

      // Update the sourcemap asset to account for the added IIFE wrapper line
      const mapFile = bundle['luigi.js.map'];
      if (mapFile && mapFile.type === 'asset') {
        const mapContent = JSON.parse(mapFile.source);
        mapContent.mappings = ';' + mapContent.mappings;
        mapFile.source = JSON.stringify(mapContent);
      }

      const fdFioriCSS = bundle['fd_fiori.css'];
      const fdHorizonCSS = bundle['fd_horizon.css'];

      const fullFioriCSS = '' + cssFile.source + '\n' + fdFioriCSS.source;
      const fullHorizonCSS = '' + cssFile.source + '\n' + fdHorizonCSS.source;

      fs.writeFileSync('./public/luigi.css', fullFioriCSS);
      fs.writeFileSync('./public/luigi_horizon.css', fullHorizonCSS);

      // parse css and extract custom properties into dedicated file
      const cssVarArray = [];
      const ast = csstree.parse(fullFioriCSS);
      csstree.walk(ast, node => {
        if (node.type === 'Declaration' && node.property.startsWith('--')) {
          cssVarArray.push(node.property.substring(2));
        }
      });
      fs.writeFileSync('./public/luigi_theme_vars.js', 'window.__luigiThemeVars=' + JSON.stringify(cssVarArray) + ';');
    }
  };
};

export default defineConfig({
  assetsInclude: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
  customLogger: buildLogger,
  base: '',
  build: {
    minify: 'terser',
    terserOptions: {
      mangle: {
        reserved: ['$'],
      },
    },
    sourcemap: true,
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      input: ['src/main.js', 'src/styles/fd_horizon.scss', 'src/styles/fd_fiori.scss'],
      output: {
        entryFileNames: 'luigi.js',
        format: 'es',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('main.css')) {
            return 'luigi_core.css';
          } else if (assetInfo.name.endsWith('fd_fiori.css')) {
            return 'fd_fiori.css';
          } else if (assetInfo.name.endsWith('fd_horizon.css')) {
            return 'fd_horizon.css';
          }
          return '[name]-[hash][extname]';
        }
      },
      plugins: []
    },
    outDir: 'public'
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api']
      }
    }
  },
  publicDir: 'public_root',
  plugins: [luigiPlugin(), svelte()]
});
