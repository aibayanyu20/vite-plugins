import type { ModuleNode, PluginOption } from 'vite'
import { transform } from './parser'
import { Context } from './parser/context'
import { invalidateTypeCacheId } from './parser/transform'

export function tsxAutoProps(): PluginOption {
  const mapFile = new Context()
  return {
    name: 'tsx-auto-props',
    enforce: 'pre',
    transform(code, id) {
      if (id.endsWith('.tsx'))
        return transform(code, id, mapFile)
    },
    /**
     * 热更新
     */
    handleHotUpdate({ file, server, modules }) {
      if (mapFile.has(file)) {
        // 清理缓存
        invalidateTypeCacheId(file)
        // 如果存在那么响应的所有的moduleGraph都需要更新
        const ids = mapFile.get(file)
        const affectedModules = new Set<ModuleNode>()
        if (ids) {
          for (const id of ids) {
            const mods = server.moduleGraph.getModuleById(id)
            if (mods)
              affectedModules.add(mods)
          }
          return [...modules, ...affectedModules]
        }
      }
      return modules
    },
  }
}
export default tsxAutoProps
