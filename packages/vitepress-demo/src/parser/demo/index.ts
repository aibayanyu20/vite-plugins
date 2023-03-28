import { dirname, normalize, relative, resolve } from 'path'
import { parseDocument } from 'htmlparser2'
import { render } from 'dom-serializer'
import MagicString from 'magic-string'
import slash from 'slash'
import type { Parser } from '../index'

export interface DemoItem {
  content: string
  map: [number, number]
}
export class DemoParser {
  private demoToMdCache = new Map<string, { id: Set<string>;path: string }>()
  public constructor(private readonly parser: Parser) {
    // TODO
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

  private parserSrc(src: string, id: string) {
    // 拿到src的内容
    const fullPath = slash(resolve(id, relative(dirname(id), src)))
    const demoPath = slash(fullPath.replace(slash(normalize(`${this.globPath}/`)), ''))
    if (this.demoToMdCache.has(fullPath)) {
      const item = this.demoToMdCache.get(fullPath)
      item?.id.add(id)
    }
    else {
      this.demoToMdCache.set(fullPath, { id: new Set([id]), path: demoPath })
    }
    return demoPath
  }

  private parserDemo(str: MagicString, demo: DemoItem, id: string) {
    const { content } = demo

    const dom = parseDocument(content)
    for (const child of dom.children) {
      if (child.type === 'tag' && child.name === this.wrapper) {
        // 拿到demo
        const src = child.attribs.src
        if (src) {
          child.attribs.src = this.parserSrc(src, id)
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

  private replaceDemo(str: MagicString, demos: DemoItem[], id: string) {
    for (const demo of demos)
      this.parserDemo(str, demo, id)
  }

  public async transformDemoToMd(code: string, id: string) {
    if (!this.checkIsMd(id))
      return
    const str = new MagicString(code)
    const tokens = this.parser.md?.parse(code, {}) ?? []
    const demos = this.getDemo(tokens)
    this.replaceDemo(str, demos, id)
    return {
      code: str.toString(),
      map: str.generateMap({ hires: true }),
    }
  }
}
