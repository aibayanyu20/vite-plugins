import { invalidateTypeCache, resolveTypeElements } from '@vue/compiler-sfc'
import MagicString from 'magic-string'
import type { Identifier } from '@babel/types'
import { createAst } from './createAst'
import { findDefineComponents } from './findDefineComponents'
import { createTypeResolveContext } from './createTypeResolveContext'
import { haveDefineComponentImport } from './hasDefineComponentImport'
import { addProps } from './addProps'
import type { Context } from './context'

export function transform(code: string, id: string, mapFile?: Context) {
  const ast = createAst(code)
  // 判断是否有defineComponent
  if (!haveDefineComponentImport(ast))
    return

  const components = findDefineComponents(ast)
  const s = new MagicString(code)
  // 获取文件夹对应的路径
  // const dir = path.dirname(id)
  if (components.length) {
    for (const component of components) {
      // const componentName = component[0] ?? 'default'
      const fileName = id
      const propName = component[1]
      const setupCode = `defineProps<${propName}>()`
      try {
        const setupAst = createAst(setupCode, false)
        let target: any
        for (const s of setupAst.program.body) {
          if (
            s.type === 'ExpressionStatement'
              && s.expression.type === 'CallExpression'
              && (s.expression.callee as Identifier).name === 'defineProps'
          )
            target = s.expression.typeParameters!.params[0]
        }
        const typeResolveContext = createTypeResolveContext(setupCode, ast.program.body, fileName, mapFile)
        const raw = resolveTypeElements(typeResolveContext, target)
        const props = Object.keys(raw.props)
        const start = component[2]
        const end = component[3]
        // 获取代码片段
        const codeSlice = code.slice(start, end)
        const codeSliceAst = createAst(codeSlice)
        const genCode = addProps(codeSliceAst, props)
        if (genCode)
          s.overwrite(start, end, genCode)
      }
      catch (e) {
        // eslint-disable-next-line no-console
        console.info(`[tsx-auto-props] ${propName} parse error`)
      }
    }
  }
  return {
    code: s.toString(),
    map: s.generateMap(),
  }
}

export function invalidateTypeCacheId(file: string) {
  invalidateTypeCache(file)
}
