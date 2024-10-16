import { parse } from '@babel/parser'
import type { ObjectExpression } from '@babel/types'
import { traverse } from './utils/traverse'
import { generate } from './utils/genrate'
import type { Px2viewportOptionsCommon } from './index'

export function pxToVw(input: string, _config?: Px2viewportOptionsCommon): string {
  const config = {
    viewportWidth: _config?.viewportWidth ?? 750,
    unitToConvert: 'px',
    unitPrecision: 5,
    viewportUnit: 'vw',
    minPixelValue: undefined,
    ..._config,
  }
  const ReU = new RegExp(`(\\d+)${config.unitToConvert}`, 'g')
  const baseWidth = config.viewportWidth as number

  return input.replace(ReU, (_, pxValue) => {
    const vwValue = Number(((Number.parseInt(pxValue) / baseWidth) * 100).toFixed(config.unitPrecision ?? 5))
    if (config.minPixelValue && vwValue < config.minPixelValue)
      return `${config.minPixelValue}${config.unitToConvert}`

    return `${vwValue}${config.viewportUnit}`
  })
}

function resolveStyleObject(node: ObjectExpression, config?: Px2viewportOptionsCommon) {
  const props = node.properties
  for (const prop of props) {
    if (prop.type === 'ObjectProperty' && prop.value.type === 'StringLiteral') {
      if (prop.value.value)
        prop.value.value = pxToVw(prop.value.value, config)
    }
  }
}

function resolveObjectExpression(node: ObjectExpression, config?: Px2viewportOptionsCommon) {
  const props = node.properties
  for (const prop of props) {
    if (prop.type === 'ObjectProperty' && prop.key.type === 'Identifier' && prop.key.name === 'style') {
      if (prop.value.type === 'ObjectExpression')
        resolveStyleObject(prop.value, config)
    }
  }
}

export function inlineTransform(code: string, config?: Px2viewportOptionsCommon) {
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
            resolveObjectExpression(node.init, config)
          }
        }
      }
    },
    CallExpression({ node }) {
      if (node.callee.type === 'Identifier' && (node.callee.name === '_createElementVNode' || node.callee.name === '_createVNode')) {
        // TODO
        const props = node?.arguments?.[1]
        if (props && props.type === 'ObjectExpression') {
          const properties = props.properties
          for (const prop of properties) {
            if (prop.type === 'ObjectProperty' && prop.key.type === 'Identifier' && prop.key.name === 'style') {
              if (prop.value.type === 'ObjectExpression')
                resolveStyleObject(prop.value, config)
            }
          }
        }
      }
    },
  })
  return generate(ast).code
}
