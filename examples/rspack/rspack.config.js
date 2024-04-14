const rspack = require('@rspack/core')
const RefreshPlugin = require('@rspack/plugin-react-refresh')
const { resolve, join } = require('node:path')
const { WebpackLocalModule } = require('webpack-local-module')
const { WebpackPluginReactPages } = require('webpack-plugin-react-pages')
const { nextEnhancedResolver } = require('webpack-plugin-react-pages/resolver')

const isDev = process.env.NODE_ENV === 'development'
/**
 * @type {import('@rspack/cli').Configuration}
 */
module.exports = {
  context: __dirname,
  entry: {
    main: './src/main.tsx',
  },
  devServer: {
    historyApiFallback: true
  },
  resolve: {
    extensions: ['...', '.ts', '.tsx', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.svg$/,
        type: 'asset',
      },
      {
        test: /\.(jsx?|tsx?)$/,
        use: [
          {
            loader: 'builtin:swc-loader',
            options: {
              sourceMap: true,
              jsc: {
                parser: {
                  syntax: 'typescript',
                  tsx: true,
                },
                transform: {
                  react: {
                    runtime: 'automatic',
                    development: isDev,
                    refresh: isDev,
                  },
                },
              },
              env: {
                targets: [
                  'chrome >= 87',
                  'edge >= 88',
                  'firefox >= 78',
                  'safari >= 14',
                ],
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new WebpackLocalModule({
      'virtual-module': 'export const id = "virtual-module"',
      'node_modules/virtual-config.jsx': 'export const config = {}',
    }),
    new WebpackPluginReactPages({
      rspack: true,
      resolver: {
        ...nextEnhancedResolver(),
        resolveModuleIds: () => ['virtual-react-pages'],
      },
    }),
    new rspack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
    new rspack.ProgressPlugin({}),
    new rspack.HtmlRspackPlugin({
      template: './index.html',
    }),
    isDev ? new RefreshPlugin() : null,
  ].filter(Boolean),
}
