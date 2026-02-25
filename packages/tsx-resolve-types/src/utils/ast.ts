import { createRequire } from 'node:module'
import type { Expression } from '@babel/types'
import { parseSync } from 'oxc-parser'
import type { Program } from '@oxc-project/types'
import type { AST } from '../interface'

const oxcProgramMap = new WeakMap<AST, Program>()
const require = createRequire(import.meta.url)
let babelParser: typeof import('@babel/parser') | undefined

function getBabelParser() {
  babelParser ??= require('@babel/parser') as typeof import('@babel/parser')
  return babelParser
}

export function createOxcProgram(code: string, jsx = true): Program {
  return parseSync(jsx ? 'input.tsx' : 'input.ts', code, {
    lang: jsx ? 'tsx' : 'ts',
    sourceType: 'module',
    astType: 'ts',
  }).program
}

export function createAst(code: string, jsx = true): AST {
  const { parse } = getBabelParser()
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
    oxcProgramMap.set(ast, createOxcProgram(code, jsx))
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
