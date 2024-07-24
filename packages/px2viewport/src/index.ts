import type { FilterPattern, PluginOption } from 'vite'
import { createFilter } from 'vite'
import viewPort from 'postcss-px-to-viewport-8-plugin'
import { transform } from './transform'

export interface Px2viewportOptions {
  viewportWidth?: number | ((file: string) => number)
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
        let num = 750
        if (typeof options.viewportWidth === 'function')
          num = options.viewportWidth(id) ?? 750
        else
          num = options.viewportWidth ?? 750

        const res = transform(code, num)
        if (res)
          return res
      }
    },
    config() {
      return {
        css: {
          postcss: {
            plugins: [
              viewPort({
                viewportWidth: options.viewportWidth ?? 750,
              }),
            ],
          },
        },
      }
    },
  }
}
