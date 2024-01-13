import type { CallExpression, Expression, Identifier, ObjectExpression, Pattern, RestElement } from '@babel/types'
import {
  arrayExpression,
  identifier,
  isArrowFunctionExpression,
  isFunctionExpression,
  isIdentifier,
  isObjectExpression,
  isObjectMethod,
  isObjectPattern,
  isObjectProperty,
  isTSTypeReference,
  objectExpression,
  objectProperty,
  stringLiteral,
} from '@babel/types'
import { extractRuntimeEmits } from '@vue/compiler-sfc'
import type { CreateContextType } from '../utils/context'

function addEmitsType(exp: Identifier | RestElement | Pattern, ctx: CreateContextType) {
  if (isObjectPattern(exp) || isIdentifier(exp)) {
    const typeAnnotation = exp.typeAnnotation
    if (typeAnnotation && 'typeAnnotation' in typeAnnotation) {
      const node = typeAnnotation.typeAnnotation
      if (isTSTypeReference(node) && node.typeName && 'name' in node.typeName && node.typeName.name === 'SetupContext') {
        const typeParameters = node.typeParameters
        if (typeParameters && typeParameters.params) {
          const params = typeParameters.params
          const prop = params[0]
          if (prop)
            ctx.ctx.emitsTypeDecl = prop
        }
      }
    }
  }
}

function addEmitsToFunc(exp: CallExpression, ast: Expression) {
  const arg1 = exp.arguments[1]
  if (arg1) {
    if (isObjectExpression(arg1)) {
      const propsProperty = arg1.properties.find(p => isObjectProperty(p) && 'name' in p.key && p.key.name === 'emits')
      if (!propsProperty)
        arg1.properties.unshift(objectProperty(identifier('emits'), ast))
    }
  }
  else {
    const obj = objectExpression([objectProperty(identifier('emits'), ast)])
    exp.arguments.push(obj)
  }
}
function getSetupContext(expression: ObjectExpression, ctx: CreateContextType) {
  /**
   * 检索setup的函数
   */
  const properties = expression.properties
  const setup = properties.find((property) => {
    return property.type === 'ObjectMethod' && 'name' in property.key && property.key.name === 'setup'
  })

  /**
   * 存在setup的情况下
   */
  if (setup && isObjectMethod(setup)) {
    const params = setup.params
    const setupCtx = params[1]
    if (setupCtx) {
      // 处理添加数据
      addEmitsType(setupCtx, ctx)
    }
  }
}

function getEmitsAst(ctx: CreateContextType) {
  if (ctx.ctx.emitsTypeDecl) {
    // 开始执行
    const emits = extractRuntimeEmits(ctx.ctx)
    ctx.ctx.emitsTypeDecl = undefined
    if (emits && emits.size) {
      const keys = Array.from(emits).map((v) => {
        return stringLiteral(v)
      })

      return arrayExpression(keys)
    }
  }
}

export function resolveEmits(expression: CallExpression, ctx: CreateContextType) {
  /**
   * 拿到props的第一个参数
   */
  const argument = expression.arguments[0]
  if (!argument)
    return

  if (isFunctionExpression(argument) || isArrowFunctionExpression(argument)) {
    const params = argument.params
    if (params.length) {
      const emits = params[1]
      if (emits)
        addEmitsType(emits, ctx)
      const emitAst = getEmitsAst(ctx)
      if (emitAst)
        addEmitsToFunc(expression, emitAst)
    }
  }
  else if (isObjectExpression(argument)) {
    // 当前是Object的模式
    const emitsProp = argument.properties.find(p => isObjectProperty(p) && 'name' in p.key && p.key.name === 'emits')
    if (!emitsProp) {
      getSetupContext(argument, ctx)
      const emitAst = getEmitsAst(ctx)
      if (emitAst) {
        // 存在ast
        argument.properties.unshift(objectProperty(identifier('emits'), emitAst))
      }
    }
  }
}
