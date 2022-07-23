import { resolveImportMode } from './utils'
import { ROUTE_IMPORT_NAME } from './constants'

import type { ResolvedOptions } from '../vite-plugin-pages-types'

const componentRE = /"(?:component|element)":("(.*?)")/g

const multilineCommentsRE = /\/\*(.|[\r\n])*?\*\//gm
const singlelineCommentsRE = /\/\/.*/g

function replaceFunction(_: any, value: any) {
  if (value instanceof Function || typeof value === 'function') {
    const fnBody = value
      .toString()
      .replace(multilineCommentsRE, '')
      .replace(singlelineCommentsRE, '')
      .replace(/(\t|\n|\r|\s)/g, '')

    // ES6 Arrow Function
    if (fnBody.length < 8 || fnBody.substring(0, 8) !== 'function') return `_NuFrRa_${fnBody}`

    return fnBody
  }

  return value
}

/**
 * Creates a stringified Vue Router route definition.
 */
export function stringifyRoutes(preparedRoutes: any[], options: ResolvedOptions) {
  const importsMap: Map<string, string> = new Map()

  function getImportString(path: string, importName: string) {
    const mode = resolveImportMode(path, options)
    return mode === 'sync'
      ? `import ${importName} from "${path}"`
      : `const ${importName} = ${
          options.resolver.stringify?.dynamicImport?.(path) || `() => import("${path}")`
        }`
  }

  function componentReplacer(str: string, replaceStr: string, path: string) {
    let importName = importsMap.get(path)

    if (!importName) importName = ROUTE_IMPORT_NAME.replace('$1', `${importsMap.size}`)

    importsMap.set(path, importName)

    importName = options.resolver.stringify?.component?.(importName) || importName

    return str.replace(replaceStr, importName)
  }

  const stringRoutes = JSON.stringify(preparedRoutes, replaceFunction).replace(
    componentRE,
    componentReplacer,
  )

  const imports = Array.from(importsMap).map((args) => getImportString(...args))

  return {
    imports,
    stringRoutes,
  }
}

export function generateClientCode(routes: any[], options: ResolvedOptions) {
  const { imports, stringRoutes } = stringifyRoutes(routes, options)
  const code = `${imports.join(
    ';\n',
  )};\n\nconst routes = ${stringRoutes};\n\nexport default routes;`
  return options.resolver.stringify?.final?.(code) || code
}
