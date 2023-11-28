import { describe, expect, it } from 'vitest'
import { createAst } from '../src/parser'
import { findDefineComponents } from '../src/parser/findDefineComponents'
import singleRaw from './fixtures/single.tsx?raw'
import nonTypeRaw from './fixtures/nonType.tsx?raw'
import complexRaw from './fixtures/complex.tsx?raw'

describe('findDefineComponents', () => {
  it('should work', () => {
    const ast = createAst(singleRaw)
    const res = findDefineComponents(ast)
    expect(res.map(v => v[1])).toEqual(['Props', 'Props2', 'Props3'])
  })

  it('non type', () => {
    const ast = createAst(nonTypeRaw)
    const res = findDefineComponents(ast)
    expect(res.length).toEqual(0)
  })

  it('complex type', () => {
    const ast = createAst(complexRaw)
    const res = findDefineComponents(ast)
    expect(res.map(v => v[1])).toEqual(['CommonProps & ComplexProps', 'CommonProps & ComplexProps', 'CommonProps & {\n  c: string;\n}'])
  })
})
