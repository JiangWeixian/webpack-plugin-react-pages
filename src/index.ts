import type webpack from 'webpack'
// eslint-disable-next-line import/no-extraneous-dependencies -- rollup will bundle this package
import { PageContext } from 'vite-plugin-pages'
import VirtualModulesPlugin from 'webpack-virtual-modules'
import { resolve } from 'pathe'
// import chokidar from 'chokidar'
import { createFilteredWatchFileSystem } from './wfs'
import Debug from 'debug'

import { VIRTUAL_ROUTES_ID_TEST } from './constants'

const routesLoader = resolve(__dirname, 'loader.cjs')
const logger = Debug('webpack-plugin-routes')
const PLUGIN = 'WEBAPCK_PLUGIN_PAGES'

export class RoutesWebpackPlugin {
  vm: VirtualModulesPlugin
  private _watchRunPatched: WeakSet<webpack.Compiler> = new WeakSet()
  constructor() {
    this.vm = new VirtualModulesPlugin({
      'virtual-react-pages.ts': `
      const routes = []
      export default routes;
      `,
    })
  }

  apply(compiler: webpack.Compiler) {
    const page = new PageContext({ resolver: 'react', extensions: ['ts', 'tsx', 'js', 'jsx'] })
    // TODO: root should as same as page.root
    // this is not make sense
    // const watcher = chokidar.watch(process.cwd(), {
    //   ignored: ['**/node_modules/**', '**/.git/**'],
    //   ignoreInitial: true,
    //   ignorePermissionErrors: true,
    //   disableGlobbing: true,
    // })

    // page.setupWatcher(watcher)

    if (!compiler.options.resolve) {
      compiler.options.resolve = {}
    }
    compiler.options.module.rules.push({
      include(resource) {
        return VIRTUAL_ROUTES_ID_TEST.test(resource)
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
      for (const dir of page.options.dirs) {
        logger(dir)
        compilation.contextDependencies.add(resolve(compiler.context, dir.dir))
      }
    })

    // setup alias
    compiler.options.resolve.alias = {
      ...compiler.options.resolve.alias,
      'virtual-react-pages': resolve(compiler.context, 'virtual-react-pages.ts'),
    }

    // Applying a webpack compiler to the virtual module
    this.vm.apply(compiler)

    compiler.hooks.beforeCompile.tap(PLUGIN, async () => {
      // fs watcher unlink run after searchGlob
      // always generate new page route Map
      page.pageRouteMap.clear()
      await page.searchGlob()
      const routes = await page.resolveRoutes()
      logger('before compile')
      this.vm.writeModule('virtual-react-pages.ts', routes)
    })

    // related to pr: https://github.com/sysgears/webpack-virtual-modules/pull/129/files
    if (!this._watchRunPatched.has(compiler)) {
      compiler.watchFileSystem = createFilteredWatchFileSystem(compiler.watchFileSystem as any)
      this._watchRunPatched.add(compiler)
    }
  }
}
