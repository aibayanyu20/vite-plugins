import fs from 'node:fs'
import type { SimpleTypeResolveContext } from '@vue/compiler-sfc'
import type { AST } from '../interface'
import { createAst } from './ast'
import type { GraphContext } from './graphContext'

export interface CreateContextType {
  ctx: SimpleTypeResolveContext
  ast: AST
  source: string
  filepath: string
  importMergeDefaults?: boolean
  setDefaultUndefined?: boolean
}

export function createContext(code: string, id: string, graphCtx?: GraphContext): CreateContextType {
  const ast = createAst(code)
  const helper = new Set<string>()
  return {
    ast,
    filepath: id,
    source: code,
    importMergeDefaults: false,
    ctx: {
      filename: id,
      source: code,
      ast: ast.program.body,
      error(msg) {
        throw new Error(`[tsx-resolve-types] ${msg}`)
      },
      helper(key) {
        helper.add(key)
        return `_${key}`
      },
      getString(node) {
        return code.slice(node.start!, node.end!)
      },
      propsTypeDecl: undefined,
      propsRuntimeDefaults: undefined,
      propsDestructuredBindings: Object.create(null),
      emitsTypeDecl: undefined,
      isCE: false,
      options: {
        fs: {
          fileExists(_file: string): boolean {
            // 检查文件是否存在
            try {
              const stat = fs.statSync(_file)
              if (stat.isFile()) {
                if (!(/node_modules/.test(_file))) {
                  graphCtx?.add(_file, id)
                  graphCtx?.addGraph(id, _file)
                }

                return true
              }
              return false
            }
            catch (e) {
              return false
            }
          },
          readFile(_file: string): string | undefined {
            return fs.readFileSync(_file, 'utf-8')
          },
        },
      },
    },
  }
}
