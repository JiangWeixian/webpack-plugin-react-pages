import { NormalModuleReplacementPlugin } from 'webpack'
// eslint-disable-next-line import/no-extraneous-dependencies -- rollup will bundle this package
import { PageContext } from 'vite-plugin-pages'
import type {
  UserOptions,
  PageResolver,
  PageContext as PageContextImpl,
} from './vite-plugin-pages-types'
import VirtualModulesPlugin from 'webpack-virtual-modules'
import { resolve, dirname } from 'pathe'
import { fileURLToPath } from 'url'

import { Compiler } from './types'
import { createFilteredWatchFileSystem } from './wfs'
import { logger } from './utils'

const __dirname = dirname(fileURLToPath(import.meta.url))
const routesLoader = resolve(__dirname, 'loader.cjs')
const PLUGIN = 'WEBPACK_PLUGIN_REACT_PAGES'
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

const isVirtualSchemaModule = (id: string) => id.includes('virtual:')

export class WebpackPluginReactPages {
  vm: VirtualModulesPlugin
  nmp?: NormalModuleReplacementPlugin
  page: PageContextImpl
  /**
   * @description Modules used in project
   */
  moduleIds: string[]
  /**
   * @description Resolved modules write via virtual-module
   * will replace `virtual:` to `virtual-`
   */
  resolvedModuleIds: string[]
  /**
   * @description Filter modules id include `virtual:`
   */
  virtualSchemaModuleIds: string[]
  moduleRE: RegExp
  resolvedModuleRE: RegExp
  shouldSupportVirtualModules = true
  private _watchRunPatched: WeakSet<Compiler> = new WeakSet()
  constructor({
    extensions = ['ts', 'tsx', 'js', 'jsx'],
    routeStyle = 'remix',
    ...options
  }: WebpackPluginReactPagesOptions = {}) {
    this.page = new PageContext({
      extensions,
      routeStyle,
      resolver: 'react',
      ...options,
      // TODO: type safe
    } as any) as any
    this.moduleIds = this.page.options.resolver.resolveModuleIds()
    this.resolvedModuleIds = this.moduleIds.map((id) => {
      let resolvedId = id
      // virtual:react-pages -> virtual-react-pages
      if (isVirtualSchemaModule(id)) {
        this.shouldSupportVirtualModules = true
        resolvedId = id.replace('virtual:', 'virtual-')
      }
      return resolvedId
    })
    this.virtualSchemaModuleIds = this.moduleIds.filter(isVirtualSchemaModule)
    this.moduleRE = new RegExp(`(${this.moduleIds.join('|')})`)
    this.resolvedModuleRE = new RegExp(`(${this.resolvedModuleIds.join('|')})`)
    const modules = {}
    this.resolvedModuleIds.forEach((id) => {
      modules[`node_modules/${id}`] = template
    })
    this.vm = new VirtualModulesPlugin({
      ...modules,
    })
  }

  apply(compiler: Compiler) {
    compiler.$page = this.page
    // support `virtual:` protocol
    if (this.shouldSupportVirtualModules) {
      this.nmp = new NormalModuleReplacementPlugin(this.moduleRE, (resource) => {
        resource.request = resolve(
          compiler.context,
          `node_modules/${resource.request.replace('virtual:', 'virtual-')}`,
        )
      })
      this.nmp.apply(compiler)
    }

    if (!compiler.options.resolve) {
      compiler.options.resolve = {}
    }
    const resolvedModuleRE = this.resolvedModuleRE
    compiler.options.module.rules.push({
      include(resource) {
        return resolvedModuleRE.test(resource)
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

    // webpack-virtual-modules include webpack@v4 types directly
    // Applying a webpack compiler to the virtual module
    this.vm.apply(compiler as any)

    compiler.hooks.compilation.tap(PLUGIN, () => {
      this.resolvedModuleIds.forEach((id) => {
        this.vm.writeModule(`node_modules/${id}`, template)
      })
    })

    // related to pr: https://github.com/sysgears/webpack-virtual-modules/pull/129/files
    if (!this._watchRunPatched.has(compiler)) {
      compiler.watchFileSystem = createFilteredWatchFileSystem(compiler.watchFileSystem as any)
      this._watchRunPatched.add(compiler)
    }
  }
}
