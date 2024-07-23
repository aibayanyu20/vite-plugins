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

const ReU = /(\d+)px/g

function pxToVw(input: string, baseWidth: number = 750): string {
  return input.replace(ReU, (_match, pxValue) => {
    const vwValue = Number(((Number.parseInt(pxValue) / baseWidth) * 100).toFixed(5))
    return `${vwValue}vw`
  })
}

export function formatStyleValue(value: any) {
  // 检查末位是不是px，如果是px的情况下，就对数据进行处理
  const baseWidth = normalizeStyle.prototype.baseWidth ?? 750
  if (isString(value))
    return pxToVw(value, baseWidth)

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
