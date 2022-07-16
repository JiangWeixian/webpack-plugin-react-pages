import { NormalModuleReplacementPlugin } from 'webpack'
// eslint-disable-next-line import/no-extraneous-dependencies -- rollup will bundle this package
import { PageContext } from 'vite-plugin-pages'
import type { UserOptions, PageResolver } from 'vite-plugin-pages'
import VirtualModulesPlugin from 'webpack-virtual-modules'
import { resolve } from 'pathe'

import { Compiler } from './types'
import { createFilteredWatchFileSystem } from './wfs'
import { logger } from './utils'

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

export class WebpackPluginReactPages {
  vm: VirtualModulesPlugin
  nmp: NormalModuleReplacementPlugin
  page: PageContext
  private _watchRunPatched: WeakSet<Compiler> = new WeakSet()
  constructor({
    extensions = ['ts', 'tsx', 'js', 'jsx'],
    ...options
  }: WebpackPluginReactPagesOptions = {}) {
    this.vm = new VirtualModulesPlugin({
      VIRTUAL_PAGES_ID: template,
    })
    // support `virtual:` protocol
    this.nmp = new NormalModuleReplacementPlugin(/^virtual:react-pages/, (resource) => {
      resource.request = 'virtual-react-pages'
    })
    this.page = new PageContext({
      extensions,
      resolver: 'react',
      ...options,
    })
  }

  apply(compiler: Compiler) {
    compiler.$page = this.page
    if (!compiler.options.resolve) {
      compiler.options.resolve = {}
    }
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
