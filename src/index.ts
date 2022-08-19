import { NormalModuleReplacementPlugin } from 'webpack'
import type DevServer from 'webpack-dev-server'
// eslint-disable-next-line import/no-extraneous-dependencies -- rollup will bundle this package
import { PageContext } from 'vite-plugin-pages'
import type {
  UserOptions,
  PageResolver,
  PageContext as PageContextImpl,
} from './vite-plugin-pages-types'
import VirtualModulesPlugin from 'webpack-virtual-modules'
import { resolve, extname } from 'pathe'

import { Compiler } from './types'
import { createFilteredWatchFileSystem } from './wfs'
import { filterRoutes, logger } from './utils'

import { VIRTUAL_PAGES_ID, VIRTUAL_PAGES_ID_TEST, VIRTUAL_PAGES_ID_ALIAS } from './constants'

const routesLoader = resolve(__dirname, 'loader.cjs')
const PLUGIN = 'WEBAPCK_PLUGIN_REACT_PAGES'
const template = `
const routes = []
export default routes;
`

type WebpackPluginReactPagesOptions = Omit<
  UserOptions,
  // omit deprecated options, omit non-react-resolver only support react framework
  'pagesDir' | 'replaceSquareBrackets' | 'nuxtStyle' | 'syncIndex' | 'moduleId' | 'resolver'
> & {
  resolver?: PageResolver
}

type RequestHistory = {
  paths: Set<string>
}

export class WebpackPluginReactPages {
  vm: VirtualModulesPlugin
  nmp: NormalModuleReplacementPlugin
  page: PageContextImpl
  requestHistory: RequestHistory
  private _watchRunPatched: WeakSet<Compiler> = new WeakSet()
  constructor({
    extensions = ['ts', 'tsx', 'js', 'jsx'],
    routeStyle = 'remix',
    ...options
  }: WebpackPluginReactPagesOptions = {}) {
    this.vm = new VirtualModulesPlugin({
      VIRTUAL_PAGES_ID: template,
    })
    // support `virtual:` protocol
    this.nmp = new NormalModuleReplacementPlugin(/^virtual:react-pages/, (resource) => {
      resource.request = 'virtual-react-pages'
    })
    this.requestHistory = {
      paths: new Set('/'),
    }
    this.page = new PageContext({
      extensions,
      routeStyle,
      resolver: 'react',
      onRoutesGenerated: (routes: any[]) => {
        return filterRoutes(routes, [...this.requestHistory.paths.values()])
      },
      ...options,
      // TODO: type safe
    } as any) as any
  }

  apply(compiler: Compiler) {
    compiler.$page = this.page
    if (!compiler.options.resolve) {
      compiler.options.resolve = {}
    }
    const devServer = compiler.options.devServer!
    devServer.setupMiddlewares = (middlewares: any, devServer: DevServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined')
      }

      devServer.app?.get('*', (req, _, next) => {
        const ext = extname(req.url)
        // skip assets request
        if (ext) {
          next()
          return
        }
        this.requestHistory.paths.add(req.url)
        this.vm.writeModule(VIRTUAL_PAGES_ID, template)
        next()
      })
      return middlewares
    }
    // process virual pages module
    compiler.options.module.rules.push({
      include(resource) {
        return VIRTUAL_PAGES_ID_TEST.test(resource)
      },
      enforce: 'pre',
      use: [
        {
          loader: routesLoader,
        },
      ],
    })

    // rollup typo
    compiler.hooks.compilation.tap(PLUGIN, async (compilation: any) => {
      for (const dir of this.page.options.dirs) {
        logger('page dirs', dir)
        compilation.contextDependencies.add(resolve(compiler.context, dir.dir))
      }
    })

    // setup alias
    compiler.options.resolve.alias = {
      ...compiler.options.resolve.alias,
      [VIRTUAL_PAGES_ID_ALIAS]: resolve(compiler.context, VIRTUAL_PAGES_ID),
    }

    // webpack-virtual-modules include webpack@v4 types directly
    // Applying a webpack compiler to the virtual module
    this.vm.apply(compiler as any)
    this.nmp.apply(compiler)

    compiler.hooks.compilation.tap(PLUGIN, () => {
      this.vm.writeModule(VIRTUAL_PAGES_ID, template)
    })

    // related to pr: https://github.com/sysgears/webpack-virtual-modules/pull/129/files
    if (!this._watchRunPatched.has(compiler)) {
      compiler.watchFileSystem = createFilteredWatchFileSystem(compiler.watchFileSystem as any)
      this._watchRunPatched.add(compiler)
    }
  }
}
