import fs from 'node:fs'
import MagicString from 'magic-string'
import type { CallExpression, ObjectExpression } from '@babel/types'
import type { Program as OxcProgram } from '@oxc-project/types'
import type { ScriptCompileContext } from '@v-c/resolve-types'
import type { AST, UserOptions } from '../interface'
import { createAst, createOxcProgram, getOxcProgram } from './ast'
import type { GraphContext } from './graphContext'

interface PendingOverwrite {
  start: number
  end: number
  text: string
}

interface PendingObjectInsert {
  insertAt: number
  hasExistingProperties: boolean
  fields: string[]
}

interface ComponentPatchState {
  overwrites: PendingOverwrite[]
  objectInserts: Map<string, PendingObjectInsert>
  syntheticOptionsFields: string[]
  flushed: boolean
}

export interface CreateContextType {
  ctx: ScriptCompileContext
  ast?: AST
  oxcProgram?: OxcProgram
  source: string
  s: MagicString
  astWriteback: boolean
  filepath: string
  importMergeDefaults?: boolean
  setDefaultUndefined?: UserOptions['defaultPropsToUndefined']
  componentPatches: Map<string, ComponentPatchState>
}

interface CreateContextOptions {
  astWriteback?: boolean
}

function getRangeKey(start?: number | null, end?: number | null) {
  return `${start}:${end}`
}

function getCallPatchState(ctx: CreateContextType, call: CallExpression) {
  const key = getRangeKey(call.start, call.end)
  let state = ctx.componentPatches.get(key)
  if (!state) {
    state = {
      overwrites: [],
      objectInserts: new Map(),
      syntheticOptionsFields: [],
      flushed: false,
    }
    ctx.componentPatches.set(key, state)
  }
  return state
}

function getObjectInsertState(state: ComponentPatchState, objectNode: ObjectExpression) {
  const key = getRangeKey(objectNode.start, objectNode.end)
  let objectState = state.objectInserts.get(key)
  if (!objectState) {
    objectState = {
      insertAt: (objectNode.start ?? 0) + 1,
      hasExistingProperties: objectNode.properties.length > 0,
      fields: [],
    }
    state.objectInserts.set(key, objectState)
  }
  return objectState
}

export function queueComponentOverwrite(ctx: CreateContextType, call: CallExpression, start: number | null | undefined, end: number | null | undefined, text: string) {
  if (typeof start !== 'number' || typeof end !== 'number' || start > end)
    return

  const state = getCallPatchState(ctx, call)
  state.overwrites.push({ start, end, text })
}

export function queueComponentOptionField(ctx: CreateContextType, call: CallExpression, key: 'props' | 'emits', valueCode: string, objectNode?: ObjectExpression) {
  const state = getCallPatchState(ctx, call)
  state.flushed = false
  const fieldCode = `${key}: ${valueCode}`

  if (objectNode) {
    const objectState = getObjectInsertState(state, objectNode)
    objectState.fields.push(fieldCode)
    return
  }

  state.syntheticOptionsFields.push(fieldCode)
}

function hasCallTrailingComma(ctx: CreateContextType, call: CallExpression) {
  const args = (call.arguments || []) as any[]
  const lastArg = args[args.length - 1]
  if (!lastArg || typeof lastArg.end !== 'number' || typeof call.end !== 'number')
    return false

  const tail = ctx.source.slice(lastArg.end, call.end - 1)
  return /,\s*(?:\/\*[\s\S]*?\*\/\s*|\/\/[^\n]*\s*)*$/.test(tail)
}

export function flushComponentPatch(ctx: CreateContextType, call: CallExpression) {
  const state = ctx.componentPatches.get(getRangeKey(call.start, call.end))
  if (!state || state.flushed)
    return

  const objectInserts = Array.from(state.objectInserts.values())
    .filter(v => v.fields.length > 0)
    .sort((a, b) => b.insertAt - a.insertAt)

  for (const insert of objectInserts) {
    const content = insert.fields.join(', ')
    const text = insert.hasExistingProperties
      ? `${content}, `
      : content
    ctx.s.appendLeft(insert.insertAt, text)
  }

  if (state.syntheticOptionsFields.length > 0 && typeof call.end === 'number') {
    const hasArgs = Array.isArray((call as any).arguments) && (call as any).arguments.length > 0
    const prefix = !hasArgs
      ? ''
      : hasCallTrailingComma(ctx, call)
        ? ' '
        : ', '
    ctx.s.appendLeft(call.end - 1, `${prefix}{ ${state.syntheticOptionsFields.join(', ')} }`)
  }

  const overwrites = state.overwrites
    .slice()
    .sort((a, b) => b.start - a.start)
  for (const overwrite of overwrites)
    ctx.s.overwrite(overwrite.start, overwrite.end, overwrite.text)

  state.flushed = true
}

export function ensureBabelAst(ctx: CreateContextType) {
  if (ctx.ast)
    return ctx.ast

  const ast = createAst(ctx.source)
  ctx.ast = ast
  ctx.oxcProgram ||= getOxcProgram(ast)
  ;(ctx.ctx as any).ast = ast.program.body
  return ast
}

export function createContext(code: string, id: string, graphCtx?: GraphContext, options: CreateContextOptions = {}): CreateContextType {
  const astWriteback = options.astWriteback ?? true
  const ast = astWriteback ? createAst(code) : undefined
  let oxcProgram: OxcProgram | undefined
  if (ast) {
    oxcProgram = getOxcProgram(ast)
  }
  else {
    try {
      oxcProgram = createOxcProgram(code)
    }
    catch {
      // Let transform() fall back to the Babel component scan path.
    }
  }
  const helper = new Set<string>()
  return {
    ast,
    oxcProgram,
    filepath: id,
    source: code,
    s: new MagicString(code),
    astWriteback,
    importMergeDefaults: false,
    componentPatches: new Map(),
    ctx: {
      filename: id,
      source: code,
      ast: ast?.program.body ?? [],
      error(msg: any) {
        throw new Error(`[tsx-resolve-types] ${msg}`)
      },
      helper(key: any) {
        helper.add(key)
        return `_${key}`
      },
      getString(node: any) {
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
    } as unknown as ScriptCompileContext,
  }
}
