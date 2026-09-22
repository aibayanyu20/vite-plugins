import type { ParseResult } from '@babel/parser'
import type { File } from '@babel/types'
import type { IgnoreTypesOption } from '@v-c/resolve-types'

export type AST = ParseResult<File>

export interface UserOptions {
  /**
   * @description 是否开启emits的类型推断
   * @default true
   */
  emits?: boolean
  /**
   * @description 是否开启props的类型推断
   * @default true
   */
  props?: boolean

  /**
   * @description 是否开启默认props给undefined
   */
  defaultPropsToUndefined?: boolean | ('Boolean' | 'Array' | 'String' | 'Number' | 'Object' | 'Symbol' | 'BigInt')[]

  /**
   * @description Type names that must not be resolved into runtime props.
   * A match contributes no members in an `extends`/intersection position and
   * infers to `null` as a prop type, like `/* @vue-ignore *\/`, but it works
   * on types consumed from a published `.d.ts` where comments are gone.
   * Matched against the local reference name. `VueIgnore<T>` (exported by
   * `@v-c/util/dist/type`) is always recognised regardless of this option.
   * @example ignoreTypes: [/EmitsProps$/]
   */
  ignoreTypes?: IgnoreTypesOption
}
