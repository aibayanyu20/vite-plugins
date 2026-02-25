import MagicString from 'magic-string'
import type { CallExpression, ImportDeclaration } from '@babel/types'
import { createContext } from './utils/context'
import { findComponents } from './parser'
import { resolveProps } from './resolves/props'
import { resolveEmits } from './resolves/emits'
import { checkMergeDefaults } from './utils/checkMergeDefaults'
import type { GraphContext } from './utils/graphContext'
import type { UserOptions } from './interface'
import { generate } from './utils/genrate'

function isWritableCallExpression(node: CallExpression) {
  return typeof node.start === 'number' && typeof node.end === 'number' && node.start <= node.end
}

function getPrependedImports(ctx: ReturnType<typeof createContext>, bodyLengthBeforeCheck: number) {
  const bodyLengthAfterCheck = ctx.ast.program.body.length
  const addedCount = bodyLengthAfterCheck - bodyLengthBeforeCheck
  if (addedCount <= 0)
    return []

  return ctx.ast.program.body
    .slice(0, addedCount)
    .filter((node): node is ImportDeclaration => node.type === 'ImportDeclaration')
}

export function transform(code: string, id: string, graphCtx: GraphContext, options: UserOptions = {}) {
  if (options.props === false && options.emits === false)
    return code

  const ctx = createContext(code, id, graphCtx)
  if (options.defaultPropsToUndefined)
    ctx.setDefaultUndefined = true

  const expression = findComponents(ctx.ast)
  for (const callExpression of expression) {
    if (options.props !== false)
      resolveProps(callExpression, ctx)
    if (options.emits !== false)
      resolveEmits(callExpression, ctx)
  }
  const bodyLengthBeforeCheck = ctx.ast.program.body.length
  checkMergeDefaults(ctx)

  const s = new MagicString(code)
  const prependedImports = getPrependedImports(ctx, bodyLengthBeforeCheck)
  if (prependedImports.length > 0) {
    const importCode = prependedImports.map(node => generate(node).code).join('\n')
    if (importCode)
      s.prepend(`${importCode}\n`)
  }

  const writableCalls = expression
    .filter(isWritableCallExpression)
    .sort((a, b) => b.start! - a.start!)

  for (const callExpression of writableCalls) {
    s.overwrite(callExpression.start!, callExpression.end!, generate(callExpression).code)
  }

  return {
    code: s.toString(),
    map: s.generateMap({
      source: id,
      includeContent: true,
      hires: true,
    }),
  }
}
