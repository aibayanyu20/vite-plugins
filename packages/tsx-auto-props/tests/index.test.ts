import { describe, expect, it } from 'vitest'
import { resolveTypeElements } from '@vue/compiler-sfc'
import type { Identifier } from '@babel/types'
import { createAst, createTypeResolveContext } from '../src/parser'
import singleRaw from './fixtures/single.tsx?raw'

describe('tsx-auto-props', () => {
  it('single', () => {
    const ast = createAst(singleRaw)
    const code = `defineProps<Props>()`
    const typeResolveContext = createTypeResolveContext(code, ast.program.body, './anonymous.vue')
    const scriptSetupAst = createAst(code, false)
    let target: any
    for (const s of scriptSetupAst.program.body) {
      if (
        s.type === 'ExpressionStatement'
          && s.expression.type === 'CallExpression'
          && (s.expression.callee as Identifier).name === 'defineProps'
      )
        target = s.expression.typeParameters!.params[0]
    }
    const raw = resolveTypeElements(typeResolveContext, target)
    expect(Object.keys(raw.props)).toStrictEqual(['foo', 'bar'])
  })
})
