import { describe, expect, it } from 'vitest'
import { inlineTransform } from '../src/inlineTransform'
import { sfcCode } from './fixtrures/sfc-code'
import { compCode } from './fixtrures/comp-code'

describe('sfc', () => {
  it('should work', () => {
    const code = inlineTransform(sfcCode)
    expect(code).toMatchSnapshot()
    const compCode1 = inlineTransform(compCode)
    expect(compCode1).toMatchSnapshot()
  })
})
