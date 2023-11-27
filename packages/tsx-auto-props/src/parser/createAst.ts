import { parse } from '@babel/parser'
import _traverse from '@babel/traverse'
import type { Parsed } from './typing'

export const traverse = typeof (_traverse as any).default === 'undefined'
  ? _traverse
  : ((_traverse as any).default as typeof _traverse)
export function createAst(code: string, jsx = true): Parsed {
  if (!jsx) {
    return parse(code, {
      sourceType: 'module',
      plugins: ['typescript'],
    })
  }
  return parse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  })
}
