import { invalidateTypeCache } from '@v-c/resolve-types'

export function invalidateTypeCacheId(file: string) {
  invalidateTypeCache(file)
}
