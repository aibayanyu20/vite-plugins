import * as t from '@babel/types'
import type { Parsed } from './typing'
import { generateCode } from './utils'

function isAllowedTypeAnnotation(typeAnnotation: any): typeAnnotation is t.TSTypeLiteral | t.TSTypeReference {
  return t.isTSTypeLiteral(typeAnnotation)
    || (t.isTSTypeReference(typeAnnotation)
        && 'typeName' in typeAnnotation
        && 'name' in typeAnnotation.typeName)
}

const getKeyName = (node: any) => node.key.name
const getTypeAnnotationName = (node: any) => node.typeName?.name

function getIntersectionTypeName(node: t.Node) {
  const res = generateCode(node)
  const code = res.code
  if (code.startsWith(':'))
    return code.slice(1).trim()
  return res.code
}
/**
 * Get member keys from a CallExpression, extracts its typeDefinition
 */
export function findPropTypeMemberKeys(parsed: Parsed, node: t.CallExpression) {
  if (node.typeParameters) {
    const [param] = node.typeParameters.params

    if (t.isTSIntersectionType(param) || t.isTSTypeLiteral(param))
      return getIntersectionTypeName(param)

    if (!t.isTSTypeReference(param) || !('name' in param.typeName))
      return

    const { name: typeName } = param.typeName
    return typeName
  }

  const [arg] = node.arguments
  if (t.isObjectExpression(arg)) {
    const properties = arg.properties.filter(
      p => t.isObjectProperty(p) || t.isObjectMethod(p),
    )
    const propsPropetry = properties.find(
      p => t.isObjectProperty(p) && 'name' in p.key && p.key.name === 'props',
    )
    // It already has a props property, so we don't need to add it
    if (propsPropetry)
      return

    const setupProperty = properties.find(
      p =>
        (t.isObjectMethod(p) || t.isObjectProperty(p))
                && 'name' in p.key
                && p.key.name === 'setup',
    )

    if (
      !setupProperty
            || !(t.isObjectMethod(setupProperty) || t.isObjectProperty(setupProperty))
    )
      return

    const setup = (
      t.isObjectMethod(setupProperty) ? setupProperty : setupProperty.value
    ) as t.ObjectMethod | t.ArrowFunctionExpression

    const [propsParam] = setup.params

    const typeAnnotation
            = 'typeAnnotation' in propsParam
            && propsParam.typeAnnotation
            && 'typeAnnotation' in propsParam.typeAnnotation
            && propsParam.typeAnnotation?.typeAnnotation
    // console.log(typeAnnotation)
    if (!typeAnnotation)
      return
    if (t.isTSTypeLiteral(typeAnnotation))
      return getIntersectionTypeName(typeAnnotation)

    if (isAllowedTypeAnnotation(typeAnnotation))
      return getTypeAnnotationName(typeAnnotation)

    if (t.isTSIntersectionType(typeAnnotation))
      return getIntersectionTypeName(typeAnnotation)

    return
  }

  if (t.isArrowFunctionExpression(arg) || t.isFunctionExpression(arg)) {
    const propsParam = arg.params[0]
    if (propsParam && propsParam.typeAnnotation) {
      const typeAnnotation = propsParam.typeAnnotation

      if ('typeAnnotation' in typeAnnotation) {
        const typeAnnotation1 = typeAnnotation.typeAnnotation
        if (t.isTSTypeLiteral(typeAnnotation1))
          return getIntersectionTypeName(typeAnnotation1)

        if (isAllowedTypeAnnotation(typeAnnotation1))
          return getTypeAnnotationName(typeAnnotation1)

        if (t.isTSIntersectionType(typeAnnotation1))
          return getIntersectionTypeName(typeAnnotation)
      }
    }
  }
  return undefined
}
