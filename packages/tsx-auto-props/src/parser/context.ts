export class Context {
  constructor() {
    this.mapFile = new Map()
  }

  mapFile: Map<string, string[]>
  add(fileName: string, id: string) {
    if (this.mapFile.has(fileName)) {
      const arr = this.mapFile.get(fileName)
      if (!arr?.includes(id))
        arr!.push(id)
    }
    else {
      this.mapFile.set(fileName, [id])
    }
  }

  get(fileName: string) {
    return this.mapFile.get(fileName)
  }

  getId(fileName: string, id: string) {
    const files = this.mapFile.get(fileName)
    if (files)
      return files.find(item => item === id)
  }

  has(fileName: string) {
    return this.mapFile.has(fileName)
  }

  hasId(fileName: string, id: string) {
    const files = this.mapFile.get(fileName)
    if (files)
      return files.includes(id)
    return false
  }
}
