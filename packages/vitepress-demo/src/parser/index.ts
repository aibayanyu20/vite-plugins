import type { ResolvedConfig, ViteDevServer } from 'vite'
import type { MarkdownRenderer, SiteConfig } from 'vitepress'
import { createMarkdownRenderer } from 'vitepress'
import slash from 'slash'
import type { UserOptions } from '../typing'
import { DemoParser } from './demo'
import { WatcherFile } from './watcher'

export class Parser {
  public md: MarkdownRenderer | undefined
  public watcher: WatcherFile | undefined
  public demoParser: DemoParser | undefined
  public server: ViteDevServer | undefined
  constructor(
    public readonly config: ResolvedConfig,
    public readonly options: UserOptions,
    public readonly vitepress: SiteConfig,
  ) {
  }

  get srcDir() {
    return slash(this.vitepress?.srcDir || this.config.root || process.cwd())
  }

  /**
   * 获取规则部分的逻辑
   */
  get markdownOptions() {
    return this.vitepress.markdown
  }

  get base() {
    return this.vitepress?.site.base || this.config.base || '/'
  }

  get logger() {
    return this.vitepress.logger
  }

  public async setupParser() {
    this.md = await createMarkdownRenderer(this.srcDir, this.markdownOptions, this.base, this.logger)
    if (!this.watcher) {
      this.watcher = new WatcherFile(this)
      await this.watcher?.setupWatcher()
    }
  }

  public async setupParserDemo() {
    // 解析demo
    this.demoParser = new DemoParser(this)
  }

  public async setupServer(server: ViteDevServer) {
    this.server = server
  }

  public loadDemoData() {
    return this.watcher?.cacheFile.toString()
  }
}
