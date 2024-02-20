import { withoutLeadingSlash } from 'ufo'

export function resolveId(moduleId: string, root: string = process.cwd()) {
  return withoutLeadingSlash(
    moduleId
      .replace(root, '')
      .replace(/\/*node_modules\//, ''),
  )
}
