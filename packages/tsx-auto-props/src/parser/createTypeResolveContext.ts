import fs from 'node:fs'
import type { SimpleTypeResolveContext } from '@vue/compiler-sfc'
import { parse } from '@vue/compiler-sfc'
import type { Statement } from '@babel/types'

export function createTypeResolveContext(code: string, ast: Statement[], id: string): SimpleTypeResolveContext {
  const setup = `<script lang="ts" setup>${code}</script>`
  const { descriptor } = parse(setup, {
    filename: id,
  })
  const helperImports: Set<string> = new Set()
  const error = (msg: string, node: any, scope?: any) => {
    console.error(msg, node, scope)
    throw new Error(msg)
  }

  return {
    source: descriptor.source,
    filename: descriptor.filename,
    error,
    helper(key: string): string {
      helperImports.add(key)
      return `_${key}`
    },
    getString(node) {
      const block = descriptor.scriptSetup!
      return block.content.slice(node.start!, node.end!)
    },
    propsTypeDecl: undefined,
    propsRuntimeDefaults: undefined,
    propsDestructuredBindings: Object.create(null),
    emitsTypeDecl: undefined,
    ast,
    options: {
      fs: {
        fileExists(_file: string): boolean {
          // 检查文件是否存在
          return fs.existsSync(_file)
        },
        readFile(_file: string): string | undefined {
          return fs.readFileSync(_file, 'utf-8')
        },
      },
    },
  }
}
