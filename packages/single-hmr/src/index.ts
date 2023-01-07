import type { Plugin } from 'vite'

export const VitePluginSingleHmr = (): Plugin => {
  return {
    name: 'vite:single-hmr',
    handleHotUpdate({ modules }) {
      modules.forEach((m) => {
        m.importedModules = new Set()
        m.importers = new Set()
      })
      return modules
    },
  }
}

export default VitePluginSingleHmr
