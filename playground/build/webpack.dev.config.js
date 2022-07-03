const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('@soda/friendly-errors-webpack-plugin')
const WebpackBar = require('webpackbar')
const webpack = require('webpack')
const RefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const { merge } = require('webpack-merge')

const configs = require('./config')
const common = require('./webpack.common.config')
const port = 8080

/**
 * @type import('webpack').Configuration
 */
const dev = {
  devtool: 'eval-cheap-module-source-map',
  mode: 'development',
  output: {
    path: configs.path.output,
    filename: '[name].js',
    publicPath: '/',
  },
  stats: 'errors-only',
  infrastructureLogging: {
    level: 'none',
  },
  devServer: {
    liveReload: true,
    host: '0.0.0.0',
    port,
    static: {
      publicPath: `http://localhost:${port}`,
      watch: true,
    },
    proxy: {
      '/proxy': {
        target: 'http://localhost:3000/',
        changeOrigin: true,
      },
    },
    historyApiFallback: true,
  },
  optimization: {
    moduleIds: 'named',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          {
            loader: '@teamsupercell/typings-for-css-modules-loader',
          },
          { loader: 'css-loader', options: { sourceMap: true } },
          { loader: 'postcss-loader', options: { sourceMap: true } },
        ],
      },
      {
        test: /(\.styl$|\.stylus$)/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader', options: { sourceMap: true } },
          {
            loader: '@teamsupercell/typings-for-css-modules-loader',
          },
          { loader: 'postcss-loader', options: { sourceMap: true } },
          {
            loader: 'stylus-loader',
            options: {
              stylusOptions: {
                sourceMap: true,
                use: configs.stylus.plugins,
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.WatchIgnorePlugin({
      paths: [/css\.d\.ts$/, /styl\.d\.ts$/],
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'public/template.html',
      inject: true,
    }),
    new webpack.HotModuleReplacementPlugin(),
    new RefreshPlugin(),
    new WebpackBar(),
    new FriendlyErrorsPlugin({
      compilationSuccessInfo: {
        messages: [`Running here http://localhost:${port}`],
        notes: ['Happy coding'],
      },
      onErrors(_severity, _errors) {
        // You can listen to errors transformed and prioritized by the plugin
        // severity can be 'error' or 'warning'
      },
    }),
  ],
}

// issue: https://github.com/webpack/webpack-dev-server/issues/1479
const exitProcess = () => process.exit(0)

// fix: webpack-dev-server doesn't exit on Ctrl+C
;['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, exitProcess)
})

module.exports = merge(common, dev)
