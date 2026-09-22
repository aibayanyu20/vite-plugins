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

  it('ignoreTypes keeps matching bases out of runtime props', () => {
    const id = `${fixtureDir}IgnoreTypes.vue`
    const code = `<script setup lang="ts">
interface TabsEmitsProps { onChange?: () => void }
interface Base { value?: string }
interface Props extends Base, TabsEmitsProps { extra?: boolean }
defineProps<Props>()
</script>`

    // the interface source text stays in the output, so only inspect the
    // generated runtime declaration
    const runtimeProps = (out: string) => out.slice(out.indexOf('defineProps({'))

    const plain = runtimeProps(transformVueSfc(code, id)!.code)
    expect(plain).toContain('onChange: { type: Function')

    const ignored = runtimeProps(transformVueSfc(code, id, { ignoreTypes: [/EmitsProps$/] })!.code)
    expect(ignored).not.toContain('onChange')
    expect(ignored).toContain('extra: { type: Boolean')
    expect(ignored).toContain('value: { type: String')
  })
})
