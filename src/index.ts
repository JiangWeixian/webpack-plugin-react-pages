// @ts-nocheck
import type webpack from 'webpack'
import VirtualModulesPlugin from 'webpack-virtual-modules'
import { resolve } from 'pathe'
import chokidar from 'chokidar'

import { PageContext } from './context'
import { VIRTUAL_ROUTES_ID_TEST } from './constants'
import path from 'path'

const routesLoader = resolve(__dirname, 'loader.cjs')
const routesBabelLoader = resolve(__dirname, 'babel.cjs')
console.log(routesLoader)

const PLUGIN = 'ROUTES_PLUGIN'

export class RoutesWebpackPlugin {
  _generated = false
  apply(compiler: webpack.Compiler) {
    const page = new PageContext({ resolver: 'react' })

    console.log(process.cwd())
    const watcher = chokidar.watch('**/*.tsx', { cwd: process.cwd(), ignored: ['node_modules'] })
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
          loader: 'babel-loader',
          options: {
            plugins: [routesBabelLoader],
          },
        },
        {
          loader: routesLoader,
        },
      ],
    })

    compiler.hooks.compilation.tap(PLUGIN, async compiliation => {
      console.log(path.resolve(process.cwd(), 'src/pages'));
      compiliation.contextDependencies.add(path.resolve(process.cwd(), 'src/pages'));
    })

    console.log(compiler.options.module.rules)

    // setup alias
    compiler.options.resolve.alias = {
      ...compiler.options.resolve.alias,
      // add virtual:windi-$layer aliases,
      'virtual/routes': resolve(compiler.context, 'virtual/routes.ts'),
    }

    console.log(compiler.options.resolve)

    const virtualModules = new VirtualModulesPlugin({
      'virtual/routes.ts': 'export const routes = []',
    })
    // Applying a webpack compiler to the virtual module
    virtualModules.apply(compiler)

    watcher.on('add', async (_path) => {
      await page.searchGlob()
      const routes = await page.resolveRoutes()
      console.log(_path)
      virtualModules.writeModule('virtual/routes.ts', routes)
      this._generated = true
    })

    compiler.hooks.beforeCompile.tap(PLUGIN, async () => {
      console.log('beforeCompile')
      await page.searchGlob()
      const routes = await page.resolveRoutes()
      virtualModules.writeModule('virtual/routes.ts', routes)
      this._generated = true
    })

    compiler.hooks.invalid.tap(PLUGIN, async () => {
      console.log('invalid')
      // await page.searchGlob()
      // const routes = await page.resolveRoutes()
      // virtualModules.writeModule('virtual/routes.ts', routes)
      // this._generated = true
    })
  }
}
