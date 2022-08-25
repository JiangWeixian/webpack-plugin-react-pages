import Debug from 'debug'
import { matchPath } from 'react-router'
import { ReactRouteBase } from './resolver/next-enhanced'

export const logger = Debug('wprp')

export const warning = (condition: boolean, message: string) => {
  if (!condition) {
    console.warn(message)
  }
}

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
    let matched = false
    if (route.absolutePath) {
      matched = multipleMatchPath(
        { path: route.absolutePath!, end: !route.children, caseSensitive: route.caseSensitive },
        pathnames,
      )
    }
    if (route.children) {
      route.children = filterRoutes(route.children, pathnames)
    }
    if (matched || (route.children && route.children?.length > 0)) {
      matchedRoutes.push(route)
    }
  })
  return matchedRoutes
}
