import copy from 'rollup-plugin-copy';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '',
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      input: ['./src/luigi-client.js'],
      output: [{
        entryFileNames: 'luigi-client.js',
        format: 'umd',
      }, {
        entryFileNames: 'luigi-client-esm.js',
        format: 'es',
      }],
      plugins: [copy({
        hook: 'writeBundle',
        targets: [
          {
            src: './luigi-client.d.ts',
            dest: './public',
          },
          {
            src: './luigi-element.d.ts',
            dest: './public',
          },
          {
            src: 'src/luigi-element.js',
            dest: 'public',
          },
        ],
      })],
    },
    outDir: 'public',
  },
  publicDir: 'public_root',
});
