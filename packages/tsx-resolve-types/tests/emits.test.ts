import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { basePath } from './fixtures/constant'
import { runTransformFixture } from './transformHelper'
import inlineRaw from './fixtures/emits/inline.tsx?raw'
import funcRaw from './fixtures/emits/func.tsx?raw'

describe('emits', () => {
  it('inline', () => {
    const code = compiler(inlineRaw, 'inline.tsx')
    expect(code).toMatchSnapshot()
  })

  it('func', () => {
    const code = compiler(funcRaw, 'func.tsx')
    expect(code).toMatchSnapshot()
  })
})
function compiler(raw: string, id: string) {
  return runTransformFixture(raw, path.resolve(basePath, `emits/${id}`), {
    props: false,
  })
}
