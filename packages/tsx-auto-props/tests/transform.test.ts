import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { transform } from '../src/parser/transform'
import singleRaw from './fixtures/single.tsx?raw'

const fixturePath = fileURLToPath(new URL('./fixtures', import.meta.url))

describe('transform', () => {
  it('should transform', () => {
    const code = singleRaw
    const id = path.resolve(fixturePath, 'single.tsx')
    const transformCode = transform(code, id)
    expect(transformCode).toMatchSnapshot()
  })
})
