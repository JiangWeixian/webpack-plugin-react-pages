export const dynamicRouteRE = /^\[(.+)\]$/
export const cacheAllRouteRE = /^\[\.{3}(.*)\]$/
export const replaceDynamicRouteRE = /^\[(?:\.{3})?(.*)\]$/

export const nuxtDynamicRouteRE = /^_(.*)$/
export const nuxtCacheAllRouteRE = /^_$/

export const countSlashRE = /\//g

export const replaceIndexRE = /\/?index$/

export const ROUTE_IMPORT_NAME = '__pages_import_$1__'
