import { describe, expect, it } from 'vitest'
import { createAst } from '../src/parser'
import { findDefineComponents } from '../src/parser/findDefineComponents'
import singleRaw from './fixtures/single.tsx?raw'
import nonTypeRaw from './fixtures/nonType.tsx?raw'
import complexRaw from './fixtures/complex.tsx?raw'
import exportRaw from './fixtures/export.tsx?raw'
import inlineRaw from './fixtures/inline.tsx?raw'
import genericRaw from './fixtures/generic.tsx?raw'
import renderRaw from './fixtures/render.tsx?raw'
import extraRaw from './fixtures/extra.tsx?raw'

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
    expect(res.map(v => v[1])).toEqual(['CommonProps & ComplexProps', 'CommonProps & ComplexProps', 'CommonProps & {\n  c: string;\n}', 'CommonProps & ComplexProps'])
  })

  it('export default type', () => {
    const ast = createAst(exportRaw)
    const res = findDefineComponents(ast)
    expect(res.map(v => v[1])).toEqual(['CommonProps'])
  })

  it('inline', () => {
    const ast = createAst(inlineRaw)
    const res = findDefineComponents(ast)
    expect(res.map(v => v[1])).toEqual(['{\n  c: string;\n  a: number;\n}', '{\n  c: string;\n  a: number;\n}', '{\n  c: string;\n  a: number;\n}'])
  })

  it('generic', () => {
    const ast = createAst(genericRaw)
    const res = findDefineComponents(ast)
    expect(res.length).toEqual(1)
  })

  it('render', () => {
    const ast = createAst(renderRaw)
    const res = findDefineComponents(ast)
    expect(res.length).toEqual(1)
  })

  it('extra', () => {
    const ast = createAst(extraRaw)
    const res = findDefineComponents(ast)
    expect(res.length).toEqual(1)
  })
})
