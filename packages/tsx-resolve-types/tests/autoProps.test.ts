import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { basePath } from './fixtures/constant'
import { runTransformFixture } from './transformHelper'
import complexRaw from './fixtures/autoProps/complex.tsx?raw'
import defaultsRaw from './fixtures/autoProps/defaults.tsx?raw'
import exportRaw from './fixtures/autoProps/export.tsx?raw'
import genericRaw from './fixtures/autoProps/generic.tsx?raw'
import inlineRaw from './fixtures/autoProps/inline.tsx?raw'
import libRaw from './fixtures/autoProps/lib.tsx?raw'
import nonTyperRaw from './fixtures/autoProps/nonType.tsx?raw'
import renderRaw from './fixtures/autoProps/render.tsx?raw'
import singleRaw from './fixtures/autoProps/single.tsx?raw'

describe('autoProps', () => {
  it('complex', () => {
    const code = compiler(complexRaw, 'complex.tsx')
    expect(code).toMatchSnapshot()
  })

  it('defaults', () => {
    const code = compiler(defaultsRaw, 'defaults.tsx')
    expect(code).toMatchSnapshot()
  })

  it('export', () => {
    const code = compiler(exportRaw, 'export.tsx')
    expect(code).toMatchSnapshot()
  })

  // it('extra', () => {
  //   const code = compiler(extraRaw, 'extra.tsx')
  //   expect(code).toMatchSnapshot()
  // })

  it('generic', () => {
    const code = compiler(genericRaw, 'generic.tsx')
    expect(code).toMatchSnapshot()
  })

  it('inline', () => {
    const code = compiler(inlineRaw, 'inline.tsx')
    expect(code).toMatchSnapshot()
  })

  it('lib', () => {
    const code = compiler(libRaw, 'lib.tsx')
    expect(code).toMatchSnapshot()
  })

  it('nonType', () => {
    const code = compiler(nonTyperRaw, 'nonType.tsx')
    expect(code).toMatchSnapshot()
  })

  it('render', () => {
    const code = compiler(renderRaw, 'render.tsx')
    expect(code).toMatchSnapshot()
  })

  it('single', () => {
    const code = compiler(singleRaw, 'single.tsx')
    expect(code).toMatchSnapshot()
  })
})

function compiler(raw: string, id: string, withUndefined = false) {
  return runTransformFixture(raw, path.resolve(basePath, `autoProps/${id}`), {
    emits: false,
    defaultPropsToUndefined: withUndefined,
  })
}
