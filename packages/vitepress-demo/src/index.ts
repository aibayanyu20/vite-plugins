import type { Plugin } from 'vite'
import { ALIAS, VITEPRESS_ID, VITEPRESS_ID_PATH } from './constant'
import type { UserOptions } from './interface'
import { Watcher } from './parser/watcher'
import { Tools } from './tools'
import { LoadMd } from './parser/load-md'

export function vitepressDemo(opt?: UserOptions): Plugin {
  const tools = new Tools(opt ?? {})
  const watcher = new Watcher(tools)
  const loadMd = new LoadMd(tools, watcher)
  return {
    name: 'vitepress:demo',
    enforce: 'pre',
    config(_config, env) {
      tools.checkSSR(env.isSsrBuild)
      tools.checkDev(env.command === 'serve')
      return {
        resolve: {
          alias: [
            { find: ALIAS, replacement: tools.baseDir(_config) },
            { find: VITEPRESS_ID, replacement: VITEPRESS_ID_PATH },
          ],
        },
        ssr: {
          noExternal: ['vite-plugin-vitepress-demo'],
        },
      }
    },
    resolveId(id) {
      if (id.endsWith(VITEPRESS_ID))
        return VITEPRESS_ID_PATH
    },
    async configResolved(c) {
      await tools.setupConfig(c)
      await watcher.setup()
    },
    async configureServer(s) {
      await tools.setupServer(s)
    },
    async transform(code, id) {
      const content = watcher.transform(code, id)
      if (content)
        return content

      return loadMd.transform(code, id)
    },
    load(id) {
      if (id === VITEPRESS_ID_PATH)
        return watcher.load()
    },
  }
}

export default vitepressDemo
