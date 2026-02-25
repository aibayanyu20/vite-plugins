import type { CreateContextType } from './context'
import { ensureBabelAst } from './context'
import { traverse } from './traverse'
import { createAst } from './ast'

const MERGE_DEFAULTS_IMPORT = `import { mergeDefaults as _mergeDefaults } from 'vue';`

export function checkMergeDefaults(ctx: CreateContextType) {
  if (!ctx.importMergeDefaults)
    return

  let hasImportVue = false

  if (ctx.astWriteback) {
    traverse(ensureBabelAst(ctx), {
      ImportDeclaration(path) {
        if (path.node.source.value === 'vue') {
          const node = path.node.specifiers.find((v: any) => {
            return v.local.name === '_mergeDefaults'
          })
          if (node)
            hasImportVue = true
        }
      },
    })
  }
  else if (ctx.oxcProgram) {
    for (const node of ctx.oxcProgram.body as any[]) {
      if (node?.type !== 'ImportDeclaration')
        continue
      if (node.source?.value !== 'vue')
        continue
      if (node.specifiers?.some((v: any) => v?.type === 'ImportSpecifier' && v.local?.name === '_mergeDefaults')) {
        hasImportVue = true
        break
      }
    }
  }

  if (!hasImportVue) {
    if (ctx.astWriteback) {
      const myAst = createAst(`import { mergeDefaults as  _mergeDefaults } from 'vue'`, false)
      ensureBabelAst(ctx).program.body.unshift(
        ...myAst.program.body,
      )
    }
    ctx.s.prepend(`${MERGE_DEFAULTS_IMPORT}\n`)
  }
}
