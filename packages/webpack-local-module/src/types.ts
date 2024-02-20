export interface ResolvedOptions {
  root: string
  dirname: string
  moduleIdToPath: Record<string, string>
  moduleIdToContent: Record<string, string>
}
