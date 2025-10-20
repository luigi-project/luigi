import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [sveltekit()],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'
      }
    }
  },
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}']
  },
  build: {
    chunkSizeWarningLimit: 900000
  },
  server: {
    watch: {
      usePolling: true
    }
  }
});
