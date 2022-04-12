import type webpack from 'webpack'

const PLUGIN_NAME = 'ROUTES_PLUGIN'

export class RoutesWebpackPlugin {
  apply(_compiler: webpack.Compiler) {
    console.log(PLUGIN_NAME)
  }
}
