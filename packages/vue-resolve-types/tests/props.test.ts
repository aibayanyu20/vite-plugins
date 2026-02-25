import { describe, expect, it } from 'vitest'
import { transformVueSfc } from '../src'
import { compileSfc, fixtureDir } from './testUtils'

describe('vueResolveTypes props', () => {
  it('injects runtime props for imported types', () => {
    const id = `${fixtureDir}ImportedProps.vue`
    const code = `<script setup lang="ts">
import type { ImportedProps } from './imported'

const props = defineProps<ImportedProps>()
</script>
`

    const result = transformVueSfc(code, id)
    expect(result).toBeTruthy()
    expect(result!.code).toContain('label: { type: String, required: true }')
    expect(result!.code).toContain('disabled: { type: Boolean, required: false }')
  })

  it('keeps destructure defaults for vue compiler to handle (no duplicate default injection)', () => {
    const id = `${fixtureDir}DestructureDefaults.vue`
    const code = `<script setup lang="ts">
const { a, b = '2' } = defineProps<{ a: string, b?: string }>()
console.log(a, b)
</script>`

    const result = transformVueSfc(code, id)
    expect(result).toBeTruthy()
    expect(result!.code).toContain(`defineProps({`)
    expect(result!.code).toContain(`b: { type: String, required: false }`)
    expect(result!.code).not.toContain(`default: '2'`)

    const compiled = compileSfc(result!.code, id)
    expect(compiled).toContain(`mergeDefaults as _mergeDefaults`)
    expect(compiled).toContain(`b: '2'`)
    expect(compiled).toContain(`b: { type: String, required: false }`)
    expect(compiled.match(/b: '2'/g)?.length ?? 0).toBe(1)
  })

  it('supports destructure alias defaults and matches vue compiled behavior', () => {
    const id = `${fixtureDir}DestructureAlias.vue`
    const code = `<script setup lang="ts">
const { a: aa, b = '2', c: cc = 1 } = defineProps<{ a: string, b?: string, c?: number }>()
console.log(aa, b, cc)
</script>`

    const result = transformVueSfc(code, id)
    expect(result).toBeTruthy()
    expect(result!.code).toContain(`a: { type: String, required: true }`)
    expect(result!.code).toContain(`b: { type: String, required: false }`)
    expect(result!.code).toContain(`c: { type: Number, required: false }`)
    expect(result!.code).not.toContain(`default: '2'`)
    expect(result!.code).not.toContain(`default: 1`)

    const compiled = compileSfc(result!.code, id)
    expect(compiled).toContain(`mergeDefaults as _mergeDefaults`)
    expect(compiled).toContain(`b: '2'`)
    expect(compiled).toContain(`c: 1`)
    expect(compiled.match(/b: '2'/g)?.length ?? 0).toBe(1)
    expect(compiled.match(/c: 1/g)?.length ?? 0).toBe(1)
  })
})
