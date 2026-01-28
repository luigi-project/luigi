import copy from 'rollup-plugin-copy';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';

export default [{
  input: ['./src/luigi-client.js'],
  output: {
    dir: 'public',
    entryFileNames: 'luigi-client.js',
    format: 'umd',
    name: 'LuigiClient',
    esModule: false,
  },
  plugins: [
    resolve(),
    json(),
    terser(),
    babel({
      babelHelpers: 'bundled',
    }),
    copy({
      hook: 'writeBundle',
      verbose: true,
      targets: [
        {
          src: './luigi-client.d.ts',
          dest: './public',
        },
        {
          src: './luigi-client.d.ts',
          rename: './luigi-client.d.mts',
          dest: './public/esm',
        },
        {
          src: './luigi-element.d.ts',
          dest: './public',
        },
        {
          src: 'src/luigi-element.js',
          dest: 'public',
        },
        {
          src: 'public_root/*',
          dest: 'public',
        },
      ],
    })],
}, {
  input: ['./src/esm.js'],
  output: {
    entryFileNames: 'luigi-client.mjs',
    format: 'esm',
    dir: './public/esm',
    exports: 'named',
  },
  plugins: [
    resolve(),
    json()
  ]
}];