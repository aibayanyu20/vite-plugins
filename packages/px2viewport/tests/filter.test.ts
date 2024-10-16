import { createFilter } from 'vite'
import { describe, expect, it } from 'vitest'

describe('test filter', () => {
  it('test', () => {
    const filter = createFilter([/\.vue$/, /\.[jt]sx$/])
    const id = `ss/test.jsx`
    expect(filter(id)).toBe(true)
  })
})
