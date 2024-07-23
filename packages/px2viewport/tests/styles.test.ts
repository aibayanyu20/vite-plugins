import { describe, expect, it } from 'vitest'
import { transform } from '../src/transform'
import { inlineTransform } from '../src/inlineTransform'
import { testCode1, testCode2, testCode3 } from './fixtrures/test-code'

describe('styles', () => {
  it('should work', () => {
    const res = transform(testCode1, './aa.vue')
    expect(res).toMatchSnapshot()
    expect(transform(testCode2, './ab.vue')).toMatchSnapshot()
  })
  it('should inline css', () => {
    expect(inlineTransform(testCode3)).toMatchSnapshot()
  })
})
