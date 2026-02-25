import type { PluginOption } from 'vite'
import ts from 'typescript'
import { registerTS } from '@v-c/resolve-types'
import type { UserOptions } from './interface'
import { transformVueSfc } from './transform'

registerTS(() => ts as any)

export type { UserOptions } from './interface'
export { transformVueSfc } from './transform'

export function vueResolveTypes(options: UserOptions = {}): PluginOption {
  return {
    name: 'vue-resolve-types',
    enforce: 'pre',
    transform(code, id) {
      if (options.include && !options.include(id))
        return
      return transformVueSfc(code, id, options)
    },
  }
}

export default vueResolveTypes
