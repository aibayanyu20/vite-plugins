import { describe, expect, it } from 'vitest'
import { transform } from '../src/transform'
import { inlineTransform } from '../src/inlineTransform'
import { testCode1, testCode2, testCode3 } from './fixtrures/test-code'
import { mergePropsCode, mergePropsCode1 } from './fixtrures/merge-props-code'

describe('styles', () => {
  it('should work', () => {
    const res = transform(testCode1)
    expect(res).toMatchSnapshot()
    expect(transform(testCode2)).toMatchSnapshot()
  })
  it('should inline css', () => {
    expect(inlineTransform(testCode3)).toMatchSnapshot()
  })

  it('should merge props', () => {
    const res = transform(mergePropsCode)
    expect(res).toMatchSnapshot()

    const res1 = transform(mergePropsCode1)
    expect(res1).toMatchSnapshot()
  })
})
