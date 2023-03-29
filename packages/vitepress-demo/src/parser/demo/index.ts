import { dirname, normalize, relative, resolve } from 'path'
import { parseDocument } from 'htmlparser2'
import { render } from 'dom-serializer'
import MagicString from 'magic-string'
import slash from 'slash'
import fsExtra from 'fs-extra'
import type { Parser } from '../index'
import { VueBlock } from '../watcher/vue-block'

export interface DemoItem {
  content: string
  map: [number, number]
}
export class DemoParser {
  private demoToMdCache = new Map<string, { id: Set<string>;path: string }>()

  private demoRawCache = new Map<string, string>()
  public constructor(private readonly parser: Parser) {
    // TODO
  }

  public getDemoCache(id: string) {
    return this.demoToMdCache.get(id)
  }

  private checkIsMd(id: string) {
    return id.endsWith('.md')
  }

  get wrapper() {
    if (this.parser.options.wrapper)
      return this.parser.options.wrapper
    return 'demo'
  }

  private checkWrapper(token: string): boolean {
    const REGEX_DEMO = new RegExp(`<${this.wrapper}.*?>(.*?)</${this.wrapper}>`, 'gis')
    const REGEX_DEMO1 = new RegExp(`<${this.wrapper}.*?/>`, 'gis')
    return REGEX_DEMO.test(token) || REGEX_DEMO1.test(token)
  }

  private getDemo(tokens: any[]): DemoItem[] {
    const demos: DemoItem[] = []
    for (const token of tokens) {
      if (token.type === 'html_block' || token.type === 'html_inline') {
        const isDemo = this.checkWrapper(token.content)
        if (isDemo) {
          demos.push({
            content: token.content,
            map: token.map,
          })
        }
      }
    }
    return demos
  }

  get globPath() {
    if (this.parser.watcher?.globPath)
      return this.parser.watcher.globPath

    return this.parser.srcDir
  }

  private async readFile(id: string) {
    return await fsExtra.readFile(id, 'utf-8')
  }

  private async checkAddFile(id: string, demoPath: string, _pid: string) {
    if (!this.parser.watcher?.cacheFile.has(id)) {
      const code = await this.readFile(id)
      const block = new VueBlock(code, id, this.parser, true)
      this.parser.watcher?.cacheFile.set(id, block)
      this.demoRawCache.set(id, demoPath)
      // 通知server去更新数据
      this.parser.server?.ws.send('vitepress:demo', {
        type: 'add',
        data: block.getDataInfo(),
        key: demoPath,
      })
      this.parser.watcher?.watcher?.add(demoPath)
    }
  }

  private async parserSrc(src: string, id: string, raw: boolean) {
    // 拿到src的内容
    const fullPath = slash(resolve(id, relative(dirname(id), src)))
    const demoPath = slash(fullPath.replace(slash(normalize(`${this.globPath}/`)), ''))
    if (raw)
      await this.checkAddFile(fullPath, demoPath, id)

    if (this.demoToMdCache.has(fullPath)) {
      const item = this.demoToMdCache.get(fullPath)
      item?.id.add(id)
    }
    else {
      this.demoToMdCache.set(fullPath, { id: new Set([id]), path: demoPath })
    }
    return demoPath
  }

  private async parserDemo(str: MagicString, demo: DemoItem, id: string) {
    const { content } = demo

    const dom = parseDocument(content)
    for (const child of dom.children) {
      if (child.type === 'tag' && child.name === this.wrapper) {
        // 拿到demo
        const src = child.attribs.src
        const raw = 'raw' in child.attribs
        if (src) {
          child.attribs.src = await this.parserSrc(src, id, raw)
        }
        else {
          // eslint-disable-next-line no-console
          console.log('[vitepress:demo]: demo src is required')
        }
      }
    }
    const newContent = render(dom)
    str.replace(content, newContent)
  }

  private async replaceDemo(str: MagicString, demos: DemoItem[], id: string) {
    for (const demo of demos)
      await this.parserDemo(str, demo, id)
  }

  public async transformDemoToMd(code: string, id: string) {
    if (this.parser.watcher?.cacheFile.has(id)) {
      const cache = this.parser.watcher.cacheFile.get(id)
      if (this.demoRawCache.has(id)) {
        // 里面包含这个id
        const key = this.demoRawCache.get(id)
        cache?.updateCode(code)
        this.parser.server?.ws.send('vitepress:demo', {
          type: 'add',
          data: cache?.getDataInfo(),
          key,
        })
        return
      }
      if (cache?.isRaw)
        return

      return cache?.toString()
    }

    if (!this.checkIsMd(id))
      return
    const str = new MagicString(code)
    const tokens = this.parser.md?.parse(code, {}) ?? []
    const demos = this.getDemo(tokens)
    await this.replaceDemo(str, demos, id)
    return {
      code: str.toString(),
      map: str.generateMap({ hires: true }),
    }
  }
}
