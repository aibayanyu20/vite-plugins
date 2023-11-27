import * as t from '@babel/types'
import { traverse } from './createAst'
import type { Parsed } from './typing'

/**
 * Determine if the code has a `defineComponent` import from `vue`
 */
export function haveDefineComponentImport(parsed: Parsed) {
  let haveDefineComponentValueImport = false
  traverse(parsed, {
    ImportDeclaration({ node }) {
      if (node.source.value === 'vue') {
        for (const specifier of node.specifiers) {
          if (
            t.isImportSpecifier(specifier)
                        && 'name' in specifier.imported
                        && specifier.imported.name === 'defineComponent'
          )
            haveDefineComponentValueImport = true
        }
      }
    },
  })

  return haveDefineComponentValueImport
}
