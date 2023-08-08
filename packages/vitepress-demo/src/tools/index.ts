import MarkdownIt from 'markdown-it'
import { normalizePath } from 'vite'
import type { ResolvedConfig, UserConfig, ViteDevServer } from 'vite'
import fsExtra from 'fs-extra'
import type { MarkdownRenderer, SiteConfig } from 'vitepress'
import { createMarkdownRenderer } from 'vitepress'
import { VITEPRESS_ID_PATH } from '../constant'
import type { UserOptions } from '../interface'

export class Tools {
  public md: MarkdownRenderer | undefined
  private server: ViteDevServer | undefined
  private config: ResolvedConfig | undefined
  private vitepress: SiteConfig | undefined
  private ssr = false
  private dev = true
  constructor(private readonly options: UserOptions) {}

  get base() {
    return this.vitepress?.site.base || this.config?.base || '/'
  }

  get markdownOptions() {
    return this.vitepress?.markdown
  }

  get logger() {
    return this.config.logger
  }

  get mode() {
    return this.config?.mode ?? 'development'
  }

  public async setupConfig(config: ResolvedConfig) {
    this.config = config
    this.vitepress = (config as any).vitepress
    this.md = await createMarkdownRenderer(this.srcDir, this.markdownOptions, this.base, this.logger)
  }

  public checkSSR(ssr?: boolean) {
    this.ssr = ssr ?? false
  }

  public checkDev(dev?: boolean) {
    this.dev = dev ?? true
  }

  public async setupServer(server: ViteDevServer) {
    this.server = server
  }

  /**
     * 获取当前的资源路径地址
     * @param config
     */
  public baseDir(config?: UserConfig) {
    const path: string = this.options.srcDir ?? config?.root ?? this.config?.root ?? process.cwd()
    return normalizePath(path)
  }

  public getFullPath(file: string) {
    return normalizePath(`${this.srcDir}/${file}`)
  }

  public async read(file: string) {
    return fsExtra.readFile(file, 'utf-8')
  }

  public hotReloadModule() {
    if (!this.dev)
      return
    const module = this.server?.moduleGraph.getModuleById(VITEPRESS_ID_PATH)
    if (module)
      this.server?.reloadModule(module)
  }

  /**
     * 获取当前的资源路径地址
     */
  get srcDir() {
    return this.baseDir()
  }

  /**
   * 获取当前的需要被监听的文件夹
   */
  get glob() {
    return this.options.glob ?? ['**/demos/**/*.{vue,tsx,jsx}', '**/demo/**/*.{vue,jsx,tsx}']
  }

  get ignore() {
    const defaultIgnore = [
      '**/node_modules/**',
      '**/.git/**',
      '**/demos/**/node_modules/**',
      '**/demos/**/.git/**',
      '**/tests/**',
      '**/test/**',
      '**/__tests__/**',
      '**/__test__/**',
      '**/tests.*',
      '**/test.*',
      '**/*.test.*',
      '**/.idea/**',
      '**/.vscode/**',
      '**/dist/**',
      '**/build/**',
      '**/.vitepress/**',
    ]
    if (this.options.ignore) {
      if (typeof this.options.ignore === 'string')
        return [...Array.from(new Set([this.options.ignore, ...defaultIgnore]))]
      return [...Array.from(new Set([...this.options.ignore, ...defaultIgnore]))]
    }
    return defaultIgnore
  }

  /**
   * 检查当前是不是服务端渲染
   */
  get isSSR() {
    return this.ssr
  }

  get wrapper() {
    return this.options?.wrapper ?? 'demo'
  }
}
