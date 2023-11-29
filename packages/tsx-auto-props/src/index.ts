import type { ModuleGraph, ModuleNode, PluginOption } from 'vite'
import { transform } from './parser'
import { Context } from './parser/context'
import { invalidateTypeCacheId } from './parser/transform'

function getDepModules(id: string, mapFile: Context, moduleGraph: ModuleGraph): ModuleNode[] {
  const modules: ModuleNode[] = []
  if (mapFile.has(id)) {
    invalidateTypeCacheId(id)
    const ids = mapFile.get(id)
    if (ids && ids.length) {
      for (const id of ids) {
        const mod = moduleGraph.getModuleById(id)
        if (mod) {
          modules.push(mod)
          modules.push(...getDepModules(id, mapFile, moduleGraph))
        }
      }
    }
  }
  const mod = moduleGraph.getModuleById(id)
  if (mod)
    modules.push(mod)
  return [...modules]
}

export interface TsxAutoPropsOptions {
  setup?: boolean
}

export function tsxAutoProps(options?: TsxAutoPropsOptions): PluginOption {
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
        const affectedModules = []
        if (ids) {
          for (const id of ids) {
            const mods = getDepModules(id, mapFile, server.moduleGraph)
            mapFile.removeCache(id)
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
export default tsxAutoProps
