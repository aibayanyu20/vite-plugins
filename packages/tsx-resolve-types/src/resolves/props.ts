import MagicString from 'magic-string'
import { parseSync } from 'oxc-parser'
import {
  identifier,
  isArrowFunctionExpression,
  isAssignmentPattern,
  isCallExpression,
  isFunctionExpression,
  isIdentifier,
  isObjectExpression,
  isObjectProperty,
  objectExpression,
  objectProperty,
} from '@babel/types'
import type {
  ArrowFunctionExpression,
  CallExpression,
  Expression,
  FunctionExpression,
  Identifier,
  ObjectExpression,
  Pattern,
  RestElement,
  VariableDeclaration,
} from '@babel/types'
import { extractRuntimeProps } from '@v-c/resolve-types'
import { createExpressionAst } from '../utils/ast'
import {
  type CreateContextType,
  queueComponentOptionField,
  queueComponentOverwrite,
} from '../utils/context'

function getPropKeyName(node: any) {
  const key = node?.key
  if (!key)
    return undefined
  if (key.type === 'Identifier')
    return key.name
  if (key.type === 'StringLiteral' || key.type === 'Literal')
    return key.value
}

function isObjectPropertyLike(node: any) {
  return !!node && (node.type === 'ObjectProperty' || node.type === 'Property')
}

function isObjectMethodLike(node: any) {
  if (!node)
    return false
  if (node.type === 'ObjectMethod')
    return true
  return node.type === 'Property'
    && (node.method === true || node.value?.type === 'FunctionExpression' || node.value?.type === 'ArrowFunctionExpression')
}

function getMethodLikeParams(node: any) {
  if (!node)
    return undefined
  if (node.type === 'ObjectMethod')
    return node.params
  if (node.type === 'Property' && node.value && ('params' in node.value))
    return node.value.params
}

function getTypeAnnotation(node: Identifier) {
  if (node.typeAnnotation && 'typeAnnotation' in node.typeAnnotation)
    return node.typeAnnotation
}

function addTypes(prop: RestElement | Identifier | Pattern | undefined, ctx: CreateContextType, call?: CallExpression) {
  if (prop && isAssignmentPattern(prop)) {
    if (call && prop.left && typeof prop.start === 'number' && typeof prop.end === 'number')
      queueComponentOverwrite(ctx, call, prop.start, prop.end, ctx.ctx.getString(prop.left))

    if (isIdentifier(prop.left) && !ctx.ctx.propsTypeDecl) {
      const type = getTypeAnnotation(prop.left)
      if (type)
        ctx.ctx.propsTypeDecl = type as any
    }
    if (prop.right)
      ctx.ctx.propsRuntimeDefaults = prop.right as any

    return prop.left
  }
  else if (prop && isIdentifier(prop)) {
    const type = getTypeAnnotation(prop)
    if (type)
      ctx.ctx.propsTypeDecl = type as any
  }
}
function getObjectSetup(expression: ObjectExpression, ctx: CreateContextType, call: CallExpression) {
  const properties = expression.properties
  const setup = properties.find((property) => {
    return isObjectMethodLike(property) && getPropKeyName(property) === 'setup'
  })
  if (setup && isObjectMethodLike(setup)) {
    const params = getMethodLikeParams(setup)
    if (!params)
      return
    const prop = params[0]
    const leftAst = addTypes(prop, ctx, call)
    if (leftAst)
      params[0] = leftAst as any
  }
}

function getPropsTypeToDefine(exp: CallExpression, ctx: CreateContextType) {
  /**
   * 直接在函数的泛型数据中获取
   */
  if (exp.typeParameters) {
    const params = exp.typeParameters?.params
    if (params) {
      const prop = params[0]
      if (prop)
        ctx.ctx.propsTypeDecl = prop as any
    }
    return
  }

  const typeArgs = (exp as any).typeArguments?.params
  if (typeArgs) {
    const prop = typeArgs[0]
    if (prop)
      ctx.ctx.propsTypeDecl = prop as any
  }
}

function getFuncType(exp: ArrowFunctionExpression | FunctionExpression, ctx: CreateContextType, call: CallExpression) {
  const params = exp.params
  const prop = params[0]
  const left = addTypes(prop, ctx, call)
  if (left)
    params[0] = left as any
}

function addDefaultToProps(ast: ObjectExpression) {
  const props = ast.properties
  props.forEach((prop) => {
    if (isObjectProperty(prop)) {
      const value = prop.value
      if (isObjectExpression(value)) {
        const hasDefault = value.properties.find(p => isObjectProperty(p) && 'name' in p.key && p.key.name === 'default')
        if (!hasDefault)
          value.properties.push(objectProperty(identifier('default'), identifier('undefined')))
      }
    }
  })
}

function addUndefinedToProps(ast: Expression, ctx: CreateContextType) {
  // 是否需要给所有的默认值都添加一个 undefined
  if (ctx.setDefaultUndefined) {
    if (isCallExpression(ast)) {
      // 这是一个函数，获取第一个参数
      const arg1 = ast.arguments[0]
      if (arg1 && isObjectExpression(arg1))
        addDefaultToProps(arg1)
    }
    else if (isObjectExpression(ast)) {
      // 这是一个对象
      addDefaultToProps(ast)
    }
  }
}

function addUndefinedToPropsCode(code: string) {
  const prefix = 'const __tsxResolveTypesExpr__ = '
  const wrapped = `${prefix}${code}`
  let statement: any
  try {
    const result = parseSync('props-runtime.ts', wrapped, {
      lang: 'ts',
      sourceType: 'module',
      astType: 'ts',
    })
    statement = result.program.body[0]
  }
  catch {
    return code
  }

  if (!statement || statement.type !== 'VariableDeclaration')
    return code

  const declaration = (statement as VariableDeclaration).declarations[0]
  const init = declaration?.init
  if (!init)
    return code

  let propsObject: any
  if (isCallExpression(init)) {
    const arg1 = init.arguments[0]
    if (arg1 && isObjectExpression(arg1))
      propsObject = arg1
  }
  else if (init.type === 'ObjectExpression') {
    propsObject = init
  }

  if (!propsObject)
    return code

  const s = new MagicString(wrapped)
  const inserts: Array<{ pos: number; text: string }> = []
  for (const prop of propsObject.properties) {
    if (!(prop.type === 'Property' || isObjectProperty(prop)))
      continue

    const value = prop.value
    if (!value || value.type !== 'ObjectExpression' || typeof value.end !== 'number')
      continue

    const hasDefault = value.properties.find((p: any) => {
      if (!(p.type === 'Property' || isObjectProperty(p)))
        return false
      const key = p.key as any
      return (key?.type === 'Identifier' && key.name === 'default')
        || (key?.type === 'Literal' && key.value === 'default')
    })
    if (hasDefault)
      continue

    const insertText = value.properties.length ? ', default: undefined' : 'default: undefined'
    inserts.push({ pos: value.end - 1, text: insertText })
  }

  for (const insert of inserts.sort((a, b) => b.pos - a.pos))
    s.appendLeft(insert.pos, insert.text)

  return s.toString().slice(prefix.length)
}

function getPropsRuntime(ctx: CreateContextType) {
  if (ctx.ctx.propsTypeDecl) {
    // 开始执行函数获取里面的数据信息
    let propStr = extractRuntimeProps(ctx.ctx)
    ctx.ctx.propsTypeDecl = undefined
    ctx.ctx.propsRuntimeDefaults = undefined
    if (propStr) {
      /**
       * 判断生成的代码中是否存在
       */
      if (!ctx.importMergeDefaults)
        (propStr.includes('/*#__PURE__*/_mergeDefaults') || propStr.includes('/*@__PURE__*/_mergeDefaults') || propStr.includes('_mergeDefaults')) && (ctx.importMergeDefaults = true)
      if (ctx.setDefaultUndefined)
        propStr = addUndefinedToPropsCode(propStr)
      if (!ctx.astWriteback)
        return { code: propStr }

      const ast = createExpressionAst(propStr)
      addUndefinedToProps(ast, ctx)
      return { ast, code: propStr }
    }
  }
}

function addPropsToFunc(exp: CallExpression, ast: Expression) {
  const arg1 = exp.arguments[1]
  if (arg1) {
    if (isObjectExpression(arg1)) {
      const propsProperty = arg1.properties.find(p => isObjectPropertyLike(p) && getPropKeyName(p) === 'props')
      if (!propsProperty)
        arg1.properties.unshift(objectProperty(identifier('props'), ast))
    }
  }
  else {
    const obj = objectExpression([objectProperty(identifier('props'), ast)])
    exp.arguments.push(obj)
  }
}
export function resolveProps(expression: CallExpression, ctx: CreateContextType) {
  // 判断的第一个参数的类型
  const props = expression.arguments[0]
  if (!props)
    return
  getPropsTypeToDefine(expression, ctx)
  // 判断第一个参数的类型，是不是一个函数
  if (isFunctionExpression(props) || isArrowFunctionExpression(props)) {
    getFuncType(props, ctx, expression)
    const propRuntime = getPropsRuntime(ctx)
    if (propRuntime) {
      const optionsArg = expression.arguments[1]
      if (optionsArg && isObjectExpression(optionsArg)) {
        const hasProps = optionsArg.properties.find(p => isObjectPropertyLike(p) && getPropKeyName(p) === 'props')
        if (!hasProps)
          queueComponentOptionField(ctx, expression, 'props', propRuntime.code, optionsArg)
      }
      else if (!optionsArg) {
        queueComponentOptionField(ctx, expression, 'props', propRuntime.code)
      }
      if ('ast' in propRuntime && propRuntime.ast)
        addPropsToFunc(expression, propRuntime.ast)
    }
  }
  else if (props.type === 'ObjectExpression') {
    // 当前是一个对象，就需要判断是否存在一个属性是props
    const propsProperty = props.properties.find(p => isObjectPropertyLike(p) && getPropKeyName(p) === 'props')
    if (!propsProperty) {
      getObjectSetup(props, ctx, expression)
      const propRuntime = getPropsRuntime(ctx)
      if (propRuntime) {
        queueComponentOptionField(ctx, expression, 'props', propRuntime.code, props)
        if ('ast' in propRuntime && propRuntime.ast)
          props.properties.unshift(objectProperty(identifier('props'), propRuntime.ast))
      }
    }
  }
}
