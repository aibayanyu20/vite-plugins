import { describe, expect, it } from 'vitest'
import { inlineTransform } from '../src/inlineTransform'
import { sfcCode } from './fixtrures/sfc-code'
import { compCode } from './fixtrures/comp-code'
import { mergePropsCode, mergePropsCode1 } from './fixtrures/merge-props-code'

describe('sfc', () => {
  it('should work', () => {
    const code = inlineTransform(sfcCode)
    expect(code).toMatchSnapshot()
    const compCode1 = inlineTransform(compCode)
    expect(compCode1).toMatchSnapshot()
    const _mergePropsCode1 = inlineTransform(mergePropsCode)
    expect(_mergePropsCode1).toMatchSnapshot()
    const mergePropsCode2 = inlineTransform(mergePropsCode1)
    expect(mergePropsCode2).toMatchSnapshot()
  })
})
