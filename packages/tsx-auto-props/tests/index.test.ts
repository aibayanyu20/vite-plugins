import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { inferRuntimeType, resolveTypeElements } from '@vue/compiler-sfc'
import type { Identifier } from '@babel/types'
import { createAst, createTypeResolveContext } from '../src/parser'
import { generateCode } from '../src/parser/utils'
import singleRaw from './fixtures/single.tsx?raw'

export const basePath = fileURLToPath(new URL('./fixtures', import.meta.url))
describe('tsx-auto-props', () => {
  it('single', () => {
    const ast = createAst(singleRaw)
    const code = `defineProps<Props>()`
    const typeResolveContext = createTypeResolveContext(code, ast.program.body, path.resolve(basePath, './anonymous.vue'))
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
    const props: Record<string, any> = {}
    for (const key in raw.props) {
      const propType = inferRuntimeType(typeResolveContext, raw.props[key])
      props[key] = {
        type: propType,
      }
    }
    const code1 = `const props = ${JSON.stringify(props)}`
    const code1Ast = createAst(code1, false)
    const constAst = code1Ast.program.body[0]
    if (constAst.type === 'VariableDeclaration') {
      const decl = constAst.declarations[0]
      if (decl.type === 'VariableDeclarator' && decl.init)
        console.log(generateCode(decl.init))
    }

    expect(Object.keys(props)).toStrictEqual(['foo', 'bar'])
  })
})
