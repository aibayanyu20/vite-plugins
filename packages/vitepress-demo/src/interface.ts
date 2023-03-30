import type { MarkdownOptions } from 'vitepress'

export interface UserOptions {
  srcDir?: string
  // 需要处理的文件
  glob?: string | string[]
  // 需要忽略的文件
  ignore?: string | string[]
  // 自定义渲染器
  markdown?: MarkdownOptions
  // 自定义组件名称，默认为Demo
  wrapper?: string
}
