import * as t from '@babel/types'
import type { CallExpression } from '@babel/types'
import type { Parsed } from './typing'
import { traverse } from './createAst'
import { generateCode } from './utils'

function genCode(node: t.Node | t.File) {
  const res = generateCode(node)
  return res.code
}

/**
 * 检查当前的defineComponent的第一个参数是不是一个函数
 */
export function checkFunctionArgument(node: t.CallExpression, props: t.ArrayExpression) {
  const [arg] = node.arguments
  if (!t.isArrowFunctionExpression(arg) && !t.isFunctionExpression(arg))
    return false
    /**
     * 如果是就开始对第二个参数进行检查，如果存在第二个参数，那么我们就直接在第二个参数中进行添加props，如果不存在第二个参数，
     * 那么我们就要生成一个对象，并将props添加到对象中，然后将对象作为第二个参数传入
     */
  const arg2 = node.arguments[1]
  if (arg2) {
    // 存在第二个参数的情况
    if (t.isObjectExpression(arg2)) {
      // 如果第二个参数是一个对象，那么我们就直接在这个对象中添加一个props属性
      // 判断原始是不是存在一个props属性，如果存在就不添加了
      const propsProperty = arg2.properties.find(p => t.isObjectProperty(p) && 'name' in p.key && p.key.name === 'props')
      if (propsProperty)
        return false
      arg2.properties.push(t.objectProperty(t.identifier('props'), props))
    }
  }
  else {
    // 不存在第二个参数的情况
    // 生成一个对象
    const obj = t.objectExpression([t.objectProperty(t.identifier('props'), props)])
    // 将对象作为第二个参数传入
    node.arguments.push(obj)
  }
  return true
}

export function checkObjectArgument(node: t.CallExpression, props: t.ArrayExpression) {
  /**
   * 检查当前是不是一个对象，如果是一个对象,那么我们就直接在这个对象中添加一个props属性
   */
  const arg = node.arguments[0]
  if (t.isObjectExpression(arg)) {
    // 如果第二个参数是一个对象，那么我们就直接在这个对象中添加一个props属性
    // 判断原始是不是存在一个props属性，如果存在就不添加了
    const propsProperty = arg.properties.find(p => t.isObjectProperty(p) && 'name' in p.key && p.key.name === 'props')
    if (propsProperty)
      return false
    arg.properties.unshift(t.objectProperty(t.identifier('props'), props))
    return true
  }
  return false
}

/**
 * Add props to a defineComponent
 * @param parsed
 * @param props
 */
export function addProps(parsed: Parsed, props: string[]) {
  let code: string = ''
  const propsArray = t.arrayExpression(props.map(p => t.stringLiteral(p)))
  traverse(parsed, {
    ExportDefaultDeclaration({ node }) {
      const { declaration } = node
      if (t.isCallExpression(declaration) && t.isIdentifier(declaration?.callee) && declaration.callee?.name === 'defineComponent') {
        if (checkFunctionArgument(declaration, propsArray))
          code = genCode(node)
        else if (checkObjectArgument(declaration, propsArray))
          code = genCode(node)
      }
    },
    AssignmentExpression({ node }) {
      const right = node.right as CallExpression
      if (t.isCallExpression(right) && t.isIdentifier(right.callee) && right.callee.name === 'defineComponent') {
        if (checkFunctionArgument(right, propsArray))
          code = genCode(node)

        else if (checkObjectArgument(right, propsArray))
          code = genCode(node)
      }
    },
  })
  return code
}
