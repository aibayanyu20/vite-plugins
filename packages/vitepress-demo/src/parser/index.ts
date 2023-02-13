import type { ResolvedConfig } from 'vite'
import type { SiteConfig } from 'vitepress'
import type { UserOptions } from '../typing'

export class Parser {
  constructor(public readonly config: ResolvedConfig, public readonly options: UserOptions, public readonly vitepress: SiteConfig) {
  }
}
