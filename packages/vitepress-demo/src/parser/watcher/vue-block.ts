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

  private sourceData: string | undefined
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

  public updateSourceData() {
    this.sourceData = undefined
  }

  public getSourceData() {
    if (!this.sourceData) {
      const data = `\`\`\`vue\n${this.toString()}\n\`\`\``
      this.sourceData = this.parser.md?.render(data)
    }
    return this.sourceData
  }

  public getFormatData() {
    return this.formatData
  }

  public getDataInfo() {
    return {
      ...this.getFormatData(),
      code: this.toString(),
      source: this.getSourceData(),
    }
  }
}
