import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import autoPreprocess from 'svelte-preprocess';
import postcss from 'rollup-plugin-postcss';
import copy from 'rollup-plugin-copy';
import * as csstree from 'css-tree';
import * as fs from 'fs';

const production = !process.env.ROLLUP_WATCH;

// Suppress warnings
const onwarn = (warning, warn) => {
  // Suppress circular dependency warnings
  if (warning.code === 'CIRCULAR_DEPENDENCY') return;

  // Suppress Svelte unused CSS warnings
  if (warning.code === 'css-unused-selector') return;

  // Let everything else through
  warn(warning);
};

// Custom Luigi postprocessing plugin
const luigiPlugin = () => {
  return {
    name: 'luigi-postprocess',
    generateBundle(options, bundle) {
      const cssFile = bundle['luigi_core.css'];
      if (cssFile) {
        cssFile.source = cssFile.source.replace(/(\.svelte-[a-z0-9]+){2,}/g, match => {
          const singleHash = match.match(/\.svelte-[a-z0-9]+/g)[0];
          return singleHash;
        });
      }

      const jsFile = bundle['luigi.js'];
      if (jsFile) {
        // Replace dynamic import placeholder
        jsFile.code = jsFile.code.replace('__luigi_dyn_import_____________(', 'import(/* webpackIgnore: true */');

        // Remove ES module exports (not needed in IIFE)
        jsFile.code = jsFile.code.replace(/export\s*\{[^}]+\};?\s*$/m, '');

        // Wrap ES module output in IIFE (matching Vite's format)
        jsFile.code = '(function(){\n' + jsFile.code.replace('//# sourceMappingURL=luigi.js.map', '})();\n//# sourceMappingURL=luigi.js.map');

        // Update the sourcemap to account for the IIFE wrapper line
        const mapFile = bundle['luigi.js.map'];
        if (mapFile && mapFile.type === 'asset') {
          const mapContent = JSON.parse(mapFile.source);
          mapContent.mappings = ';' + mapContent.mappings;
          mapFile.source = JSON.stringify(mapContent);
        }
      }

      // Clean up temporary JS files created for CSS-only bundles
      if (bundle['fd_fiori_temp.js']) {
        delete bundle['fd_fiori_temp.js'];
      }
      if (bundle['fd_horizon_temp.js']) {
        delete bundle['fd_horizon_temp.js'];
      }
    },
    writeBundle() {
      // This runs after all files are written - combine CSS files
      if (fs.existsSync('./public/luigi_core.css') &&
          fs.existsSync('./public/fd_fiori.css') &&
          fs.existsSync('./public/fd_horizon.css')) {

        let coreCSS = fs.readFileSync('./public/luigi_core.css', 'utf8');
        let fioriCSS = fs.readFileSync('./public/fd_fiori.css', 'utf8');
        let horizonCSS = fs.readFileSync('./public/fd_horizon.css', 'utf8');

        // Deduplicate Svelte scoped class selectors (e.g., .svelte-abc.svelte-abc -> .svelte-abc)
        coreCSS = coreCSS.replace(/(\.svelte-[a-z0-9]+){2,}/g, match => {
          const singleHash = match.match(/\.svelte-[a-z0-9]+/g)[0];
          return singleHash;
        });

        // Fix font URLs - remove ../ since fonts are in public/ next to CSS
        fioriCSS = fioriCSS.replace(/url\(\.\.\/sap_fiori_3\//g, 'url(sap_fiori_3/');
        fioriCSS = fioriCSS.replace(/url\(\.\.\/baseTheme\//g, 'url(baseTheme/');
        horizonCSS = horizonCSS.replace(/url\(\.\.\/sap_horizon\//g, 'url(sap_horizon/');
        horizonCSS = horizonCSS.replace(/url\(\.\.\/baseTheme\//g, 'url(baseTheme/');

        const fullFioriCSS = coreCSS + '\n' + fioriCSS;
        const fullHorizonCSS = coreCSS + '\n' + horizonCSS;

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

      // Clean up temp files from disk
      if (fs.existsSync('./public/fd_fiori_temp.js')) {
        fs.unlinkSync('./public/fd_fiori_temp.js');
      }
      if (fs.existsSync('./public/fd_horizon_temp.js')) {
        fs.unlinkSync('./public/fd_horizon_temp.js');
      }
    }
  };
};

export default [
  // Main bundle (JS + component CSS)
  {
    input: 'src/main.js',
    output: {
      sourcemap: true,
      file: 'public/luigi.js',
      format: 'es'
    },
    onwarn,
    plugins: [
      svelte({
        compilerOptions: {
          dev: !production
        },
        emitCss: true,
        onwarn: (warning, handler) => {
          // Suppress unused CSS selector warnings
          if (warning.code === 'css-unused-selector') return;
          handler(warning);
        },
        preprocess: autoPreprocess({
          sourceMap: !production,
          scss: {
            includePaths: ['src/styles'],
            prependData: `@import 'src/styles/_variables.scss';\n@import 'src/styles/_mixins.scss';`,
            silenceDeprecations: ['legacy-js-api', 'import']
          }
        })
      }),
      postcss({
        extract: 'luigi_core.css',
        sourceMap: true,
        minimize: production
      }),
      resolve({
        browser: true,
        dedupe: ['svelte']
      }),
      commonjs(),
      copy({
        targets: [
          {
            src: 'node_modules/@sap-theming/theming-base-content/content/Base/baseLib/baseTheme/fonts/*',
            dest: 'public/baseTheme/fonts'
          },
          {
            src: 'node_modules/@sap-theming/theming-base-content/content/Base/baseLib/sap_horizon/fonts/*',
            dest: 'public/sap_horizon/fonts'
          },
          {
            src: 'node_modules/@sap-theming/theming-base-content/content/Base/baseLib/sap_fiori_3/fonts/*',
            dest: 'public/sap_fiori_3/fonts'
          }
        ]
      }),
      production && terser({
        mangle: {
          reserved: ['$']
        }
      }),
      luigiPlugin()
    ],
    watch: {
      clearScreen: false
    }
  },
  // Fiori theme SCSS
  {
    input: 'src/styles/fd_fiori.scss',
    output: {
      file: 'public/fd_fiori_temp.js' // dummy output, we only care about CSS
    },
    onwarn,
    plugins: [
      postcss({
        extract: 'fd_fiori.css',
        sourceMap: true,
        minimize: production,
        use: [
          ['sass', {
            includePaths: ['node_modules'],
            silenceDeprecations: ['legacy-js-api', 'import']
          }]
        ]
      }),
      luigiPlugin()
    ],
    watch: {
      clearScreen: false
    }
  },
  // Horizon theme SCSS
  {
    input: 'src/styles/fd_horizon.scss',
    output: {
      file: 'public/fd_horizon_temp.js' // dummy output, we only care about CSS
    },
    onwarn,
    plugins: [
      postcss({
        extract: 'fd_horizon.css',
        sourceMap: true,
        minimize: production,
        use: [
          ['sass', {
            includePaths: ['node_modules'],
            silenceDeprecations: ['legacy-js-api', 'import']
          }]
        ]
      }),
      // Apply custom postprocessing after all CSS is generated
      luigiPlugin()
    ],
    watch: {
      clearScreen: false
    }
  }
];
