import type webpack from 'webpack'

import type { Compiler } from './types'
import { VIRTUAL_PAGES_ID_TEST, PREFIX } from './constants'
import { logger } from './utils'

const partialCompile = `
import 'url-change-event'
if (process.env.NODE_ENV === 'development') {
  window.addEventListener('urlchangeevent', function (e) {
    e.newURL && fetch(\`${PREFIX}\${e.newURL.pathname}\`)
  })
}
`

async function RoutesLoader(this: webpack.LoaderContext<any>, source: string, ...args: any) {
  const callback = this.async()
  // disable cache, make sure the pages data is always called
  this.cacheable(false)
  const match = this.resource.match(new RegExp(VIRTUAL_PAGES_ID_TEST))

  if (!match) {
    callback(null, source, ...args)
    return null
  }

  const $page = (this._compiler as Compiler).$page
  const $state = (this._compiler as Compiler).$state

  $page.pageRouteMap.clear()
  await $page.searchGlob()
  let routes = await $page.resolveRoutes()
  if ($state.isSupportPartialCompile) {
    routes = `
    ${partialCompile}
    ${routes}
    `
  }
  logger('routes content', routes)

  callback(null, routes, ...args)
  return null
}

export default RoutesLoader
