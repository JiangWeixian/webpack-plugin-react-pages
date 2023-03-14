import type webpack from 'webpack'

import type { Compiler } from './types'
import { logger } from './utils'

async function RoutesLoader(this: webpack.LoaderContext<any>, source: string, ...args: any) {
  const callback = this.async()
  // disable cache, make sure the pages data is always called
  this.cacheable(false)
  const $page = (this._compiler as Compiler).$page

  logger('page instance', $page)

  $page.pageRouteMap.clear()
  await $page.searchGlob()
  const routes = await $page.resolveRoutes()
  logger('routes content', routes)

  callback(null, routes, ...args)
  return null
}

export default RoutesLoader
