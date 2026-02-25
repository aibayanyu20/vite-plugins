import { describe, expect, it } from 'vitest'
import { transformVueSfc } from '../src'
import { fixtureDir } from './testUtils'

describe('vueResolveTypes options', () => {
  it('supports disabling props transform via options', () => {
    const id = `${fixtureDir}DisableProps.vue`
    const code = `<script setup lang="ts">
const emit = defineEmits<{ (e: 'change'): void }>()
const props = defineProps<{ a: string }>()
</script>`

    const result = transformVueSfc(code, id, { props: false, emits: true })
    expect(result).toBeTruthy()
    expect(result!.code).toContain(`defineEmits([\"change\"])`)
    expect(result!.code).toContain(`defineProps<{ a: string }>()`)
  })

  it('supports disabling emits transform via options', () => {
    const id = `${fixtureDir}DisableEmits.vue`
    const code = `<script setup lang="ts">
const emit = defineEmits<{ (e: 'change'): void }>()
const props = defineProps<{ a: string }>()
</script>`

    const result = transformVueSfc(code, id, { props: true, emits: false })
    expect(result).toBeTruthy()
    expect(result!.code).toContain(`defineEmits<{ (e: 'change'): void }>()`)
    expect(result!.code).toContain(`defineProps({`)
  })
})
