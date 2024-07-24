import type { FilterPattern, PluginOption } from 'vite'
import { createFilter } from 'vite'
import { transform } from './transform'

export interface Px2viewportOptions {
  viewportWidth?: number
  include?: FilterPattern
}

export function px2viewport(options: Px2viewportOptions = {
  viewportWidth: 750,
  include: [/\.vue$/, /\.[jt]sx$/],
}): PluginOption {
  const filter = createFilter(options.include)
  return {
    name: 'px2viewport',
    enforce: 'post',
    transform(code, id) {
      if (filter(id)) {
        const res = transform(code, options.viewportWidth ?? 750)
        if (res)
          return res
      }
    },
  }
}
