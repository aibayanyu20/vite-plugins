import { createFilter } from 'vite'
import { describe, expect, it } from 'vitest'

describe('test filter', () => {
  it('test', () => {
    const filter = createFilter([/\.vue$/, /\.[jt]sx$/])
    const id = `ss/test.jsx`
    expect(filter(id)).toBe(true)
  })
  it('exclude test', () => {
    const file = 'aaa/src/components/ViewTitle.vue?vue&type=script&lang.ts'
    const filter = createFilter([/\.vue$/, /\.[jt]sx$/], [/node_modules/, 'src/components/ViewTitle.vue'])
    const bool = filter(file)
    expect(bool).toBe(false)
  })
})
