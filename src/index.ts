import type webpack from 'webpack'
import { PageContext } from 'vite-plugin-pages'
import VirtualModulesPlugin from 'webpack-virtual-modules'
import { resolve } from 'pathe'
import chokidar from 'chokidar'

import { VIRTUAL_ROUTES_ID_TEST } from './constants'
import path from 'path'

const routesLoader = resolve(__dirname, 'loader.cjs')

const PLUGIN = 'ROUTES_PLUGIN'

export class RoutesWebpackPlugin {
  apply(compiler: webpack.Compiler) {
    const page = new PageContext({ resolver: 'react' })
    const watcher = chokidar.watch('**/*.tsx', { cwd: process.cwd(), ignored: ['node_modules'] })

    page.setupWatcher(watcher)

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
        compilation.contextDependencies.add(path.resolve(process.cwd(), dir.dir))
      }
    })

    // setup alias
    compiler.options.resolve.alias = {
      ...compiler.options.resolve.alias,
      'virtual/react-pages': resolve(compiler.context, 'virtual/react-pages.ts'),
    }

    const virtualModules = new VirtualModulesPlugin({
      'virtual/react-pages.ts': '',
    })
    // Applying a webpack compiler to the virtual module
    virtualModules.apply(compiler)

    compiler.hooks.beforeCompile.tap(PLUGIN, async () => {
      await page.searchGlob()
      const routes = await page.resolveRoutes()
      console.log(routes)
      virtualModules.writeModule('virtual/react-pages.ts', routes)
    })

    compiler.hooks.invalid.tap(PLUGIN, async () => {
      console.log('invalid')
      await page.searchGlob()
      const routes = await page.resolveRoutes()
      console.log(routes)
      virtualModules.writeModule('virtual/react-pages.ts', routes)
    })
  }
}
