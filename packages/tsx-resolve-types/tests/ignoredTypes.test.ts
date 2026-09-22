import path from 'node:path'
import { invalidateTypeCache } from '@v-c/resolve-types'
import { beforeEach, describe, expect, it } from 'vitest'
import { basePath } from './fixtures/constant'
import buttonRaw from './fixtures/ignoredTypes/button.tsx?raw'
import tabsRaw from './fixtures/ignoredTypes/tabs.tsx?raw'
import { runTransformFixture } from './transformHelper'

const dir = path.join(basePath, 'ignoredTypes')

function propKeys(code: string) {
  const block = code.slice(code.indexOf('props: {'))
  return [...block.matchAll(/^\s+(\w+): \{/gm)].map(m => m[1])
}

describe('ignoring types', () => {
  beforeEach(() => {
    invalidateTypeCache(path.join(dir, 'emits.d.ts'))
  })

  it('leaks emits members by default (the comment is gone from a .d.ts)', () => {
    const code = runTransformFixture(tabsRaw, path.join(dir, 'tabs.tsx'))
    expect(propKeys(code)).toEqual(['centered', 'activeKey', 'onChange'])
  })

  it('ignoreTypes option drops matching bases', () => {
    const code = runTransformFixture(tabsRaw, path.join(dir, 'tabs.tsx'), { ignoreTypes: [/EmitsProps$/] })
    expect(propKeys(code)).toEqual(['centered', 'activeKey'])
  })

  it('vueIgnore<T> in the d.ts needs no option', () => {
    const code = runTransformFixture(buttonRaw, path.join(dir, 'button.tsx'))
    expect(propKeys(code)).toEqual(['loading', 'activeKey'])
  })
})
