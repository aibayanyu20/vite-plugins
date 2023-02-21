import type { FSWatcher } from 'chokidar'
import chokidar from 'chokidar'
import slash from 'slash'
import fsExtra from 'fs-extra'
import type { Parser } from '../index'
import { CacheFile } from './cache-file'
import { VueBlock } from './vue-block'

export class WatcherFile {
  public watcher: FSWatcher | undefined
  public cacheFile: CacheFile = new CacheFile(this)
  constructor(public readonly parser: Parser) {
  }

  get glob() {
    if (this.parser.options.glob)
      return this.parser.options.glob
    return ['**/demos/**/*.vue', '**/demo/**/*.vue']
  }

  get ignoreGlob() {
    const defaultIgnore = [
      '**/node_modules/**',
      '**/.git/**',
      '**/demos/**/node_modules/**',
      '**/demos/**/.git/**',
      '**/tests/**',
      '**/test/**',
      '**/__tests__/**',
      '**/__test__/**',
      '**/tests.*',
      '**/test.*',
    ]
    if (this.parser.options.ignoreGlob) {
      if (typeof this.parser.options.ignoreGlob === 'string')
        return [...new Set([this.parser.options.ignoreGlob, ...defaultIgnore])]
      return [...new Set([...this.parser.options.ignoreGlob, ...defaultIgnore])]
    }
    return defaultIgnore
  }

  get globPath() {
    if (this.parser.options.globPath)
      return this.parser.options.globPath
    return this.parser.srcDir
  }

  public async setupWatcher() {
    this.watcher = chokidar.watch(this.glob, {
      cwd: this.globPath,
      ignored: this.ignoreGlob,
    })
    this.handleFileAdd()
    this.handleFileUnlink()
    this.handleFileChange()
  }

  private getId(file: string) {
    return slash(`${this.globPath}/${file}`)
  }

  private async readFile(file: string) {
    const fullPath = this.getId(file)
    const code = await fsExtra.readFile(fullPath, 'utf-8')
    return {
      code,
      id: fullPath,
    }
  }

  private handleFileAdd() {
    this.watcher?.on('add', async (file) => {
      console.log('add', file)
      // 添加文件处理逻辑
      file = slash(file)
      const { code, id } = await this.readFile(file)
      const vueBlock = new VueBlock(code, id)
      this.cacheFile.set(id, vueBlock)
    })
  }

  private handleFileChange() {
    this.watcher?.on('change', async (file) => {
      // 修改文件处理逻辑
      file = slash(file)
      const { code, id } = await this.readFile(file)
      const vueBlock = new VueBlock(code, id)
      this.cacheFile.set(id, vueBlock)
    })
  }

  private handleFileUnlink() {
    this.watcher?.on('unlink', (file) => {
      // 删除文件处理逻辑
      file = slash(file)
      const id = this.getId(file)
      this.cacheFile.delete(id)
    })
  }
}
