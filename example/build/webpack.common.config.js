// const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { RoutesWebpackPlugin } = require('webpack-plugin-routes')

const configs = require('./config')

/**
 * @type import('webpack').Configuration
 */
const common = {
  context: configs.path.context,
  entry: ['react-hot-loader/patch', './src/index.tsx'],
  output: {
    path: configs.path.output,
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', 'jsx'],
    alias: {
      '@': configs.path.project,
      assets: configs.path.assets,
      static: configs.path.static,
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          { loader: 'cache-loader' },
          {
            loader: 'thread-loader',
            options: configs.workerpool,
          },
          { loader: 'babel-loader' },
          {
            loader: 'ts-loader',
            options: {
              // IMPORTANT! use happyPackMode mode to speed-up compilation and reduce errors reported to webpack
              transpileOnly: true,
              happyPackMode: true,
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|gif)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: '[path][name].[ext]',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new RoutesWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: configs.path.static,
          to: 'static',
        },
        {
          from: configs.path.public,
          to: '',
        },
      ],
    }),
    // new ForkTsCheckerWebpackPlugin({
    //   typescript: {
    //     configFile: configs.path.tsconfig,
    //   },
    //   async: true,
    // }),
  ],
}

module.exports = common
