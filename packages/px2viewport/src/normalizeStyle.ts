import { normalizeClass } from 'vue'
import type { VNodeProps } from 'vue'

export function isOn(key: string): boolean {
  return key.charCodeAt(0) === 111
    && /* o */ key.charCodeAt(1) === 110 /* n */ &&
    // uppercase letter
    (key.charCodeAt(2) > 122 || key.charCodeAt(2) < 97)
}
type Data = Record<string, unknown>
type NormalizedStyle = Record<string, string | number>
const isArray = Array.isArray
const isString = (val: unknown): val is string => typeof val === 'string'
const isObject = (val: unknown): val is Record<string, unknown> => val !== null && typeof val === 'object'

const listDelimiterRE = /;(?![^(]*\))/g
const propertyDelimiterRE = /:([^]+)/
const styleCommentRE = /\/\*[^]*?\*\//g

function parseStringStyle(cssText: string): NormalizedStyle {
  const ret: NormalizedStyle = {}
  cssText
    .replace(styleCommentRE, '')
    .split(listDelimiterRE)
    .forEach((item) => {
      if (item) {
        const tmp = item.split(propertyDelimiterRE)
        tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim())
      }
    })
  return ret
}

interface Px2viewportOptions {
/**
 * 需要转换的单位，默认为"px"
 */
  unitToConvert?: string
  /**
   * 单位转换后保留的精度
   */
  unitPrecision?: number
  /**
   * 希望使用的视口单位
   */
  viewportUnit?: string
  /**
   * 设置最小的转换数值，如果为1的话，只有大于1的值会被转换
   */
  minPixelValue?: number
  /**
   * 设计稿的视口宽度
   */
  viewportWidth?: number
}
declare global {
  interface Window {
    __px2viewport: Px2viewportOptions
  }
}

function pxToVw(input: string): string {
  let config: Px2viewportOptions = {
    viewportWidth: 750,
    unitToConvert: 'px',
    unitPrecision: 5,
    viewportUnit: 'vw',
    minPixelValue: undefined,
  }
  if (window && window.__px2viewport) {
    config = {
      ...config,
      ...window.__px2viewport,
    }
  }
  const baseWidth = config.viewportWidth as number
  const ReU = new RegExp(`(\\d+)${config.unitToConvert}`, 'g')
  return input.replace(ReU, (_match, pxValue) => {
    const vwValue = Number(((Number.parseInt(pxValue) / baseWidth) * 100).toFixed(config.unitPrecision ?? 5))
    if (config.minPixelValue && vwValue < config.minPixelValue)
      return `${config.minPixelValue}${config.unitToConvert}`

    return `${vwValue}${config.viewportUnit}`
  })
}

export function formatStyleValue(value: any) {
  // 检查末位是不是px，如果是px的情况下，就对数据进行处理
  if (isString(value))
    return pxToVw(value)

  return value
}

export function normalizeStyle(value: unknown): NormalizedStyle | string | undefined {
  if (isArray(value)) {
    const res: NormalizedStyle = {}
    for (let i = 0; i < value.length; i++) {
      const item = value[i]
      const normalized = isString(item)
        ? parseStringStyle(item)
        : (normalizeStyle(item) as NormalizedStyle)
      if (normalized) {
        for (const key in normalized)
          res[key] = formatStyleValue(normalized[key])
      }
    }
    return res
  }
  else if (isString(value)) {
    const res: NormalizedStyle = {}
    const normalized = parseStringStyle(value) ?? {}
    for (const key in normalized)
      res[key] = formatStyleValue(normalized[key])
    return res
  }
  else if (isObject(value)) {
    const res: NormalizedStyle = {}
    for (const key in value) {
      const val = formatStyleValue(value[key])
      res[key] = val as any
    }
    return res
  }
}

export function mergeProps(...args: (Data & VNodeProps)[]): Data {
  const ret: Data = {}
  for (let i = 0; i < args.length; i++) {
    const toMerge = args[i]
    for (const key in toMerge) {
      if (key === 'class') {
        if (ret.class !== toMerge.class)
          ret.class = normalizeClass([ret.class, toMerge.class])
      }
      else if (key === 'style') {
        ret.style = normalizeStyle([ret.style, toMerge.style])
      }
      else if (isOn(key)) {
        const existing = ret[key]
        const incoming = toMerge[key]
        if (
          incoming
            && existing !== incoming
            && !(isArray(existing) && existing.includes(incoming))
        ) {
          ret[key] = existing
            ? [].concat(existing as any, incoming as any)
            : incoming
        }
      }
      else if (key !== '') {
        ret[key] = toMerge[key]
      }
    }
  }
  return ret
}
