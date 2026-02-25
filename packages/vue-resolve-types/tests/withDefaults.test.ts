import { describe, expect, it } from 'vitest'
import { transformVueSfc } from '../src'
import { fixtureDir, getCompiledPropsSection } from './testUtils'

describe('vueResolveTypes withDefaults', () => {
  it('replaces withDefaults(type-defineProps) with runtime defineProps and preserves vue runtime result', () => {
    const id = `${fixtureDir}WithDefaults.vue`
    const code = `<script setup lang="ts">
interface Props {
  size?: number
}
const props = withDefaults(defineProps<Props>(), {
  size: 12,
})
</script>
`

    const result = transformVueSfc(code, id)

    expect(result).toBeTruthy()
    expect(result!.code).toContain('defineProps({')
    expect(result!.code).toContain(`default: 12`)
    expect(result!.code).not.toContain('withDefaults(')
    expect(getCompiledPropsSection(result!.code, id)).toBe(getCompiledPropsSection(code, id))
  })

  it('supports withDefaults using imported defaults and injects mergeDefaults helper import', () => {
    const id = `${fixtureDir}WithDefaultsVariable.vue`
    const code = `<script setup lang="ts">
import { defaults } from './defaults'

interface Props {
  a?: string
  b?: string
}
const props = withDefaults(defineProps<Props>(), defaults)
</script>`

    const result = transformVueSfc(code, id)
    expect(result).toBeTruthy()
    expect(result!.code).toContain(`import { mergeDefaults as _mergeDefaults } from 'vue'`)
    expect(result!.code).toContain(`defineProps(/*@__PURE__*/_mergeDefaults(`)
    expect(result!.code).not.toContain(`withDefaults(`)
    expect(getCompiledPropsSection(result!.code, id)).toBe(getCompiledPropsSection(code, id))
  })
})
