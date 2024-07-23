import { describe, expect, it } from 'vitest'

const ReU = /(\d+)px/g

function pxToVw(input: string, baseWidth: number = 750): string {
  return input.replace(ReU, (_match, pxValue) => {
    const vwValue = Number(((Number.parseInt(pxValue) / baseWidth) * 100).toFixed(5))
    return `${vwValue}vw`
  })
}

describe('px-to-vw', () => {
  it('should work', () => {
    expect(pxToVw('100px')).toBe('13.33333vw')
    expect(pxToVw('calc(100vh - 100px)')).toBe('calc(100vh - 13.33333vw)')
    expect(pxToVw('calc(var(--aaa) - 100px)')).toBe('calc(var(--aaa) - 13.33333vw)')
    expect(pxToVw('1px')).toBe('0.13333vw')
    expect(pxToVw('10px 10px 10px 1vw')).toBe('1.33333vw 1.33333vw 1.33333vw 1vw')
    expect(pxToVw('0px')).toBe('0vw')
    expect(pxToVw('0')).toBe('0')
    expect(pxToVw('10vw')).toBe('10vw')
    expect(pxToVw('10rpx')).toBe('10rpx')
  })

  it('should work with baseWidth', () => {
    expect(pxToVw('100px', 375)).toBe('26.66667vw')
    expect(pxToVw('1px', 375)).toBe('0.26667vw')
    expect(pxToVw('0px', 375)).toBe('0vw')
  })
})
