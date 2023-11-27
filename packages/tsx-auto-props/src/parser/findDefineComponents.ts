import { isCallExpression, isIdentifier } from '@babel/types'
import type { Parsed } from './typing'
import { traverse } from './createAst'
import { findPropTypeMemberKeys } from './findPropTypeMemberKeys'

export type FindDefineComponentsResult = [string, string, number]

export function findDefineComponents(parsed: Parsed): FindDefineComponentsResult[] {
  const result: FindDefineComponentsResult[] = []
  traverse(parsed, {
    VariableDeclarator({ node: { id, init, end } }) {
      if (isCallExpression(init) && isIdentifier(init?.callee) && isIdentifier(id) && init.callee?.name === 'defineComponent') {
        const memberKeys = findPropTypeMemberKeys(parsed, init)
        result.push([id.name, memberKeys, end!])
      }
    },
  })
  return result
}
