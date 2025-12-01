import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import staticAdapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    adapter: staticAdapter({
      strict: false
    }),
    prerender: {
      handleMissingId: (route) => {
        // SvelteKit vite build phase attempts to crawl the site by looking at links/ids between pages. Since we don't have guaranteed links between all pages,
        // it produces an error that some links were not found. This is not relevant in our case since the site is exported to production with HTMLs produced of the docs.json file,
        // which is in itself always in sync with the local root /docs folder that contains the .md files
        return { status: 200 };
      }
    },
    serviceWorker: {
      register: false
    }
  },
  build: {
    outDir: 'public'
  }
};

export default config;
