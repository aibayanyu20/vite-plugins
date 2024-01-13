import type { PluginOption } from 'vite'
import { GraphContext } from './utils/graphContext'
import { invalidateTypeCacheId } from './utils/invalidate'
import { getDepModules } from './utils/depModules'

export function tsxResolveTypes(): PluginOption {
  const graphCtx = new GraphContext()
  return {
    name: 'tsx-resolve-types',

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
