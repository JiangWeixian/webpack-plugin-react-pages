export interface ResolvedOptions {
  root: string
  /**
   * @default .rlm
   */
  dirname: string
  /**
   * @description Virtual module dir path
   * @default root/node_modules/.rlm
   */
  dir: string
  /**
   * @description map module id to local path
   * @example { 'vm': 'root/node_modules/.rlm/vm' }
   */
  moduleIdToPath: Record<string, string>
  /**
   * @description map module id to content
   */
  moduleIdToContent: Record<string, string>
}
