import { join } from 'node:path'

import { withoutLeadingSlash } from 'ufo'

import type { ResolvedOptions } from './types'

/**
 * @description Get module id relative to root node_modules
 * @example node_modules/vm -> vm
 * @example root/node_modules/vm -> vm
 */
export function resolveId(moduleId: string, root: string = process.cwd()) {
  return withoutLeadingSlash(
    moduleId
      .replace(root, '')
      .replace(/\/*node_modules\//, ''),
  )
}

/**
 * @description Temp virtual module filepath
 * @example vm -> root/node_modules/.rlm/vm
 */
export function resolvePath(id: string, options: Pick<ResolvedOptions, 'dir'>) {
  return join(options.dir, id)
}
