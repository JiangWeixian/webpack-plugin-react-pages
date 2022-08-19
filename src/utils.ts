import Debug from 'debug'
import { matchPath } from 'react-router'
import { ReactRouteBase } from './resolver/next-enhanced'

export const logger = Debug('wprp')

const multipleMatchPath = (options: Parameters<typeof matchPath>[0], pathnames: string[]) => {
  return pathnames
    .map((pathname) => {
      return matchPath(options, pathname)
    })
    .some((matched) => matched)
}

/**
 * @description like matchRoute, but keep original routes structue
 */
export const filterRoutes = (routes: ReactRouteBase[], pathnames: string[]) => {
  const matchedRoutes: ReactRouteBase[] = []
  if (!routes) {
    return
  }
  routes.forEach((route) => {
    if (!route.absolutePath) {
      return
    }
    const matched = multipleMatchPath(
      { path: route.absolutePath!, end: !route.children, caseSensitive: route.caseSensitive },
      pathnames,
    )
    if (route.children) {
      route.children = filterRoutes(route.children, pathnames)
    }
    if (matched) {
      matchedRoutes.push(route)
    }
  })
  return matchedRoutes
}
