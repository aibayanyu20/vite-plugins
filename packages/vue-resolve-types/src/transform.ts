import fs from 'node:fs'
import MagicString from 'magic-string'
import { ScriptCompileContext, extractRuntimeEmits, extractRuntimeProps } from '@v-c/resolve-types'
import { walk } from 'oxc-walker'
import { parse } from 'vue/compiler-sfc'
import type { UserOptions } from './interface'

function cleanVueId(id: string) {
  const queryIndex = id.indexOf('?')
  return queryIndex >= 0 ? id.slice(0, queryIndex) : id
}

function isVueFile(id: string) {
  return cleanVueId(id).endsWith('.vue')
}

function getTypeParam(call: any) {
  return call?.typeParameters?.params?.[0] ?? call?.typeArguments?.params?.[0]
}

function isIdentifierCall(node: any, name: string) {
  return node?.type === 'CallExpression'
    && node.callee?.type === 'Identifier'
    && node.callee.name === name
}

function getImportedName(specifier: any) {
  switch (specifier?.type) {
    case 'ImportSpecifier':
      return specifier.imported?.name ?? specifier.imported?.value ?? specifier.local?.name
    case 'ImportDefaultSpecifier':
      return 'default'
    case 'ImportNamespaceSpecifier':
      return '*'
    default:
      return specifier?.local?.name
  }
}

function recordImports(body: any[]) {
  const imports: Record<string, { source: string, imported: string }> = Object.create(null)
  for (const node of body) {
    if (node?.type !== 'ImportDeclaration')
      continue
    for (const specifier of node.specifiers || []) {
      const local = specifier?.local?.name
      if (!local)
        continue
      imports[local] = {
        imported: getImportedName(specifier),
        source: node.source?.value,
      }
    }
  }
  return imports
}

function ensureScope(ctx: any) {
  if (ctx.scope)
    return

  ctx.scope = {
    types: Object.create(null),
    imports: ctx.userImports,
    filename: ctx.filename,
    source: ctx.source,
    offset: 0,
    isGenericScope: false,
    declares: Object.create(null),
    resolvedImportSources: Object.create(null),
    exportedTypes: Object.create(null),
    exportedDeclares: Object.create(null),
  }
}

function registerLocalDeclarations(ctx: any, body: any[]) {
  ensureScope(ctx)
  for (const node of body) {
    if (!node)
      continue
    if (
      node.type === 'TSTypeAliasDeclaration'
      || node.type === 'TSInterfaceDeclaration'
      || node.type === 'TSEnumDeclaration'
    ) {
      ctx.scope.types[node.id.name] = node
      continue
    }
    if (node.type === 'VariableDeclaration') {
      for (const decl of node.declarations || []) {
        if (decl.id?.type === 'Identifier')
          ctx.scope.declares[decl.id.name] = decl
      }
      continue
    }
    if (node.type === 'ClassDeclaration' && node.id) {
      ctx.scope.types[node.id.name] = node
      ctx.scope.declares[node.id.name] = node
      continue
    }
    if (node.type === 'ExportNamedDeclaration' && node.declaration) {
      const decl = node.declaration
      if (
        decl.type === 'TSTypeAliasDeclaration'
        || decl.type === 'TSInterfaceDeclaration'
        || decl.type === 'TSEnumDeclaration'
      ) {
        ctx.scope.types[decl.id.name] = decl
      }
      else if (decl.type === 'VariableDeclaration') {
        for (const d of decl.declarations || []) {
          if (d.id?.type === 'Identifier')
            ctx.scope.declares[d.id.name] = d
        }
      }
      else if (decl.type === 'ClassDeclaration' && decl.id) {
        ctx.scope.types[decl.id.name] = decl
        ctx.scope.declares[decl.id.name] = decl
      }
    }
  }
}

function createTypeResolveCtx(descriptor: any, filename: string) {
  const ctx = new ScriptCompileContext(descriptor, {
    id: filename,
    fs: {
      fileExists(file: string) {
        return fs.existsSync(file)
      },
      readFile(file: string) {
        return fs.readFileSync(file, 'utf-8')
      },
      realpath(file: string) {
        return fs.realpathSync(file)
      },
    },
  }) as any

  const body = [
    ...(ctx.scriptAst?.body || []),
    ...(ctx.scriptSetupAst?.body || []),
  ]
  ctx.userImports = recordImports(body)
  registerLocalDeclarations(ctx, body)
  ctx.scope.imports = ctx.userImports

  return ctx
}

function collectDefinePropsCalls(scriptSetupAst: any) {
  const targets: Array<
    | { kind: 'defineProps', call: any }
    | { kind: 'withDefaults', wrapper: any, call: any, defaults: any }
  > = []
  const seen = new Set<string>()
  const wrappedDefineProps = new Set<string>()
  const add = (call: any) => {
    if (!isIdentifierCall(call, 'defineProps'))
      return
    if ((call.arguments?.length || 0) > 0)
      return
    if (!getTypeParam(call))
      return
    const key = `${call.start}:${call.end}`
    if (seen.has(key))
      return
    if (wrappedDefineProps.has(key))
      return
    seen.add(key)
    targets.push({ kind: 'defineProps', call })
  }

  walk(scriptSetupAst as any, {
    enter(node: any) {
      if (isIdentifierCall(node, 'withDefaults')) {
        const call = node.arguments?.[0]
        const defaults = node.arguments?.[1]
        if (
          isIdentifierCall(call, 'defineProps')
          && (call.arguments?.length || 0) === 0
          && getTypeParam(call)
          && defaults
          && typeof node.start === 'number'
          && typeof node.end === 'number'
        ) {
          const key = `${call.start}:${call.end}`
          wrappedDefineProps.add(key)
          seen.add(key)
          targets.push({ kind: 'withDefaults', wrapper: node, call, defaults })
        }
        return
      }
      add(node)
    },
  })

  return targets.sort((a, b) => {
    const aStart = a.kind === 'withDefaults' ? a.wrapper.start : a.call.start
    const bStart = b.kind === 'withDefaults' ? b.wrapper.start : b.call.start
    return (aStart || 0) - (bStart || 0)
  })
}

function collectDefineEmitsCalls(scriptSetupAst: any) {
  const calls: any[] = []
  const seen = new Set<string>()
  walk(scriptSetupAst as any, {
    enter(node: any) {
      if (!isIdentifierCall(node, 'defineEmits'))
        return
      if ((node.arguments?.length || 0) > 0)
        return
      if (!getTypeParam(node))
        return
      const key = `${node.start}:${node.end}`
      if (seen.has(key))
        return
      seen.add(key)
      calls.push(node)
    },
  })

  return calls.sort((a, b) => (a.start || 0) - (b.start || 0))
}

function validateMacroCallUsage(scriptSetupAst: any) {
  walk(scriptSetupAst as any, {
    enter(node: any) {
      if (!isIdentifierCall(node, 'defineProps') && !isIdentifierCall(node, 'defineEmits'))
        return

      const hasType = !!getTypeParam(node)
      const hasRuntimeArgs = (node.arguments?.length || 0) > 0
      if (hasType && hasRuntimeArgs) {
        const macro = node.callee.name
        throw new Error(
          `[@vue/compiler-sfc] ${macro}() cannot accept both type and non-type arguments at the same time. Use one or the other.`,
        )
      }
    },
  })
}

function ensureMergeDefaultsImport(local: MagicString, content: string) {
  const transformed = local.toString()
  if (!/\b_mergeDefaults\b/.test(transformed))
    return
  if (/\b_mergeDefaults\b/.test(content))
    return
  local.prepend(`import { mergeDefaults as _mergeDefaults } from 'vue'\n`)
}

function toEmitsRuntimeCode(emits: Iterable<string> | undefined) {
  if (!emits)
    return undefined
  const list = Array.from(emits).filter((item): item is string => typeof item === 'string' && item.length > 0)
  return JSON.stringify(list)
}

function normalizePropsRuntimeCode(code: string) {
  // Align with Vue compiler-sfc type-based runtime props output for unknown/any:
  // `{ required: true }` -> `{ type: null, required: true }`
  return code.replace(
    /(:\s*\{\s*)(required\s*:\s*(?:true|false))/g,
    '$1type: null, $2',
  )
}

export function transformVueSfc(code: string, id: string, options: UserOptions = {}) {
  if (!isVueFile(id))
    return null

  const filename = cleanVueId(id)
  const { descriptor } = parse(code, { filename })
  const scriptSetup = descriptor.scriptSetup
  if (!scriptSetup)
    return null

  const lang = scriptSetup.lang || 'js'
  if (!['ts', 'tsx'].includes(lang))
    return null

  const ctx = createTypeResolveCtx(descriptor, filename)
  if (!ctx.scriptSetupAst)
    return null
  validateMacroCallUsage(ctx.scriptSetupAst)

  const enableProps = options.props !== false
  const enableEmits = options.emits !== false

  const definePropsCalls = enableProps ? collectDefinePropsCalls(ctx.scriptSetupAst) : []
  const defineEmitsCalls = enableEmits ? collectDefineEmitsCalls(ctx.scriptSetupAst) : []
  if (definePropsCalls.length === 0 && defineEmitsCalls.length === 0)
    return null

  const local = new MagicString(scriptSetup.content)
  let changed = false
  let needsMergeDefaultsImport = false

  for (const target of definePropsCalls) {
    const call = target.call
    const typeParam = getTypeParam(call)
    if (!typeParam)
      continue

    const replaceStart = target.kind === 'withDefaults' ? target.wrapper.start : call.start
    const replaceEnd = target.kind === 'withDefaults' ? target.wrapper.end : call.end
    if (typeof replaceStart !== 'number' || typeof replaceEnd !== 'number')
      continue

    ctx.propsCall = call
    ctx.propsTypeDecl = typeParam
    ctx.propsRuntimeDecl = undefined
    ctx.propsRuntimeDefaults = target.kind === 'withDefaults' ? target.defaults : undefined

    ctx.helperImports.clear?.()
    const runtimeProps = extractRuntimeProps(ctx)
    if (!runtimeProps)
      continue

    local.overwrite(replaceStart, replaceEnd, `defineProps(${normalizePropsRuntimeCode(runtimeProps)})`)
    if (ctx.helperImports?.has?.('mergeDefaults'))
      needsMergeDefaultsImport = true
    changed = true
  }

  for (const call of defineEmitsCalls) {
    const typeParam = getTypeParam(call)
    if (!typeParam || typeof call.start !== 'number' || typeof call.end !== 'number')
      continue

    ctx.emitsCall = call
    ctx.emitsTypeDecl = typeParam
    ctx.emitsRuntimeDecl = undefined

    const runtimeEmits = toEmitsRuntimeCode(extractRuntimeEmits(ctx))
    if (!runtimeEmits)
      continue

    local.overwrite(call.start, call.end, `defineEmits(${runtimeEmits})`)
    changed = true
  }

  if (!changed)
    return null

  if (needsMergeDefaultsImport)
    ensureMergeDefaultsImport(local, scriptSetup.content)

  const start = scriptSetup.loc.start.offset
  const end = scriptSetup.loc.end.offset
  const s = new MagicString(code)
  s.overwrite(start, end, local.toString())

  return {
    code: s.toString(),
    map: s.generateMap({
      source: filename,
      hires: true,
    }),
  }
}
