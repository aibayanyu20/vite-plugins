import type { SFCParseResult } from 'vue/compiler-sfc'
import { parse } from 'vue/compiler-sfc'
export class VueBlock {
  private readonly sfc: SFCParseResult
  constructor(public readonly code: string, public readonly id: string) {
    this.sfc = parse(code)
    // 解析codeBlock
  }

  public toString() {
    return this.code
  }
}
