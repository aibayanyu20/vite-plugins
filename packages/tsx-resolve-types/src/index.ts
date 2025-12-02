import type { PluginOption } from 'vite'
import ts from 'typescript'
import { registerTS } from '@vue/compiler-sfc'
import { GraphContext } from './utils/graphContext'
import { invalidateTypeCacheId } from './utils/invalidate'
import { getDepModules } from './utils/depModules'
import type { UserOptions } from './interface'
import { transform } from './transform'

registerTS(() => ts as any)

export function tsxResolveTypes(options: UserOptions = {}): PluginOption {
  const graphCtx = new GraphContext()
  return {
    enforce: 'pre',
    name: 'tsx-resolve-types',
    transform(code, id) {
      if (id.endsWith('.tsx'))
        return transform(code, id, graphCtx, options)
    },
    async handleHotUpdate({ file, server, modules }) {
      if (graphCtx.has(file)) {
        invalidateTypeCacheId(file)
        const dependentFileIds = graphCtx.get(file)

        if (dependentFileIds && dependentFileIds.length > 0) {
          const affectedModules = new Set<any>()

          for (const id of dependentFileIds) {
            if (id === file)
              continue

            const mods = getDepModules(id, graphCtx, server.moduleGraph)
            graphCtx.removeCache(id)

            for (const mod of mods)
              affectedModules.add(mod)
          }

          const currentModuleIds = new Set(modules.map(m => m.id))
          const extraModules = [...affectedModules].filter(m => !currentModuleIds.has(m.id))

          return [...modules, ...extraModules]
        }
      }
      return modules
    },
  }
}

export default tsxResolveTypes
