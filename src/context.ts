import { extname, join, resolve } from 'path'
import { slash, toArray } from '@antfu/utils'
import { resolveOptions } from './options'
import { getPageFiles } from './files'
import { debug, isTarget } from './utils'

import type { FSWatcher } from 'fs'
import type { PageOptions, ResolvedOptions, UserOptions } from './types'

export interface PageRoute {
  path: string
  route: string
}

export class PageContext {
  private _pageRouteMap = new Map<string, PageRoute>()

  rawOptions: UserOptions
  root: string
  options: ResolvedOptions

  constructor(userOptions: UserOptions, viteRoot: string = process.cwd()) {
    this.rawOptions = userOptions
    this.root = slash(viteRoot)
    debug.env('root', this.root)
    this.options = resolveOptions(userOptions, this.root)
    debug.options(this.options)
  }

  setupWatcher(watcher: FSWatcher) {
    watcher.on('unlink', async (path) => {
      path = slash(path)
      if (!isTarget(path, this.options)) return
      await this.removePage(path)
    })
    watcher.on('add', async (path) => {
      path = slash(path)
      if (!isTarget(path, this.options)) return
      const page = this.options.dirs.find((i) => path.startsWith(slash(resolve(this.root, i.dir))))!
      await this.addPage(path, page)
    })

    watcher.on('change', async (path) => {
      path = slash(path)
      if (!isTarget(path, this.options)) return
      const page = this._pageRouteMap.get(path)
      if (page) await this.options.resolver.hmr?.changed?.(this, path)
    })
  }

  async addPage(path: string | string[], pageDir: PageOptions) {
    debug.pages('add', path)
    for (const p of toArray(path)) {
      const pageDirPath = slash(resolve(this.root, pageDir.dir))
      const route = slash(
        join(pageDir.baseRoute, p.replace(`${pageDirPath}/`, '').replace(extname(p), '')),
      )
      this._pageRouteMap.set(p, {
        path: p,
        route,
      })
      await this.options.resolver.hmr?.added?.(this, p)
    }
  }

  async removePage(path: string) {
    debug.pages('remove', path)
    this._pageRouteMap.delete(path)
    await this.options.resolver.hmr?.removed?.(this, path)
  }

  async resolveRoutes() {
    return this.options.resolver.resolveRoutes(this)
  }

  async searchGlob() {
    const pageDirFiles = this.options.dirs.map((page) => {
      const pagesDirPath = slash(resolve(this.options.root, page.dir))
      const files = getPageFiles(pagesDirPath, this.options)
      debug.search(page.dir, files)
      return {
        ...page,
        files: files.map((file) => slash(file)),
      }
    })

    for (const page of pageDirFiles) await this.addPage(page.files, page)

    debug.cache(this.pageRouteMap)
  }

  get debug() {
    return debug
  }

  get pageRouteMap() {
    return this._pageRouteMap
  }
}