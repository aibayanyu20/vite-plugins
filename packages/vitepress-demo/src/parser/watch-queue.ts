import type { FSWatcher } from 'chokidar'
import chokidar from 'chokidar'
import type { Tools } from '../tools'
import type { Watcher } from './watcher'

export class WatchQueue {
  private queue = new Map<string, FSWatcher>()
  constructor(private readonly tools: Tools, private readonly watcher: Watcher) {}

  public add(file: string) {
    // 添加文件
    if (this.tools.mode !== 'development') return
    if (this.queue.has(file)) return
    const watcher = chokidar.watch(file, {
      cwd: this.tools.srcDir,
    })
    watcher.on('change', async (file) => {
      await this.watcher.addWatcherFile(file)
    })
    watcher.on('unlink', async () => {
      await this.watcher.unlinkWatcherFile(file)
      this.delete(file)
    })
    this.queue.set(file, watcher)
  }

  public delete(file: string) {
    // 删除文件
    if (this.tools.mode !== 'development') return
    const watcher = this.queue.get(file)
    if (watcher) {
      watcher.removeAllListeners()
      watcher.close().then(() => {})
      this.queue.delete(file)
    }
  }
}
