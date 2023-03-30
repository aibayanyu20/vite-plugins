import type { SFCParseResult } from 'vue/compiler-sfc'
import MagicString from 'magic-string'
import { parse } from 'vue/compiler-sfc'
import type { Watcher } from '../parser/watcher'

export interface BlockDataItem {
  title: string
  content: string
}

export class Block {
  private readonly ext
  private sfc: SFCParseResult | undefined
  private magicString: MagicString | undefined
  private code: string | undefined
  private raw: boolean | undefined
  private blockData: Record<string, BlockDataItem> = {}
  private renderData: string | undefined
  constructor(
    private readonly watcher: Watcher,
    private readonly id: string,
    private readonly file: string,
  ) {
    this.ext = id.split('.').pop()
  }

  private get isVue() {
    return this.ext === 'vue'
  }

  private get isJsx() {
    return this.ext === 'jsx' || this.ext === 'tsx'
  }

  public get isVueOrJsx() {
    return this.isVue || this.isJsx
  }

  private get tools() {
    return this.watcher.commonTools
  }

  get isRaw() {
    return this.raw
  }

  get shortPath() {
    return this.id
  }

  get fullPath() {
    return this.file
  }

  private get md() {
    return this.tools.md
  }

  public async load(code?: string, raw?: boolean) {
    this.raw = raw ?? !(this.isJsx || this.isVue)
    if (!code)
      code = await this.tools.read(this.file)
    this.code = code
    this.magicString = new MagicString(code)
    this.sfc = parse(code)
    if (this.isVue && !this.raw)
      this.parserCustomBlock()
    this.tools.hotReloadModule()
  }

  private parserCustomBlock() {
    const { descriptor } = this.sfc!
    const { customBlocks } = descriptor
    if (customBlocks.length) {
      customBlocks.forEach((block) => {
        if (block.type === 'docs') {
          this.magicString!.remove(block.loc.start.offset, block.loc.end.offset)
          this.magicString!.replace(/<docs[^>]*>.*?<\/docs>/gs, '')
          const env: Record<string, any> = {}
          const data = this.md?.render(block.content.trim(), env)
          const item: BlockDataItem = {
            title: encodeURIComponent(env?.frontmatter?.title || env?.title || ''),
            content: encodeURIComponent(data || ''),
          }
          if (block.lang)
            this.blockData[block.lang] = item
          else
            this.blockData.default = item
        }
      })
    }
  }

  public toString() {
    if (this.raw)
      return this.code
    return this.magicString?.toString().trim()
  }

  public transform() {
    return {
      code: this.magicString?.toString().trim(),
      map: this.magicString?.generateMap({ hires: true }),
    }
  }

  public valueOf() {
    return this.toString()
  }

  public resetRenderData() {
    this.renderData = undefined
  }

  public getRenderData() {
    if (this.renderData)
      return this.renderData

    const data = `\`\`\`${this.ext ?? 'vue'}\n${this.toString()}\n\`\`\``
    const render = this.md?.render(data)
    this.renderData = render
    return render
  }

  public toJson() {
    return {
      block: this.blockData,
      code: this.toString() ? encodeURIComponent(this.toString() as string) : '',
      render: this.getRenderData() ? encodeURIComponent(this.getRenderData() as string) : '',
    }
  }
}
