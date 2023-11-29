import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { transform } from '../src/parser'
import singleRaw from './fixtures/single.tsx?raw'
import complexRaw from './fixtures/complex.tsx?raw'
import exportRaw from './fixtures/export.tsx?raw'
import nonTypeRaw from './fixtures/nonType.tsx?raw'
import inlineRaw from './fixtures/inline.tsx?raw'

const fixturePath = fileURLToPath(new URL('./fixtures', import.meta.url))

describe('transform', () => {
  it('should transform', () => {
    const code = singleRaw
    const id = path.resolve(fixturePath, 'single.tsx')
    const transformCode = transform(code, id)
    expect(transformCode).toMatchSnapshot()
  })
  it('should complex', () => {
    const code = complexRaw
    const id = path.resolve(fixturePath, 'complex.tsx')
    const transformCode = transform(code, id)
    expect(transformCode).toMatchSnapshot()
  })

  it('should export default', () => {
    const code = exportRaw
    const id = path.resolve(fixturePath, 'export.tsx')
    const transformCode = transform(code, id)
    expect(transformCode).toMatchSnapshot()
  })

  it('should nonType', () => {
    const code = nonTypeRaw
    const id = path.resolve(fixturePath, 'nonType.tsx')
    const transformCode = transform(code, id)
    expect(transformCode).toMatchSnapshot()
  })

  it('should inline', () => {
    const code = inlineRaw
    const id = path.resolve(fixturePath, 'inline.tsx')
    const transformCode = transform(code, id)
    expect(transformCode).toMatchSnapshot()
  })
})
