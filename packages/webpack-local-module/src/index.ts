import { join } from 'node:path'

import { outputFileSync } from 'fs-extra'

import { resolveId } from './utils'

import type { Compiler, RspackPluginInstance } from '@rspack/core'

type Modules = Record<string, string>

interface ResolvedOptions {
  root: string
  moduleIdToPath: Record<string, string>
  moduleIdToContent: Record<string, string>
}

export interface Options {
  /**
   * @description Write virtual module into dirname
   * @default .rlm
   */
  dirname?: string
}

const DIRNAME = '.rlm'

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
    const path = this.resolvedOptions.moduleIdToPath[id]
    if (path) {
      outputFileSync(path, nextContent)
    }
  }

  private writeModules(modules: Modules) {
    for (const [moduleId, content] of Object.entries(modules)) {
      this.writeModule(moduleId, content)
    }
  }

  private resolveOptions(compiler: Compiler, options: Options, modules: Record<string, string>) {
    const resolvedRoot = join(compiler.context ?? process.cwd(), 'node_modules', options.dirname ?? DIRNAME)
    const moduleIdToPath: Record<string, string> = {}
    const moduleIdToContent: Record<string, string> = {}
    for (const [moduleId] of Object.entries(modules)) {
      const id = resolveId(moduleId, resolvedRoot)
      moduleIdToPath[id] = join(resolvedRoot, id)
      moduleIdToContent[id] = this.modules[moduleId]
    }
    return {
      root: resolvedRoot,
      moduleIdToPath,
      moduleIdToContent,
    }
  }
}
