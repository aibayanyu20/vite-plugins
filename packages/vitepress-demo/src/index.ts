import type { Plugin, ResolvedConfig } from 'vite'
import type { SiteConfig } from 'vitepress'
import slash from 'slash'
import type { UserOptions } from './typing'
import { Parser } from './parser'
import { DEMO_DATA_ID, DEMO_DATA_REQUEST_PATH } from './parser/tools/transform'
const VitepressDemo = (opt?: UserOptions): Plugin => {
  let vitepress: SiteConfig
  let config: ResolvedConfig
  let parser: Parser
  const options: UserOptions = opt ?? {}
  return {
    name: 'vitepress:demo',
    config(config) {
      const vitepress: SiteConfig = (config as any).vitepress
      const dir = slash(options.globPath ?? vitepress?.srcDir ?? config.root ?? process.cwd())
      return {
        resolve: {
          alias: [
            {
              find: '/@vitepress-demo',
              replacement: dir,
            },
          ],
        },
        ssr: {
          noExternal: ['vite-plugin-vitepress-demo'],
        },
      }
    },
    async configureServer(server) {
      // console.log('SDas')
      await parser.setupServer(server)
    },
    resolveId(id) {
      if (id === DEMO_DATA_ID)
        return DEMO_DATA_REQUEST_PATH
    },
    // handleHotUpdate(ctx) {
    //   const data = parser.demoParser?.getDemoCache(ctx.file)
    //   if (data) {
    //     const id = data.id
    //     if (id) {
    //       id.forEach((v) => {
    //         ctx.modules.push(ctx.server.moduleGraph.getModuleById(v)!)
    //       })
    //     }
    //   }
    // },
    async configResolved(_config) {
      vitepress = (_config as any).vitepress
      config = _config
      parser = new Parser(config, options, vitepress)
      await parser.setupParser()
      await parser.setupParserDemo()
    },
    async transform(code, id) {
      return parser.demoParser?.transformDemoToMd(code, id)
    },
    load(id) {
      if (id === DEMO_DATA_REQUEST_PATH)
        return parser.loadDemoData()
    },
  }
}

export { VitepressDemo }

export default VitepressDemo
