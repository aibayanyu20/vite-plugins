import type { PluginOption } from 'vite'
import { transform } from './parser'

export function tsxAutoProps(): PluginOption {
  return {
    name: 'tsx-auto-props',
    transform(code, id) {
      if (id.endsWith('.tsx'))
        return transform(code, id)
    },
  }
}
export default tsxAutoProps
