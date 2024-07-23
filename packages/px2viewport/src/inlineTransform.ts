import { parse } from '@babel/parser'
import type { ObjectExpression } from '@babel/types'
import { traverse } from './utils/traverse'
import { generate } from './utils/genrate'

const ReU = /(\d+)px/g

function pxToVw(input: string, baseWidth: number = 750): string {
  return input.replace(ReU, (_match, pxValue) => {
    const vwValue = Number(((Number.parseInt(pxValue) / baseWidth) * 100).toFixed(5))
    return `${vwValue}vw`
  })
}
function resolveStyleObject(node: ObjectExpression) {
  const props = node.properties
  for (const prop of props) {
    if (prop.type === 'ObjectProperty' && prop.value.type === 'StringLiteral') {
      if (prop.value.value)
        prop.value.value = pxToVw(prop.value.value)
    }
  }
}

function resolveObjectExpression(node: ObjectExpression) {
  const props = node.properties
  for (const prop of props) {
    if (prop.type === 'ObjectProperty' && prop.key.type === 'Identifier' && prop.key.name === 'style') {
      if (prop.value.type === 'ObjectExpression')
        resolveStyleObject(prop.value)
    }
  }
}

export function inlineTransform(code: string) {
  // 使用babel进行转换
  const ast = parse(code, {
    sourceType: 'module',
  })
  traverse(ast, {
    // 获取当前定义的函数
    VariableDeclarator({ node }) {
      if (node.id) {
        // 判断一下name是不是为_hoisted_变量提升的数据
        if (node.id.type === 'Identifier' && node.id.name.startsWith('_hoisted_')) {
          // 证明是变量提升的数据
          if (node.init && node.init.type === 'ObjectExpression') {
            // 如果是一个对象的情况下如何进行处理
            resolveObjectExpression(node.init)
          }
        }
      }
    },
  })
  return generate(ast).code
}
