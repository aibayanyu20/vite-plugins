import type { PluginOption } from 'vite'
import ts from 'typescript'
import { registerTS } from '@vue/compiler-sfc'
import { GraphContext } from './utils/graphContext'
import { invalidateTypeCacheId } from './utils/invalidate'
import { getDepModules } from './utils/depModules'
import type { UserOptions } from './interface'
import { transform } from './transform'

registerTS(() => ts)
export function tsxResolveTypes(options: UserOptions = {}): PluginOption {
  const graphCtx = new GraphContext()
  return {
    enforce: 'pre',
    name: 'tsx-resolve-types',
    transform(code, id) {
      if (id.endsWith('.tsx'))
        return transform(code, id, graphCtx, options)
    },
    /**
     * 热更新
     */
    handleHotUpdate({ file, server, modules }) {
      if (graphCtx.has(file)) {
        // 清理缓存
        invalidateTypeCacheId(file)
        // 如果存在那么响应的所有的moduleGraph都需要更新
        const ids = graphCtx.get(file)
        const affectedModules = []
        if (ids) {
          for (const id of ids) {
            const mods = getDepModules(id, graphCtx, server.moduleGraph)
            graphCtx.removeCache(id)
            if (mods.length)
              affectedModules.push(...mods)
          }
          return [...modules, ...affectedModules]
        }
      }
      return modules
    },
  }
}

export default tsxResolveTypes
