import { describe, expect, it } from 'vitest'
import { transformVueSfc } from '../src'
import { compileSfc, fixtureDir, getCompiledPropsSection } from './testUtils'

describe('defineProps destructure (official-inspired, type->runtime only)', () => {
  it('default values with type declaration', () => {
    const id = `${fixtureDir}DestructureTypeDefaultsOfficial.vue`
    const code = `<script setup lang="ts">
const { foo = 1, bar = {}, func = () => {} } = defineProps<{ foo?: number, bar?: object, func?: () => any }>()
</script>`
    const result = transformVueSfc(code, id)
    expect(result).toBeTruthy()
    expect(result!.code).toContain(`foo: { type: Number, required: false }`)
    expect(result!.code).toContain(`bar: { type: Object, required: false }`)
    expect(result!.code).toContain(`func: { type: Function, required: false }`)
    const compiled = compileSfc(result!.code, id)
    expect(compiled).toContain(`mergeDefaults as _mergeDefaults`)
    expect(compiled).toContain(`foo: 1`)
    expect(compiled).toContain(`bar: () => ({})`)
    expect(compiled).toContain(`func: () => {}`)
    // Our transform converts type-based defineProps to runtime defineProps first,
    // so Vue later treats destructure defaults as runtime declaration defaults
    // and emits _mergeDefaults(...) instead of inlining defaults into each prop.
    // We only require semantic equivalence here.
    const originalProps = getCompiledPropsSection(code, id)
    expect(originalProps).toContain(`foo: { type: Number,required: false`)
    expect(originalProps).toContain(`default: 1`)
  })

  it('default values with string keys in type declaration', () => {
    const id = `${fixtureDir}DestructureStringKeyDefaultsOfficial.vue`
    const code = `<script setup lang="ts">
const { foo = 1, bar = 2, 'foo:bar': fooBar = 'foo-bar' } = defineProps<{ 
  "foo": number
  'bar': number
  'foo:bar': string
  "onUpdate:modelValue": (val: number) => void
}>()
</script>`
    const result = transformVueSfc(code, id)
    expect(result).toBeTruthy()
    expect(result!.code).toContain(`"foo:bar": { type: String, required: true }`)
    expect(result!.code).toContain(`"onUpdate:modelValue": { type: Function, required: true }`)
    const compiled = compileSfc(result!.code, id)
    expect(compiled).toContain(`"foo:bar": 'foo-bar'`)
    expect(compiled).toContain(`"onUpdate:modelValue": { type: Function`)
  })

  it('keeps ts instantiation expression behavior intact after transform', () => {
    const id = `${fixtureDir}DestructureTSInstantiation.vue`
    const code = `<script setup lang="ts">
type Foo = <T extends string | number>(data: T) => void
const { value } = defineProps<{ value: Foo }>()
const foo = value<123>
</script>`
    const result = transformVueSfc(code, id)
    expect(result).toBeTruthy()
    const compiled = compileSfc(result!.code, id)
    expect(compiled).toContain(`const foo = __props.value<123>`)
    expect(getCompiledPropsSection(result!.code, id)).toContain(`value: { type: Function,required: true }`)
  })
})
