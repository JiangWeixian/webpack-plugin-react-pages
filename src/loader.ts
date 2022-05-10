import type webpack from 'webpack'
import { VIRTUAL_ROUTES_ID_TEST } from './constants'

async function RoutesLoader(this: webpack.LoaderContext<any>, source: string) {
  const callback = this.async()
  this.cacheable(false)
  const match = this.resource.match(new RegExp(VIRTUAL_ROUTES_ID_TEST))

  if (!match) {
    callback(null, source)
    return null
  }

  // already work fined
  // console.log(source)
  callback(null, source)
  return null
}

export default RoutesLoader
