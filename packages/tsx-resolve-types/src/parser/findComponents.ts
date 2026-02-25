import { walk } from 'oxc-walker'
import type { Program } from '@oxc-project/types'
import type { CallExpression } from '@babel/types'
import type { AST } from '../interface'
import { getOxcProgram } from '../utils/ast'
import { traverse } from '../utils/traverse'

function checkIsDefineComponent(node: CallExpression) {
  return node.callee && (node as any).callee?.name === 'defineComponent'
}

function fallbackFindComponents(ast: AST) {
  const componentsAst: CallExpression[] = []
  traverse(ast, {
    CallExpression({ node }) {
      if (checkIsDefineComponent(node))
        componentsAst.push(node as CallExpression)
    },
  })
  return componentsAst
}

export function findComponents(ast: AST) {
  const oxcProgram = getOxcProgram(ast)
  if (!oxcProgram)
    return fallbackFindComponents(ast)

  const ranges: Array<{ start: number, end: number }> = []
  walk(oxcProgram, {
    enter(node) {
      if (node.type !== 'CallExpression')
        return
      if (node.callee.type === 'Identifier' && node.callee.name === 'defineComponent')
        ranges.push({ start: node.start, end: node.end })
    },
  })

  if (!ranges.length)
    return []

  const rangeKeySet = new Set(ranges.map(range => `${range.start}:${range.end}`))
  const nodeByRange = new Map<string, CallExpression>()
  traverse(ast, {
    CallExpression({ node }) {
      const key = `${node.start}:${node.end}`
      if (rangeKeySet.has(key) && checkIsDefineComponent(node as CallExpression))
        nodeByRange.set(key, node as CallExpression)
    },
  })

  return ranges
    .map(range => nodeByRange.get(`${range.start}:${range.end}`))
    .filter((node): node is CallExpression => !!node)
}

export function findComponentsOxc(program: Program) {
  const components: any[] = []
  walk(program, {
    enter(node) {
      if (node.type !== 'CallExpression')
        return
      if (node.callee.type === 'Identifier' && node.callee.name === 'defineComponent')
        components.push(node)
    },
  })
  return components
}
