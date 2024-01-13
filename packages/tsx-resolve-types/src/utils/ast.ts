import { parse } from '@babel/parser'
import type { AST } from '../interface'

export function createAst(code: string, jsx = true): AST {
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
