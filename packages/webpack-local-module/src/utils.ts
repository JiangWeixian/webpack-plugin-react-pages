import { join } from 'node:path'

import { withoutLeadingSlash } from 'ufo'

import type { ResolvedOptions } from './types'

export function resolveId(moduleId: string, root: string = process.cwd()) {
  return withoutLeadingSlash(
    moduleId
      .replace(root, '')
      .replace(/\/*node_modules\//, ''),
  )
}

export function resolvePath(id: string, options: Pick<ResolvedOptions, 'dirname' | 'root'>) {
  return join(options.root, 'node_modules', options.dirname, id)
}
