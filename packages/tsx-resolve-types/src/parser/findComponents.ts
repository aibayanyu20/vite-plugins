import type { CallExpression } from '@babel/types'
import { isCallExpression } from '@babel/types'
import type { AST } from '../interface'
import { traverse } from '../utils/traverse'

function checkIsDefineComponent(node: CallExpression) {
  return isCallExpression(node) && node.callee && (node as any).callee?.name === 'defineComponent'
}
export function findComponents(ast: AST) {
  const componentsAst: CallExpression[] = []
  traverse(ast, {
    CallExpression({ node }) {
      if (checkIsDefineComponent(node))
        componentsAst.push(node)
    },
  })
  return componentsAst
}
