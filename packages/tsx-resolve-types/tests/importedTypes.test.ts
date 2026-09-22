import path from 'node:path'
import { invalidateTypeCache } from '@v-c/resolve-types'
import { beforeEach, describe, expect, it } from 'vitest'
import { basePath } from './fixtures/constant'
import inlineRaw from './fixtures/importedTypes/inline.tsx?raw'
import reexportIndexedRaw from './fixtures/importedTypes/reexportIndexed.tsx?raw'
import wholeRaw from './fixtures/importedTypes/whole.tsx?raw'
import { runTransformFixture } from './transformHelper'

const dir = path.join(basePath, 'importedTypes')
const fixture = (name: string) => path.join(dir, name)

function compile(raw: string, name: string) {
  return runTransformFixture(raw, fixture(name), { defaultPropsToUndefined: true })
}

describe('types imported from other files', () => {
  beforeEach(() => {
    // Start every test from a cold file-scope cache, like the first module a
    // build transforms.
    for (const f of ['types.ts', 'index.ts'])
      invalidateTypeCache(fixture(f))
  })

  it('resolves imported aliases referenced from an inline type literal', () => {
    const code = compile(inlineRaw, 'inline.tsx')
    expect(code).toContain(`cap: { type: String, required: true }`)
    expect(code).toContain(`size: { type: Number, required: true }`)
    expect(code).toMatch(/label: \{ type: String, required: false\s*,\s*default: undefined\s*\}/)
  })

  it('resolves Props[\'key\'] through a re-export on a cold cache', () => {
    const code = compile(reexportIndexedRaw, 'reexportIndexed.tsx')
    expect(code).toContain(`cap: { type: String, required: true }`)
    expect(code).toContain(`size: { type: Number, required: true }`)
  })

  it('does not depend on which module was transformed first', () => {
    const cold = compile(reexportIndexedRaw, 'reexportIndexed.tsx')

    for (const f of ['types.ts', 'index.ts'])
      invalidateTypeCache(fixture(f))
    compile(wholeRaw, 'whole.tsx')
    const warm = compile(reexportIndexedRaw, 'reexportIndexed.tsx')

    expect(warm).toBe(cold)
    expect(warm).toContain(`cap: { type: String, required: true }`)
  })
})
