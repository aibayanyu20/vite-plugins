import { normalize } from 'path'
import slash from 'slash'
import { deserializeFunctions, serializeFunctions } from '../tools/fn-serialize'
import type { VueBlock } from './vue-block'
import type { WatcherFile } from './index'

export class CacheFile {
  public cacheFile: Map<string, VueBlock> = new Map()
  constructor(public readonly watcherFile: WatcherFile) {
  }

  public get(path: string) {
    return this.cacheFile.get(path)
  }

  public set(path: string, value: VueBlock) {
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
    this.cacheFile.forEach((value, key) => {
      // 获取短链接的key
      const shortKey = slash(key.replace(slash(normalize(`${this.watcherFile.globPath}/`)), ''))
      const path = `/@vitepress-demo/${shortKey}`
      const comp = `_vp-fn_() => import(\`${path}\`)`
      obj[shortKey] = {
        data: value.getDataInfo(),
      }
      if (!value.isRaw)
        obj[shortKey].comp = comp
    })
    const data = serializeFunctions(obj)
    return `${deserializeFunctions.toString()}
export default deserializeFunctions(JSON.parse(${JSON.stringify(JSON.stringify(data))}))`
  }
}
