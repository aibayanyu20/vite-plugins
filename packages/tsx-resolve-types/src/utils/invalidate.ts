import { invalidateTypeCache } from '@vue/compiler-sfc'

export function invalidateTypeCacheId(file: string) {
  invalidateTypeCache(file)
}
