import { fileURLToPath } from 'node:url'

import {
  dirname,
  join,
  resolve,
} from 'pathe'
// eslint-disable-next-line import/no-extraneous-dependencies -- rollup will bundle this package
import { PageContext } from 'vite-plugin-pages'
import webpack from 'webpack'
import { WebpackLocalModule } from 'webpack-local-module'
import VirtualModulesPlugin from 'webpack-virtual-modules'

import { createFilteredWatchFileSystem } from './wfs'

import type { Options as WebpackLocalModuleOptions } from 'webpack-local-module'
import type { Compiler } from './types'
import type {
  PageContext as PageContextImpl,
  PageResolver,
  UserOptions,
} from './vite-plugin-pages-types'

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
  'moduleId' | 'nuxtStyle' | 'pagesDir' | 'replaceSquareBrackets' | 'resolver' | 'syncIndex'
> & {
  resolver?: PageResolver
  /**
   * @description Register PageContext instance namespace
   * if namespace defined, access via compiler[namespace].page, otherwise compiler.page
   * @default undefined
   */
  namespace?: string
  /**
   * @description With rspack bundler, virtual react pages module will write into disk
   * @default false
   */
  rspack?: boolean
  /**
   * @description With rspack bundler, use `webpack-local-module` custom behavior with localModuleOptions
   */
  localModuleOptions?: WebpackLocalModuleOptions
}

const isVirtualSchemaModule = (id: string) => id.includes('virtual:')

export class WebpackPluginReactPages {
  vm: VirtualModulesPlugin | WebpackLocalModule
  nmp?: webpack.NormalModuleReplacementPlugin
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
  shouldSupportVirtualModules = false
  namespace?: string
  rspack?: boolean
  private _watchRunPatched: WeakSet<Compiler> = new WeakSet()
  constructor({
    extensions = ['ts', 'tsx', 'js', 'jsx'],
    routeStyle = 'remix',
    namespace,
    rspack = false,
    localModuleOptions,
    ...options
  }: WebpackPluginReactPagesOptions = {}) {
    this.page = new PageContext({
      extensions,
      routeStyle,
      resolver: 'react',
      ...options,
      // TODO: type safe
    } as any) as any
    this.namespace = namespace
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
    this.rspack = rspack
    this.vm = rspack
      ? new WebpackLocalModule({
        ...modules,
      }, localModuleOptions ?? { dirname: '.react-routes' })
      : new VirtualModulesPlugin({
        ...modules,
      })
  }

  apply(compiler: Compiler) {
    const invalid = () => {
      this.resolvedModuleIds.forEach((id) => {
        this.vm.writeModule(`node_modules/${id}`, template)
      })
    }
    if (this.namespace) {
      compiler[this.namespace] = {}
      compiler[this.namespace].$page = this.page
      compiler[this.namespace].$page.invalid = invalid
    } else {
      compiler.$page = this.page
      compiler.$page.invalid = invalid
    }
    // support `virtual:` protocol in webpack@5
    if (this.shouldSupportVirtualModules && !this.rspack) {
      this.nmp = new webpack.NormalModuleReplacementPlugin(this.moduleRE, (resource) => {
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
    if (this.rspack) {
      compiler.options.resolve.alias = {
        ...compiler.options.resolve.alias,
        // rspack not support import file from `/src/*`
        '/src': join(this.page.options.root, 'src'),
      }
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
          options: {
            namespace: this.namespace,
          },
        },
      ],
    })

    // webpack-virtual-modules include webpack@v4 types directly
    // Applying a webpack compiler to the virtual module
    this.vm.apply(compiler as any)

    // Register virtual module during build
    !this.rspack && compiler.hooks.compilation.tap(PLUGIN, () => {
      invalid()
    })

    // rspack not support webpack-virtual-modules, disable patch watch file system
    // related to pr: https://github.com/sysgears/webpack-virtual-modules/pull/129/files
    if (!this._watchRunPatched.has(compiler) && !this.rspack) {
      compiler.watchFileSystem = createFilteredWatchFileSystem(compiler.watchFileSystem as any)
      this._watchRunPatched.add(compiler)
    }
  }
}
