export class VueBlock {
  constructor(public readonly code: string, public readonly id: string) {
  }

  public toString() {
    return this.code
  }
}
