import copy from 'rollup-plugin-copy';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
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
        name: 'LuigiClient',
        esModule: false,
        exports: 'named',
      }, {
        entryFileNames: 'luigi-client.mjs',
        format: 'esm',
        dir: './public/esm',
        exports: 'named',
      }],
      plugins: [
        resolve(),
        babel({
          babelHelpers: 'bundled',
        }),
        copy({
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
