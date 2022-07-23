import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import esbuild from 'rollup-plugin-esbuild'
import { externals } from 'rollup-plugin-node-externals'
import alias from '@rollup/plugin-alias'
import size from 'rollup-plugin-size'
import { defineConfig } from 'rollup'

export default defineConfig([
  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // an array for the `output` option, where we can specify
  // `file` and `format` for each target)
  {
    input: {
      index: 'src/index.ts',
      loader: 'src/loader.ts',
      'resolver/index': 'src/resolver/index.ts',
    },
    plugins: [
      /**
       * Bundle devDependencies, exclude dependencies
       */
      externals({
        devDeps: false,
      }),
      esbuild({
        target: 'es2020',
      }),
      commonjs(),
      alias({
        resolve: ['.ts', '.js', '.tsx', '.jsx'],
        entries: [{ find: '@/', replacement: './src/' }],
      }),
      resolve(),
      /**
       * Auto setup package.json
       * @see {@link https://github.com/JiangWeixian/rollup-plugin-condition-exports}
       */
      size(),
    ],
    output: [
      {
        dir: 'dist',
        entryFileNames: '[name].cjs',
        chunkFileNames: 'chunks/[name].cjs',
        format: 'cjs',
      },
      {
        dir: 'dist',
        entryFileNames: '[name].mjs',
        chunkFileNames: 'chunks/[name].mjs',
        format: 'es',
      },
    ],
  },
])
