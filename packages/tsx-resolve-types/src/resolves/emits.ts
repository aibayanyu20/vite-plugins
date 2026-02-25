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
import { extractRuntimeEmits } from '@v-c/resolve-types'
import {
  type CreateContextType,
  queueComponentOptionField,
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

function isSetupMethodLike(node: any) {
  if (!node)
    return false
  if (node.type === 'ObjectMethod')
    return true
  return node.type === 'Property'
    && getPropKeyName(node) === 'setup'
    && (node.value?.type === 'FunctionExpression' || node.value?.type === 'ArrowFunctionExpression')
}

function getMethodLikeParams(node: any) {
  if (!node)
    return undefined
  if (node.type === 'ObjectMethod')
    return node.params
  if (node.type === 'Property' && node.value && ('params' in node.value))
    return node.value.params
}

function addEmitsType(exp: Identifier | RestElement | Pattern, ctx: CreateContextType) {
  if (isObjectPattern(exp) || isIdentifier(exp)) {
    const typeAnnotation = exp.typeAnnotation
    if (typeAnnotation && 'typeAnnotation' in typeAnnotation) {
      const node = typeAnnotation.typeAnnotation
      if (isTSTypeReference(node) && node.typeName && 'name' in node.typeName && node.typeName.name === 'SetupContext') {
        const typeParameters = (node as any).typeParameters ?? (node as any).typeArguments
        if (typeParameters && typeParameters.params) {
          const params = typeParameters.params
          const prop = params[0]
          if (prop)
            ctx.ctx.emitsTypeDecl = prop as any
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
    return isSetupMethodLike(property)
  })

  /**
   * 存在setup的情况下
   */
  if (setup && (isObjectMethod(setup) || isSetupMethodLike(setup))) {
    const params = getMethodLikeParams(setup)
    if (!params)
      return
    const setupCtx = params[1]
    if (setupCtx) {
      // 处理添加数据
      addEmitsType(setupCtx, ctx)
    }
  }
}

function getEmitsRuntime(ctx: CreateContextType) {
  if (ctx.ctx.emitsTypeDecl) {
    const emits = extractRuntimeEmits(ctx.ctx)
    ctx.ctx.emitsTypeDecl = undefined
    if (emits && emits.size) {
      const values = Array.from(emits)
      const code = `[${values.map(v => JSON.stringify(v)).join(', ')}]`
      if (!ctx.astWriteback)
        return { code }

      const keys = values.map((v) => {
        return stringLiteral(v)
      })

      return {
        code,
        ast: arrayExpression(keys),
      }
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
    const genericParams = (expression as any).typeParameters?.params ?? (expression as any).typeArguments?.params
    if (genericParams && genericParams[1]) {
      // 这里的值存在的情况下直接使用这里的值
      const types = genericParams[1]
      ctx.ctx.emitsTypeDecl = types as any
      const emitRuntime = getEmitsRuntime(ctx)
      if (emitRuntime) {
        const optionsArg = expression.arguments[1]
        if (optionsArg && isObjectExpression(optionsArg)) {
          const hasEmits = optionsArg.properties.find(p => isObjectPropertyLike(p) && getPropKeyName(p) === 'emits')
          if (!hasEmits)
            queueComponentOptionField(ctx, expression, 'emits', emitRuntime.code, optionsArg)
        }
        else if (!optionsArg) {
          queueComponentOptionField(ctx, expression, 'emits', emitRuntime.code)
        }
        if ('ast' in emitRuntime && emitRuntime.ast)
          addEmitsToFunc(expression, emitRuntime.ast)
      }
    }
    else if (params.length) {
      const emits = params[1]
      if (emits)
        addEmitsType(emits, ctx)
      const emitRuntime = getEmitsRuntime(ctx)
      if (emitRuntime) {
        const optionsArg = expression.arguments[1]
        if (optionsArg && isObjectExpression(optionsArg)) {
          const hasEmits = optionsArg.properties.find(p => isObjectPropertyLike(p) && getPropKeyName(p) === 'emits')
          if (!hasEmits)
            queueComponentOptionField(ctx, expression, 'emits', emitRuntime.code, optionsArg)
        }
        else if (!optionsArg) {
          queueComponentOptionField(ctx, expression, 'emits', emitRuntime.code)
        }
        if ('ast' in emitRuntime && emitRuntime.ast)
          addEmitsToFunc(expression, emitRuntime.ast)
      }
    }
  }
  else if (isObjectExpression(argument)) {
    // 当前是Object的模式
    const emitsProp = argument.properties.find(p => isObjectPropertyLike(p) && getPropKeyName(p) === 'emits')
    if (!emitsProp) {
      getSetupContext(argument, ctx)
      const emitRuntime = getEmitsRuntime(ctx)
      if (emitRuntime) {
        // 存在ast
        queueComponentOptionField(ctx, expression, 'emits', emitRuntime.code, argument)
        if ('ast' in emitRuntime && emitRuntime.ast)
          argument.properties.unshift(objectProperty(identifier('emits'), emitRuntime.ast))
      }
    }
  }
}
