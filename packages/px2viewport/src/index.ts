import type { PluginOption } from 'vite'
import { transform } from './transform'

export interface Px2viewportOptions {
  viewportWidth?: number
}

export function px2viewport(options: Px2viewportOptions = {
  viewportWidth: 750,
}): PluginOption {
  return {
    name: 'px2viewport',
    transform(code, id) {
      const res = transform(code, id, options.viewportWidth ?? 750)
      if (res)
        return res
    },
  }
}
