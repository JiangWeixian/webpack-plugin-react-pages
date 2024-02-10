import path from 'node:path'

import alias from '@rollup/plugin-alias'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import { defineConfig } from 'rollup'
import ce from 'rollup-plugin-condition-exports'
import esbuild from 'rollup-plugin-esbuild'
import size from 'rollup-plugin-filesize'
import { externals } from 'rollup-plugin-node-externals'

export default defineConfig([
  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // an array for the `output` option, where we can specify
  // `file` and `format` for each target)
  {
    input: 'src/index.ts',
    plugins: [
      /**
       * Bundle devDependencies, exclude dependencies
       */
      externals({
        devDeps: false,
      }),
      commonjs(),
      esbuild({
        target: 'node14',
      }),
      alias({
        customResolver: resolve({ extensions: ['.tsx', '.ts'] }),
        entries: Object.entries({
          '@/*': ['./src/*'],
        }).map(([alias, value]) => ({
          find: new RegExp(`${alias.replace('/*', '')}`),
          replacement: path.resolve(process.cwd(), `${value[0].replace('/*', '')}`),
        })),
      }),
      resolve(),
      /**
       * Auto setup package.json
       * @see {@link https://github.com/JiangWeixian/rollup-plugin-condition-exports}
       */
      ce(),
      size(),
    ],
    output: [
      { dir: 'dist', entryFileNames: '[name].cjs', format: 'cjs' },
      { dir: 'dist', entryFileNames: '[name].mjs', format: 'es' },
    ],
  },
])
