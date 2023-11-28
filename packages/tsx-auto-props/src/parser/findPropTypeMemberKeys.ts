import * as t from '@babel/types'
import generate from '@babel/generator'
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
      return param.members.map(getKeyName).join('')

    if (t.isTSIntersectionType(param)) {
      const res = generate(param)
      return res.code
    }

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

    if (!typeAnnotation || !isAllowedTypeAnnotation(typeAnnotation))
      return []

    return getTypeAnnotationName(typeAnnotation)
  }

  if (t.isArrowFunctionExpression(arg) || t.isFunctionExpression(arg)) {
    const propsParam = arg.params[0]
    if (propsParam && propsParam.typeAnnotation) {
      const typeAnnotation = propsParam.typeAnnotation
      if ('typeAnnotation' in typeAnnotation) {
        const typeAnnotation1 = typeAnnotation.typeAnnotation
        if (isAllowedTypeAnnotation(typeAnnotation1))
          return getTypeAnnotationName(typeAnnotation1)

        if (t.isTSIntersectionType(typeAnnotation1)) {
          const res = generate(typeAnnotation)
          const code = res.code
          if (code.startsWith(':'))
            return code.slice(1).trim()
          return res.code
        }
      }
    }
  }
  return undefined
}
