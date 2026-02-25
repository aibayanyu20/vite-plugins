import { describe, expect, it } from 'vitest'
import { transformVueSfc } from '../src'
import { fixtureDir, getCompiledEmitsSection } from './testUtils'

describe('vueResolveTypes emits', () => {
  it('injects runtime emits from function overload type declaration', () => {
    const id = `${fixtureDir}EmitsFn.vue`
    const code = `<script setup lang="ts">
const emit = defineEmits<{
  (e: 'change', value: string): void
  (e: 'update:modelValue', value: number): void
}>()
</script>`

    const result = transformVueSfc(code, id)
    expect(result).toBeTruthy()
    expect(result!.code).toContain(`defineEmits([\"change\",\"update:modelValue\"])`)
    expect(getCompiledEmitsSection(result!.code, id)).toBe(getCompiledEmitsSection(code, id))
  })

  it('injects runtime emits from object type declaration', () => {
    const id = `${fixtureDir}EmitsObj.vue`
    const code = `<script setup lang="ts">
const emit = defineEmits<{
  change: [value: string]
  submit: []
}>()
</script>`

    const result = transformVueSfc(code, id)
    expect(result).toBeTruthy()
    expect(result!.code).toContain(`defineEmits([\"change\",\"submit\"])`)
    expect(getCompiledEmitsSection(result!.code, id)).toBe(getCompiledEmitsSection(code, id))
  })
})
