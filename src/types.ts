import type { Compiler as WebpackCompiler } from 'webpack'
import type { PageContext } from './vite-plugin-pages-types'

export type Compiler = WebpackCompiler & {
  $page: PageContext
}
