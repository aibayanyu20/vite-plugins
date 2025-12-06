import type { ModuleGraph, ModuleNode } from 'vite'
import type { GraphContext } from './graphContext'
import { invalidateTypeCacheId } from './invalidate'

export function getDepModules(id: string, mapFile: GraphContext, moduleGraph: ModuleGraph, seen = new Set<string>()): ModuleNode[] {
  if (seen.has(id))
    return []
  seen.add(id)
  const modules: ModuleNode[] = []
  if (mapFile.has(id)) {
    invalidateTypeCacheId(id)
    const ids = mapFile.get(id)
    if (ids && ids.length) {
      for (const id of ids) {
        const mod = moduleGraph.getModuleById(id)
        if (mod) {
          modules.push(mod)
          modules.push(...getDepModules(id, mapFile, moduleGraph, seen))
        }
      }
    }
  }
  const mod = moduleGraph.getModuleById(id)
  if (mod)
    modules.push(mod)
  return [...modules]
}
