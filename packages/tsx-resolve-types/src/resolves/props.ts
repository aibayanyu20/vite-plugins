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
} from '@babel/types'
import { extractRuntimeProps } from '@v-c/resolve-types'
import { parseExpression } from '@babel/parser'
import type { CreateContextType } from '../utils/context'

function getTypeAnnotation(node: Identifier) {
  if (node.typeAnnotation && 'typeAnnotation' in node.typeAnnotation)
    return node.typeAnnotation
}

function addTypes(prop: RestElement | Identifier | Pattern | undefined, ctx: CreateContextType) {
  if (prop && isAssignmentPattern(prop)) {
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
function getObjectSetup(expression: ObjectExpression, ctx: CreateContextType) {
  const properties = expression.properties
  const setup = properties.find((property) => {
    return property.type === 'ObjectMethod' && 'name' in property.key && property.key.name === 'setup'
  })
  if (setup?.type === 'ObjectMethod') {
    const params = setup.params
    const prop = params[0]
    const leftAst = addTypes(prop, ctx)
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
  }
}

function getFuncType(exp: ArrowFunctionExpression | FunctionExpression, ctx: CreateContextType) {
  const params = exp.params
  const prop = params[0]
  const left = addTypes(prop, ctx)
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

function getPropsStr(ctx: CreateContextType) {
  if (ctx.ctx.propsTypeDecl) {
    // 开始执行函数获取里面的数据信息
    const propStr = extractRuntimeProps(ctx.ctx)
    ctx.ctx.propsTypeDecl = undefined
    ctx.ctx.propsRuntimeDefaults = undefined
    if (propStr) {
      /**
       * 判断生成的代码中是否存在
       */
      if (!ctx.importMergeDefaults)
        (propStr.includes('/*#__PURE__*/_mergeDefaults') || propStr.includes('/*@__PURE__*/_mergeDefaults') || propStr.includes('_mergeDefaults')) && (ctx.importMergeDefaults = true)
      const ast = parseExpression(propStr)
      addUndefinedToProps(ast, ctx)
      return ast
    }
  }
}

function addPropsToFunc(exp: CallExpression, ast: Expression) {
  const arg1 = exp.arguments[1]
  if (arg1) {
    if (isObjectExpression(arg1)) {
      const propsProperty = arg1.properties.find(p => isObjectProperty(p) && 'name' in p.key && p.key.name === 'props')
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
    getFuncType(props, ctx)
    const propAst = getPropsStr(ctx)
    if (propAst)
      addPropsToFunc(expression, propAst)
  }
  else if (props.type === 'ObjectExpression') {
    // 当前是一个对象，就需要判断是否存在一个属性是props
    const propsProperty = props.properties.find(p => isObjectProperty(p) && 'name' in p.key && p.key.name === 'props')
    if (!propsProperty) {
      getObjectSetup(props, ctx)
      const propAst = getPropsStr(ctx)
      if (propAst)
        props.properties.unshift(objectProperty(identifier('props'), propAst))
    }
  }
}
