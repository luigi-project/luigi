/** @type {import('rollup-plugin-svelte').Options} */
import { sveltePreprocess } from 'svelte-preprocess';

export default {
  compilerOptions: {
    customElement: true,
    // enable run-time checks when not in production
    dev: !process.env.ROLLUP_WATCH
  },
  preprocess: sveltePreprocess({
    sourceMap: true
  })
};
