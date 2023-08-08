import { dirname, resolve } from 'path'
import MagicString from 'magic-string'
import { parseDocument } from 'htmlparser2'
import { render } from 'dom-serializer'
import { normalizePath } from 'vite'
import type { Tools } from '../tools'
import type { Watcher } from './watcher'
import { WatchQueue } from './watch-queue'
export interface DemoItem {
  content: string
  map: [number, number]
}
export class LoadMd {
  private watchQueue
  constructor(private readonly tools: Tools, private readonly watcher: Watcher) {
    this.watchQueue = new WatchQueue(tools, watcher)
  }

  get wrapper() {
    return this.tools.wrapper
  }

  private async parserSrc(src: string, id: string, raw: boolean) {
    const dirPath = normalizePath(dirname(id))
    const fullPath = normalizePath(resolve(dirPath, src))
    const demoPath = normalizePath(fullPath.replace(normalizePath(`${this.tools.srcDir}/`), ''))
    if (raw) {
      // 这是raw的情况下的处理方式
      if (!this.watcher.hasFile(fullPath)) {
        this.watchQueue.add(demoPath)
        await this.watcher.addWatcherFile(demoPath)
      }
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
    if (content !== newContent)
      str.replace(content, newContent)
  }

  private async replaceDemo(str: MagicString, demos: DemoItem[], id: string) {
    for (const demo of demos)
      await this.parserDemo(str, demo, id)
  }

  private checkWrapper(token: string): boolean {
    const REGEX_DEMO = new RegExp(`<${this.wrapper}.*?>(.*?)</${this.wrapper}>`, 'gis')
    const REGEX_DEMO1 = new RegExp(`<${this.wrapper}.*?/>`, 'gis')
    return REGEX_DEMO.test(token) || REGEX_DEMO1.test(token)
  }

  private getDemo(tokens: any[]): DemoItem[] {
    const demos: DemoItem[] = []
    for (const token of tokens) {
      if (token.type === 'html_block' || token.type === 'html_inline' || token.type === 'inline') {
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

  public async transform(code: string, id: string) {
    // TODO: transform code
    if (!id.endsWith('.md'))
      return

    const ms = new MagicString(code)
    const tokens = this.tools.md?.parse(code, {})
    // const tokens = []
    this.tools.md?.render(code, {})
    const demos = this.getDemo(tokens)
    await this.replaceDemo(ms, demos, id)
    return {
      code: ms.toString(),
      map: ms.generateMap({ hires: true }),
    }
  }
}
