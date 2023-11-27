import { describe, expect, it } from 'vitest'
import { createAst } from '../src'
import { findDefineComponents } from '../src/parser/findDefineComponents'
import singleRaw from './fixtures/single.tsx?raw'

describe('findDefineComponents', () => {
  it('should work', () => {
    const ast = createAst(singleRaw)
    const res = findDefineComponents(ast)
    expect(res.map(v => v[1])).toEqual(['Props', 'Props2', 'Props3'])
  })
})
