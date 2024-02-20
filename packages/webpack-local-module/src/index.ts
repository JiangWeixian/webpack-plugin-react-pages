import { outputFileSync } from 'fs-extra'

import { DIRNAME } from './constants'
import { resolveId, resolvePath } from './utils'

import type { Compiler, RspackPluginInstance } from '@rspack/core'
import type { ResolvedOptions } from './types'

type Modules = Record<string, string>

export interface Options {
  /**
   * @description Write virtual module into dirname
   * @default .rlm
   */
  dirname?: string
}

export class WebpackLocalModule implements RspackPluginInstance {
  private modules: Modules = {}
  private options: Options = {}
  private resolvedOptions: ResolvedOptions = {} as ResolvedOptions
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
    const resolvedDir = options.dirname ?? DIRNAME
    const moduleIdToPath: Record<string, string> = {}
    const moduleIdToContent: Record<string, string> = {}
    for (const [moduleId] of Object.entries(modules)) {
      const id = resolveId(moduleId, resolvedRoot)
      moduleIdToPath[id] = resolvePath(id, {
        root: resolvedRoot,
        dirname: resolvedDir,
      })
      moduleIdToContent[id] = this.modules[moduleId]
    }
    return {
      dirname: resolvedDir,
      root: resolvedRoot,
      moduleIdToPath,
      moduleIdToContent,
    }
  }
}
