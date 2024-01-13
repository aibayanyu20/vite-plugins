import { createContext } from './utils/context'
import { findComponents } from './parser'
import { resolveProps } from './resolves/props'
import { resolveEmits } from './resolves/emits'
import { checkMergeDefaults } from './utils/checkMergeDefaults'
import type { GraphContext } from './utils/graphContext'
import type { UserOptions } from './interface'
import { generate } from './utils/genrate'

export function transform(code: string, id: string, graphCtx: GraphContext, options: UserOptions = {}) {
  if (options.props === false && options.emits === false)
    return code

  const ctx = createContext(code, id, graphCtx)
  const expression = findComponents(ctx.ast)
  for (const callExpression of expression) {
    if (options.props !== false)
      resolveProps(callExpression, ctx)
    if (options.emits !== false)
      resolveEmits(callExpression, ctx)
  }
  checkMergeDefaults(ctx)
  const gen = generate(ctx.ast)
  return {
    code: gen.code,
    map: gen.map,
  }
}
