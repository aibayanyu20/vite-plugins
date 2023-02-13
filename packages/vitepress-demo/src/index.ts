import type { Plugin, ResolvedConfig } from 'vite'
import type { SiteConfig } from 'vitepress'
import slash from 'slash'
import type { UserOptions } from './typing'
import { Parser } from './parser'
const VitepressDemo = (opt?: UserOptions): Plugin => {
  let vitepress: SiteConfig
  let config: ResolvedConfig
  let parser: Parser
  const options: UserOptions = opt ?? {}
  return {
    name: 'vitepress:demo',
    config(config) {
      const demoPath = slash(opt?.basePath || config.root || process.cwd())
      return {
        resolve: {
          alias: {
            '@vitepress/demo': demoPath,
          },
        },
      }
    },
    async configResolved(_config) {
      vitepress = (_config as any).vitepress
      config = _config
      parser = new Parser(config, options, vitepress)
      await parser.setupParser()
    },
  }
}

export { VitepressDemo }

export default VitepressDemo
