import path from 'node:path'
import { resolveTypeElements } from '@vue/compiler-sfc'
import MagicString from 'magic-string'
import type { Identifier } from '@babel/types'
import { createAst } from './createAst'
import { findDefineComponents } from './findDefineComponents'
import { createTypeResolveContext } from './createTypeResolveContext'
import { haveDefineComponentImport } from './hasDefineComponentImport'

function generateDefineProps(name: string, props: string[]) {
  return `\nObject.defineProperty(${name}, "props", {
  value: ${JSON.stringify(props)},
});`
}
export function transform(code: string, id: string) {
  const ast = createAst(code)
  // 判断是否有defineComponent
  if (!haveDefineComponentImport(ast))
    return

  const components = findDefineComponents(ast)
  const s = new MagicString(code)
  // 获取文件夹对应的路径
  const dir = path.dirname(id)
  if (components.length) {
    for (const component of components) {
      const fileName = path.resolve(dir, `${component[0]}.vue`)
      const propName = component[1]
      const setupCode = `defineProps<${propName}>()`
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
      const typeResolveContext = createTypeResolveContext(setupCode, ast.program.body, fileName)
      const raw = resolveTypeElements(typeResolveContext, target)
      const props = Object.keys(raw.props)
      const genCode = generateDefineProps(component[0], props)
      s.appendRight(component[2] + 1, genCode)
    }
  }

  return {
    code: s.toString(),
    map: s.generateMap(),
  }
}
