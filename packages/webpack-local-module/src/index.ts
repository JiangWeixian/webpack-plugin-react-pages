import { join } from 'node:path'

import { outputFileSync } from 'fs-extra'

import { DIRNAME } from './constants'
import { resolveId, resolvePath } from './utils'

import type { Compiler, RspackPluginInstance } from '@rspack/core'
import type { ResolvedOptions } from './types'

/**
 * @description map module id to content, module id could be `node_modules/vm` or `vm`
 * @example { 'vm': 'module.exports = 1' }
 */
type Modules = Record<string, string>

export interface Options {
  /**
   * @description Virtual module's dirname
   * @default .rlm
   */
  dirname?: string
}

export class WebpackLocalModule implements RspackPluginInstance {
  private options: Options = {}
  private modules: Modules = {}
  resolvedOptions: ResolvedOptions = {} as ResolvedOptions
  constructor(modules: Modules, options: Options = {}) {
    this.modules = modules
    this.options = options
  }

  apply(compiler: Compiler) {
    this.resolvedOptions = this.resolveOptions(
      compiler,
      this.options,
      this.modules,
    )
    compiler.options.resolve.alias = {
      ...compiler.options.resolve.alias,
      ...(this.resolvedOptions.moduleIdToPath ?? {}),
    }
    this.writeModules(this.resolvedOptions.moduleIdToContent)
  }

  writeModule(moduleId: string, nextContent: string) {
    const id = resolveId(moduleId, this.resolvedOptions.root)
    const path = this.resolvedOptions.moduleIdToPath[id] ?? resolvePath(id, this.resolvedOptions)
    if (path) {
      this.resolvedOptions.moduleIdToPath[id] = path
      outputFileSync(path, nextContent)
    }
  }

  private writeModules(modules: Modules) {
    for (const [moduleId, content] of Object.entries(modules)) {
      this.writeModule(moduleId, content)
    }
  }

  private resolveOptions(compiler: Compiler, options: Options, modules: Record<string, string>) {
    const resolvedRoot = compiler.context ?? process.cwd()
    const dirname = options.dirname ?? DIRNAME
    const resolvedDir = join(resolvedRoot, 'node_modules', dirname)
    const moduleIdToPath: Record<string, string> = {}
    const moduleIdToContent: Record<string, string> = {}
    for (const [moduleId] of Object.entries(modules)) {
      const id = resolveId(moduleId, resolvedRoot)
      moduleIdToPath[id] = resolvePath(id, {
        dir: resolvedDir,
      })
      moduleIdToContent[id] = this.modules[moduleId]
    }
    return {
      dirname,
      dir: resolvedDir,
      root: resolvedRoot,
      moduleIdToPath,
      moduleIdToContent,
    }
  }
}
