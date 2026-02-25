import type { ParseResult } from '@babel/parser'
import type { File } from '@babel/types'

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
}
