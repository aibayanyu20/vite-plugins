import type { SFCParseResult } from 'vue/compiler-sfc'
import { parse } from 'vue/compiler-sfc'
import MagicString from 'magic-string'
import type { Parser } from '../index'
export interface FormatDataItem {
  title: string
  content: string
}
export class VueBlock {
  private readonly sfc: SFCParseResult
  private readonly magicString: MagicString
  private formatData: Record<string, FormatDataItem> = {}
  constructor(public readonly code: string, public readonly id: string, public readonly parser: Parser) {
    this.sfc = parse(code)
    this.magicString = new MagicString(code)
    // 解析codeBlock
    this.parserCustomBlock()
  }

  private parserCustomBlock() {
    const { descriptor } = this.sfc
    const { customBlocks } = descriptor
    if (customBlocks.length) {
      customBlocks.forEach((block) => {
        if (block.type === 'docs') {
          this.magicString.remove(block.loc.start.offset, block.loc.end.offset)
          this.magicString.replace(/<docs[^>]*>.*?<\/docs>/gs, '')
          const env: Record<string, any> = {}
          const data = this.parser.md?.render(block.content.trim(), env)
          const item: FormatDataItem = {
            title: env?.frontmatter?.title || env?.title || '',
            content: data || '',
          }
          if (block.lang)
            this.formatData[block.lang] = item
          else
            this.formatData.default = item
        }
      })
    }
  }

  public toString() {
    return this.magicString.toString().trim()
  }

  public valueOf() {
    return this.toString()
  }

  public getFormatData() {
    return this.formatData
  }
}
