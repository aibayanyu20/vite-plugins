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
}
