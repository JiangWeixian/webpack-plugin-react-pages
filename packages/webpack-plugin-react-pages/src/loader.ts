import { logger } from './utils'

import type webpack from 'webpack'
import type { Compiler } from './types'

interface RoutesLoaderOptions {
  namespace?: string
}

async function RoutesLoader(
  this: webpack.LoaderContext<RoutesLoaderOptions>,
  source: string,
  ...args: any
) {
  const callback = this.async()
  const { namespace } = this.getOptions()
  // disable cache, make sure the pages data is always called
  this.cacheable(false)
  let $page = (this._compiler as Compiler).$page
  if (namespace) {
    $page = this._compiler?.[namespace]?.$page
  }

  logger('page instance', $page)

  $page.pageRouteMap.clear()
  await $page.searchGlob()
  const routes = await $page.resolveRoutes()
  logger('routes content', routes)

  callback(null, routes, ...args)
  return null
}

export default RoutesLoader
