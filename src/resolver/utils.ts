import { cacheAllRouteRE, countSlashRE, dynamicRouteRE, replaceDynamicRouteRE } from './constants'
import type { ResolvedOptions } from '../vite-plugin-pages-types'

export function countSlash(value: string) {
  return (value.match(countSlashRE) || []).length
}

export function isDynamicRoute(routePath: string) {
  return dynamicRouteRE.test(routePath)
}

export function isCatchAllRoute(routePath: string) {
  return cacheAllRouteRE.test(routePath)
}

export function normalizeCase(str: string, caseSensitive: boolean) {
  if (!caseSensitive) return str.toLocaleLowerCase()
  return str
}

export function resolveImportMode(filepath: string, options: ResolvedOptions) {
  const mode = options.importMode
  if (typeof mode === 'function') return mode(filepath, options)
  return mode
}

export function normalizeName(name: string, isDynamic: boolean) {
  if (!isDynamic) return name

  return name.replace(replaceDynamicRouteRE, '$1')
}

function isStartOfLayoutSegment(node: string) {
  return node[0] === '_' && node[1] === '_'
}

export function buildReactRoutePath(node: string): string | undefined {
  const isDynamic = isDynamicRoute(node)
  const isCatchAll = isCatchAllRoute(node)
  const normalizedName = normalizeName(node, isDynamic)

  if (isStartOfLayoutSegment(node)) {
    return undefined
  }

  if (isDynamic) {
    if (isCatchAll) return '*'

    return `:${normalizedName}`
  }

  return `${normalizedName}`
}
