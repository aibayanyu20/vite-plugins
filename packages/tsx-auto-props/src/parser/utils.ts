import generate from '@babel/generator'
import type { Node } from '@babel/types'

export function generateCode(node: Node) {
  if (typeof generate === 'function') {
    return generate(node)
  }
  else if (typeof (generate as any)?.default === 'function') {
    return (generate as any).default(node)
  }
  else {
    return {
      code: '',
    }
  }
}
