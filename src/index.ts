import { NormalModuleReplacementPlugin } from 'webpack'
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
import { filterRoutes, logger, warning } from './utils'

import {
  VIRTUAL_PAGES_ID,
  VIRTUAL_PAGES_ID_TEST,
  VIRTUAL_PAGES_ID_ALIAS,
  PREFIX,
} from './constants'

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
  experimental?: {
    partialCompile: boolean
  }
}

type RequestHistory = {
  paths: Set<string>
}

const isSupportPartialCompile = (options: WebpackPluginReactPagesOptions) => {
  return (
    !!options.experimental?.partialCompile &&
    // static $name inject in resolver/next-enhanced
    options.resolver?._name === 'nextEnhancedResolver' &&
    process.env.NODE_ENV === 'development'
  )
}

export class WebpackPluginReactPages {
  vm: VirtualModulesPlugin
  nmp: NormalModuleReplacementPlugin
  page: PageContextImpl
  requestHistory: RequestHistory
  options: WebpackPluginReactPagesOptions
  private _watchRunPatched: WeakSet<Compiler> = new WeakSet()
  constructor({
    extensions = ['ts', 'tsx', 'js', 'jsx'],
    routeStyle = 'remix',
    ...options
  }: WebpackPluginReactPagesOptions = {}) {
    this.options = this.resolveOptions({
      extensions,
      routeStyle,
      ...options,
    })
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
    // TODO: type safe
    this.page = new PageContext(this.options as any) as any
  }

  resolveOptions({
    extensions = ['ts', 'tsx', 'js', 'jsx'],
    routeStyle = 'remix',
    ...options
  }: WebpackPluginReactPagesOptions = {}) {
    logger(
      isSupportPartialCompile(options)
        ? 'Experimental.partialCompile is enabled'
        : 'Experimental.partialCompile is disabled',
    )
    warning(
      !options.experimental?.partialCompile || isSupportPartialCompile(options),
      '`Experimental.partialCompile` only available with nextEnhancedResolver',
    )
    return {
      extensions,
      routeStyle,
      resolver: 'react',
      onRoutesGenerated: isSupportPartialCompile(options)
        ? (routes: any[]) => {
            return filterRoutes(routes, [...this.requestHistory.paths.values()])
          }
        : undefined,
      ...options,
    } as WebpackPluginReactPagesOptions
  }

  apply(compiler: Compiler) {
    compiler.$page = this.page
    compiler.$state = {
      isSupportPartialCompile: isSupportPartialCompile(this.options),
    }
    if (!compiler.options.resolve) {
      compiler.options.resolve = {}
    }
    const devServer = compiler.options.devServer!
    devServer.setupMiddlewares = (middlewares: any[], devServer: any) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined')
      }

      if (!isSupportPartialCompile(this.options)) {
        return middlewares
      }

      devServer.app?.get('*', (req: { url: string }, _: any, next: () => void) => {
        const ext = extname(req.url)
        // skip assets request
        if (ext) {
          next()
          return
        }
        let pathname = req.url
        if (req.url.startsWith(PREFIX)) {
          pathname = req.url.slice(PREFIX.length)
        }
        this.requestHistory.paths.add(pathname)
        console.log('currently active pathnames:', [...this.requestHistory.paths.values()])
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
