import path from 'node:path'
import { describe, expect, it } from 'vitest'
import generate from '@babel/generator'
import { createContext } from '../src/utils/context'
import { findComponents } from '../src/parser'
import { resolveEmits } from '../src/resolves/emits'
import { basePath } from './fixtures/constant'
import inlineRaw from './fixtures/emits/inline.tsx?raw'
import funcRaw from './fixtures/emits/func.tsx?raw'

describe('emits', () => {
  it('inline', () => {
    const code = compiler(inlineRaw, 'inline.tsx')
    expect(code).toMatchSnapshot()
  })

  it('func', () => {
    const code = compiler(funcRaw, 'func.tsx')
    expect(code).toMatchSnapshot()
  })
})
function compiler(raw: string, id: string) {
  const ctx = createContext(raw, path.resolve(basePath, `emits/${id}`))
  const expression = findComponents(ctx.ast)
  for (const callExpression of expression)
    resolveEmits(callExpression, ctx)

  return generate(ctx.ast).code
}
