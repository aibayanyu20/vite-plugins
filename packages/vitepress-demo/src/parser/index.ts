import type { ResolvedConfig } from 'vite'
import type { MarkdownRenderer, SiteConfig } from 'vitepress'
import { createMarkdownRenderer } from 'vitepress'
import slash from 'slash'
import type { UserOptions } from '../typing'

export class Parser {
  public md: MarkdownRenderer | undefined
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
  get glob() {
    if (this.options.glob)
      return this.options.glob
    return slash(this.config.root || process.cwd())
  }

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
  }
}
