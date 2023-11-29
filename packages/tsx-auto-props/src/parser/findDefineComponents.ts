import { isCallExpression, isIdentifier } from '@babel/types'
import type { Parsed } from './typing'
import { traverse } from './createAst'
import { findPropTypeMemberKeys } from './findPropTypeMemberKeys'

export type FindDefineComponentsResult = [ string | undefined, string, number, number]

export function findDefineComponents(parsed: Parsed): FindDefineComponentsResult[] {
  const result: FindDefineComponentsResult[] = []
  traverse(parsed, {
    VariableDeclarator({ node: { id, init, end, start } }) {
      if (isCallExpression(init) && isIdentifier(init?.callee) && isIdentifier(id) && init.callee?.name === 'defineComponent') {
        const memberKeys = findPropTypeMemberKeys(parsed, init)
        if (memberKeys)
          result.push([id.name, memberKeys, start!, end!])
      }
    },
    ExportDefaultDeclaration({ node: { declaration, end, start } }) {
      if (isCallExpression(declaration) && isIdentifier(declaration?.callee) && declaration.callee?.name === 'defineComponent') {
        const memberKeys = findPropTypeMemberKeys(parsed, declaration)
        if (memberKeys)
          result.push([undefined, memberKeys, start!, end!])
      }
    },
  })
  return result
}
