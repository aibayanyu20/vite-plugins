import { createRequire } from 'node:module'
import type { Expression } from '@babel/types'
import { parseOxcProgram } from '@v-c/resolve-types'
import type { Program } from '@oxc-project/types'
import type { AST } from '../interface'

const oxcProgramMap = new WeakMap<AST, Program>()
function getCurrentModuleRef() {
  if (typeof __filename === 'string')
    return __filename

  const ErrorCtor = Error as any
  const oldPrepareStackTrace = ErrorCtor.prepareStackTrace
  try {
    ErrorCtor.prepareStackTrace = (_: unknown, stack: any[]) => stack
    // eslint-disable-next-line unicorn/error-message
    const err = new Error()
    const stack = err.stack as any[] | undefined
    for (const site of stack || []) {
      const fileName = site?.getFileName?.()
      if (!fileName || typeof fileName !== 'string' || fileName.startsWith('node:'))
        continue
      return fileName
    }
  }
  finally {
    ErrorCtor.prepareStackTrace = oldPrepareStackTrace
  }

  // eslint-disable-next-line node/prefer-global/process
  return `${process.cwd().replace(/\\/g, '/')}/index.js`
}

const nodeRequire = typeof module !== 'undefined' && typeof module.require === 'function'
  ? module.require.bind(module)
  : createRequire(getCurrentModuleRef())
let babelParser: typeof import('@babel/parser') | undefined

function getBabelParser() {
  babelParser ??= nodeRequire('@babel/parser') as typeof import('@babel/parser')
  return babelParser
}

/**
 * Parse with the same OXC normalisation @v-c/resolve-types applies to the
 * files it loads itself (Literal -> StringLiteral, Property -> ObjectProperty,
 * typeArguments -> typeParameters, ...). The resolver only understands those
 * Babel-like shapes, so feeding it a raw oxc-parser program makes string
 * literal unions and similar types in the current file degrade to `null`.
 */
export function createOxcProgram(code: string, jsx = true): Program {
  return parseOxcProgram(jsx ? 'input.tsx' : 'input.ts', code, jsx ? 'tsx' : 'ts') as unknown as Program
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
