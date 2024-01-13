import path from 'node:path'
import generate from '@babel/generator'
import { basePath } from '../tests/fixtures/constant'
import { createContext } from './utils/context'
import { findComponents } from './parser'
import { resolveProps } from './resolves/props'
import { checkMergeDefaults } from './utils/checkMergeDefaults'
import type { GraphContext } from './utils/graphContext'

export function transform(code: string, id: string, graphCtx: GraphContext) {
  const ctx = createContext(code, path.resolve(basePath, id), graphCtx)
  const expression = findComponents(ctx.ast)
  for (const callExpression of expression)
    resolveProps(callExpression, ctx)
  checkMergeDefaults(ctx)

  return generate(ctx.ast).code
}
