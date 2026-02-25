import { createContext, ensureBabelAst, flushComponentPatch } from './utils/context'
import { findComponents, findComponentsOxc } from './parser'
import { resolveProps } from './resolves/props'
import { resolveEmits } from './resolves/emits'
import { checkMergeDefaults } from './utils/checkMergeDefaults'
import type { GraphContext } from './utils/graphContext'
import type { UserOptions } from './interface'

function applyComponentPatches(ctx: ReturnType<typeof createContext>, options: UserOptions, useOxcNodes: boolean) {
  const expression = useOxcNodes && ctx.oxcProgram
    ? findComponentsOxc(ctx.oxcProgram)
    : findComponents(ensureBabelAst(ctx))

  for (const callExpression of expression) {
    if (options.props !== false)
      resolveProps(callExpression as any, ctx)
    if (options.emits !== false)
      resolveEmits(callExpression as any, ctx)
    flushComponentPatch(ctx, callExpression as any)
  }
}

function hasMagicStringChanged(ctx: ReturnType<typeof createContext>) {
  const s = ctx.s as any
  if (typeof s.hasChanged === 'function')
    return !!s.hasChanged()
  return s.toString() !== ctx.source
}

export function transform(code: string, id: string, graphCtx: GraphContext, options: UserOptions = {}) {
  if (options.props === false && options.emits === false)
    return code

  const createTransformContext = () => {
    const ctx = createContext(code, id, graphCtx, { astWriteback: false })
    if (options.defaultPropsToUndefined)
      ctx.setDefaultUndefined = options.defaultPropsToUndefined
    return ctx
  }

  let ctx = createTransformContext()
  try {
    applyComponentPatches(ctx, options, true)
    if (!hasMagicStringChanged(ctx)) {
      // OXC path can fail "silently" when upstream type resolver returns no props/emits
      // for unsupported OXC node shapes. Fall back to the Babel AST path in that case.
      ctx = createTransformContext()
      applyComponentPatches(ctx, options, false)
    }
  }
  catch {
    // @v-c/resolve-types is still not fully OXC-node compatible for all cases.
    ctx = createTransformContext()
    applyComponentPatches(ctx, options, false)
  }
  checkMergeDefaults(ctx)

  const s = ctx.s

  return {
    code: s.toString(),
    map: s.generateMap({
      source: id,
      includeContent: true,
      hires: true,
    }),
  }
}
