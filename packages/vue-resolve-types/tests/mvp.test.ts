import { describe, expect, it } from 'vitest'
import { transformVueSfc } from '../src'
import { fixtureDir } from './testUtils'

describe('vueResolveTypes MVP', () => {
  it('injects runtime props for local defineProps type', () => {
    const id = `${fixtureDir}LocalProps.vue`
    const code = `<script setup lang="ts">
interface Props {
  foo?: string
  count: number
}
const props = defineProps<Props>()
</script>
`

    const result = transformVueSfc(code, id)
    expect(result).toBeTruthy()
    expect(result!.code).toContain('defineProps({')
    expect(result!.code).toContain('foo: { type: String, required: false }')
    expect(result!.code).toContain('count: { type: Number, required: true }')
    expect(result!.code).not.toContain('defineProps<Props>()')
  })

  it('skips non-ts script setup', () => {
    const id = `${fixtureDir}Plain.vue`
    const code = `<script setup>
const props = defineProps()
</script>`

    expect(transformVueSfc(code, id)).toBeNull()
  })
})
