import { resolve } from 'node:path'

import { logger } from './utils'

import type webpack from 'webpack'
import type { Compiler } from './types'

interface RoutesLoaderOptions {
  namespace?: string
}

async function RoutesLoader(
  this: webpack.LoaderContext<RoutesLoaderOptions>,
  _source: string,
  ...args: any
) {
  const callback = this.async()
  const { namespace } = this.getOptions()
  this.cacheable(true)
  let $page = (this._compiler as Compiler).$page
  if (namespace) {
    $page = this._compiler?.[namespace]?.$page
  }
  // Make HMR work
  $page.options.dirs.forEach((options) => {
    const dir = resolve(this._compiler.context, options.dir)
    this.addContextDependency(dir)
  })

  logger('page instance', $page)

  $page.pageRouteMap.clear()
  await $page.searchGlob()
  const routes = await $page.resolveRoutes()
  logger('routes content', routes)

  callback(null, routes, ...args)
  return null
}

export default RoutesLoader
