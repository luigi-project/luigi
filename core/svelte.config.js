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
  onwarn: () => {
    return false;
  }
};

module.exports = config;
