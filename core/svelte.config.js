const { resolve } = require('node:path');
const { pathToFileURL } = require('node:url');
const sveltePreprocess = require('svelte-preprocess');

const variablePath = resolve(__dirname, 'src/styles', 'variables');
const mixinPath = resolve(__dirname, 'src/styles', 'mixins');

const config = {
  extensions: ['.svelte'],
  compilerOptions: {},
  name: 'Luigi',
  preprocess: [
    sveltePreprocess({
      scss: {
        silenceDeprecations: ['legacy-js-api'],
        prependData: `@use "${pathToFileURL(variablePath)}" as *; @use "${pathToFileURL(mixinPath)}" as *;`
      }
    })
  ],
  onwarn: (warning, defaultHandler) => {
    if (warning.code.includes('a11y') || warning.code.includes('css')) return;

    defaultHandler(warning);
  }
};

module.exports = config;
