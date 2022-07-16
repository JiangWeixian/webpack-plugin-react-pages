import type { Compiler as WebpackCompiler } from 'webpack'
import type { PageContext } from 'vite-plugin-pages'

export type Compiler = WebpackCompiler & {
  $page: PageContext
}
