import type { Block } from '../tools/block'
import type { Tools } from '../tools'
import { ALIAS } from '../constant'
import { objToStr } from '../tools/obj-to-str'

export class FileCache {
  private cacheFile = new Map<string, Block>()
  constructor(private readonly tools: Tools) {
  }

  public get(path: string) {
    return this.cacheFile.get(path)
  }

  public set(path: string, value: Block) {
    this.cacheFile.set(path, value)
  }

  public delete(path: string) {
    this.cacheFile.delete(path)
  }

  public has(path: string) {
    return this.cacheFile.has(path)
  }

  public toString() {
    const obj: Record<string, any> = {}
    this.cacheFile.forEach((value) => {
      // 获取短链接的key
      const shortKey = value.shortPath
      const path = `${ALIAS}/${shortKey}`
      const comp = `() => import(/* @vite-ignore */\`${path}\`)`
      obj[shortKey] = {
        data: value.toJson(),
      }
      if (!value.isRaw)
        obj[shortKey].comp = comp
    })
    const data = objToStr(obj)
    return `export default ${data}`
  }
}
