export const isString = (val: unknown): val is string => typeof val === 'string'
export const isNumber = (val: unknown): val is number => typeof val === 'number'
export const isBoolean = (val: unknown): val is boolean => typeof val === 'boolean'
const isBase = (val: unknown): val is null | number | undefined | boolean => val === null || isNumber(val) || isBoolean(val) || val === undefined

export function objToStr(obj: Record<string, any>, isDeep = 1): string {
  let str = '{'
  for (const strKey in obj) {
    const value = obj[strKey]
    if (strKey === 'comp' && isDeep === 2) {
      str += `${strKey}: ${value},`
    }
    else if (isString(value)) {
      str += `'${strKey}': \`${value}\`,`
    }
    else if (isBase(value)) {
      str += `'${strKey}': ${value},`
    }
    else if (Array.isArray(value)) {
      str += `'${strKey}': [`
      for (const item of value) {
        if (isString(item))
          str += `'${item}',`
        else if (isBase(item))
          str += `${item},`
        else
          str += `${objToStr(item, isDeep + 1)},`
      }
      str = `${str.endsWith(',') ? str.slice(0, str.length - 1) : str}],`
    }
    else {
      str += `'${strKey}': ${objToStr(value, isDeep + 1)},`
    }
  }
  return `${str.slice(0, str.length > 1 ? str.length - 1 : str.length)}}`
}
