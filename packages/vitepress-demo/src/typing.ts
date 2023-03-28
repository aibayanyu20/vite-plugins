export interface UserOptions {
  glob?: string | string[]
  ignoreGlob?: string | string[]
  globPath?: string
  /**
   * @description: 用于定义在vue中实现自定义块的名称
   * @default: docs
   */
  blockName?: string
  wrapper?: string
}
