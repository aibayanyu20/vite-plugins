import * as t from '@babel/types'
import type { Parsed } from './typing'

function isAllowedTypeAnnotation(typeAnnotation: any): typeAnnotation is t.TSTypeLiteral | t.TSTypeReference {
  return t.isTSTypeLiteral(typeAnnotation)
    || (t.isTSTypeReference(typeAnnotation)
        && 'typeName' in typeAnnotation
        && 'name' in typeAnnotation.typeName)
}

const getKeyName = (node: any) => node.key.name
const getTypeAnnotationName = (node: any) => node.typeName?.name
/**
 * Get member keys from a CallExpression, extracts its typeDefinition
 */
export function findPropTypeMemberKeys(parsed: Parsed, node: t.CallExpression) {
  if (node.typeParameters) {
    const [param] = node.typeParameters.params
    if (t.isTSTypeLiteral(param))
      return param.members.map(getKeyName)

    if (!t.isTSTypeReference(param) || !('name' in param.typeName))
      return []

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
      return []

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
      return []

    const setup = (
      t.isObjectMethod(setupProperty) ? setupProperty : setupProperty.value
    ) as t.ObjectMethod | t.ArrowFunctionExpression

    const [propsParam] = setup.params

    const typeAnnotation
            = 'typeAnnotation' in propsParam
            && propsParam.typeAnnotation
            && 'typeAnnotation' in propsParam.typeAnnotation
            && propsParam.typeAnnotation?.typeAnnotation

    if (!typeAnnotation || !isAllowedTypeAnnotation(typeAnnotation))
      return []

    return getTypeAnnotationName(typeAnnotation)
  }

  if (t.isArrowFunctionExpression(arg) || t.isFunctionExpression(arg)) {
    const propsParam = arg.params[0]
    if (
      propsParam?.typeAnnotation
            && 'typeAnnotation' in propsParam.typeAnnotation
            && isAllowedTypeAnnotation(propsParam.typeAnnotation.typeAnnotation)
    ) {
      const typeAnnotation = propsParam.typeAnnotation.typeAnnotation
      return getTypeAnnotationName(typeAnnotation)
    }
  }
  return undefined
}
