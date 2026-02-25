import { parse } from '@babel/parser'
import type { Expression } from '@babel/types'
import { parseSync } from 'oxc-parser'
import type { Program } from '@oxc-project/types'
import type { AST } from '../interface'

const oxcProgramMap = new WeakMap<AST, Program>()

export function createAst(code: string, jsx = true): AST {
  const ast = !jsx
    ? parse(code, {
      sourceType: 'module',
      plugins: ['typescript'],
    })
    : parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    })

  try {
    const result = parseSync(jsx ? 'input.tsx' : 'input.ts', code, {
      lang: jsx ? 'tsx' : 'ts',
      sourceType: 'module',
      astType: 'ts',
    })
    oxcProgramMap.set(ast, result.program)
  }
  catch {
    // Keep Babel parsing as source of truth for compatibility.
  }

  return ast
}

export function getOxcProgram(ast: AST) {
  return oxcProgramMap.get(ast)
}

export function createExpressionAst(code: string): Expression {
  const ast = createAst(`const __tsxResolveTypesExpr__ = ${code}`, false)
  const statement = ast.program.body[0]

  if (!statement || statement.type !== 'VariableDeclaration')
    throw new Error('[tsx-resolve-types] Failed to parse expression')

  const declaration = statement.declarations[0]
  const expression = declaration?.init
  if (!expression)
    throw new Error('[tsx-resolve-types] Failed to parse expression')

  return expression as Expression
}
