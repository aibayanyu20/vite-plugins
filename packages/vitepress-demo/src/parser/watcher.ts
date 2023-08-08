import type { FSWatcher } from 'chokidar'
import chokidar from 'chokidar'
import { normalizePath } from 'vite'
import fg from 'fast-glob'
import type { Tools } from '../tools'
import { Block } from '../tools/block'
import { FileCache } from './file-cache'
export class Watcher {
  private w: FSWatcher | undefined
  private shortPathCache = new Map<string, string>()
  private fileCache: FileCache
  constructor(private readonly tools: Tools) {
    this.fileCache = new FileCache(tools)
  }

  public hasFile(file: string) {
    return this.fileCache.has(file)
  }

  public getFile(file: string) {
    return this.fileCache.get(file)
  }

  public getBlock(file: string) {
    return this.fileCache.get(file)
  }

  public getShortPath(file: string) {
    return this.shortPathCache.get(file)
  }

  public setShortPath(file: string, path: string) {
    this.shortPathCache.set(file, path)
  }

  public transform(_code: string, id: string) {
    const block = this.getBlock(id)
    if (block && block.isVueOrJsx) {
      // console.log(id)
      return block.transform()
    }
  }

  public add(file: string) {
    this.w?.add(file)
  }

  get commonTools() {
    return this.tools
  }

  public async setup() {
    if (this.tools.mode === 'development') {
      this.w = chokidar.watch(this.tools.glob, {
        cwd: this.tools.srcDir,
        ignored: this.tools.ignore,
      })
    }

    const fileList = await fg(this.tools.glob, {
      cwd: this.tools.srcDir,
      ignore: this.tools.ignore,
    })
    if (fileList.length) {
      for (const file of fileList)
        await this.addWatcherFile(file)
    }
    if (this.tools.mode === 'development') {
      this.addWatcher()
      this.unlinkWatcher()
      this.changeWatcher()
    }
  }

  public async addWatcherFile(file: string) {
    const fullPath = this.tools.getFullPath(file)
    file = normalizePath(file)
    this.shortPathCache.set(file, fullPath)
    const block = new Block(this, file, fullPath)
    this.fileCache.set(fullPath, block)
    await block.load()
  }

  private addWatcher() {
    this.w?.on('add', async (file) => {
      await this.addWatcherFile(file)
    })
  }

  public async changeWatcherFile(file: string) {
    file = normalizePath(file)
    const fullPath = this.tools.getFullPath(file)
    if (this.fileCache.has(fullPath))
      this.fileCache.delete(fullPath)
    if (!this.shortPathCache.has(file))
      this.shortPathCache.set(file, fullPath)
    const block = new Block(this, file, fullPath)
    this.fileCache.set(fullPath, block)
    await block.load()
  }

  private changeWatcher() {
    this.w?.on('change', async (file) => {
      await this.changeWatcherFile(file)
    })
  }

  public async unlinkWatcherFile(file: string) {
    file = normalizePath(file)
    const fullPath = this.tools.getFullPath(file)
    if (this.fileCache.has(fullPath))
      this.fileCache.delete(fullPath)

    if (this.shortPathCache.has(file))
      this.shortPathCache.delete(file)
    this.tools.hotReloadModule()
  }

  private unlinkWatcher() {
    this.w?.on('unlink', async (file) => {
      await this.unlinkWatcherFile(file)
    })
  }

  public load() {
    return this.fileCache.toString()
  }

  public close() {
    this.w?.close()
  }
}
