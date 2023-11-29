import type { PluginOption } from 'vite'
import { transform } from './parser'

export function tsxAutoProps(): PluginOption {
  return {
    name: 'tsx-auto-props',
    enforce: 'pre',
    transform(code, id) {
      if (id.endsWith('.tsx'))
        return transform(code, id)
    },
    /**
     * 热更新
     */
    handleHotUpdate({ file }) {
      console.log(file)
    },
  }
}
export default tsxAutoProps
