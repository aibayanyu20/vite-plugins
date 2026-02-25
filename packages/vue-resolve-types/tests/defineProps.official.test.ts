import { describe, expect, it } from 'vitest'
import { transformVueSfc } from '../src'
import { expectCompiledPropsParity, fixtureDir } from './testUtils'

function run(code: string, filename: string) {
  const id = `${fixtureDir}${filename}`
  const result = transformVueSfc(code, id)
  expect(result).toBeTruthy()
  return { id, result: result! }
}

describe('defineProps (official-inspired, type->runtime only)', () => {
  it('complex inline type runtime inference', () => {
    const code = `<script setup lang="ts">
interface Test {}
type Alias = number[]
defineProps<{
  string: string
  number: number
  boolean: boolean
  object: object
  objectLiteral: { a: number }
  fn: (n: number) => void
  functionRef: Function
  objectRef: Object
  dateTime: Date
  array: string[]
  tuple: [number, number]
  set: Set<string>
  literal: 'foo'
  optional?: any
  recordRef: Record<string, null>
  interface: Test
  alias: Alias
  method(): void
  symbol: symbol
  union: string | number
  literalUnionMixed: 'foo' | 1 | boolean
  objectOrFn: { (): void; foo: string }
}>()
</script>`
    const { id, result } = run(code, 'DefinePropsComplex.vue')
    expect(result.code).toContain(`string: { type: String, required: true }`)
    expect(result.code).toContain(`number: { type: Number, required: true }`)
    expect(result.code).toContain(`boolean: { type: Boolean, required: true }`)
    expect(result.code).toContain(`object: { type: Object, required: true }`)
    expect(result.code).toContain(`tuple: { type: Array, required: true }`)
    expect(result.code).toContain(`set: { type: Set, required: true }`)
    expect(result.code).toContain(`optional: { type: null, required: false }`)
    expect(result.code).toContain(`union: { type: [String, Number], required: true }`)
    expect(result.code).toContain(`literalUnionMixed: { type: [String, Number, Boolean], required: true }`)
    expect(result.code).toContain(`objectOrFn: { type: [Function, Object], required: true }`)
    expectCompiledPropsParity(result.code, code, id)
  })

  it('interface / extends / intersection / exported alias cases', () => {
    const cases = [
      [`<script setup lang="ts">
interface Props { x?: number }
defineProps<Props>()
</script>`, 'PropsInterface.vue'],
      [`<script lang="ts">
interface Foo { x?: number }
</script>
<script setup lang="ts">
interface Bar extends Foo { y?: number }
interface Props extends Bar { z: number; y: string }
defineProps<Props>()
</script>`, 'PropsExtendsInterface.vue'],
      [`<script setup lang="ts">
type Foo = { x?: number }
type Bar = { y: string }
defineProps<Foo & Bar>()
</script>`, 'PropsIntersection.vue'],
      [`<script setup lang="ts">
export type Props = { x?: number }
defineProps<Props>()
</script>`, 'PropsExportedAlias.vue'],
      [`<script lang="ts">
export interface Props { x?: number }
</script>
<script setup lang="ts">
defineProps<Props>()
</script>`, 'PropsNormalScriptExported.vue'],
    ] as const

    for (const [code, filename] of cases) {
      const { id, result } = run(code, filename)
      expect(result.code).toContain(`defineProps({`)
      expectCompiledPropsParity(result.code, code, id)
    }
  })

  it('withDefaults static object keeps vue parity', () => {
    const code = `<script setup lang="ts">
const props = withDefaults(defineProps<{
  foo?: string
  bar?: number
  baz: boolean
  qux?(): number
}>(), {
  foo: 'hi',
  qux() { return 1 }
})
</script>`

    const { id, result } = run(code, 'PropsWithDefaultsStatic.vue')
    expect(result.code).toContain(`default: 'hi'`)
    expect(result.code).toContain(`default() { return 1 }`)
    expect(result.code).not.toContain(`withDefaults(`)
    expectCompiledPropsParity(result.code, code, id)
  })

  it('withDefaults dynamic/reference/spread/object-method parity', () => {
    const cases = [
      [`<script setup lang="ts">
import { defaults } from './defaults'
const props = withDefaults(defineProps<{ foo?: string; bar?: number; baz: boolean }>(), defaults)
</script>`, 'PropsWithDefaultsRef.vue'],
      [`<script setup lang="ts">
import { defaults } from './defaults'
const props = withDefaults(defineProps<{ foo?: string; bar?: number; baz: boolean }>(), { ...defaults })
</script>`, 'PropsWithDefaultsSpread.vue'],
      [`<script setup lang="ts">
const props = withDefaults(defineProps<{ foo?: () => 'string' }>(), {
  ['fo' + 'o']() { return 'foo' }
})
</script>`, 'PropsWithDefaultsDynamicMethod.vue'],
    ] as const

    for (const [code, filename] of cases) {
      const { id, result } = run(code, filename)
      expect(result.code).toContain(`_mergeDefaults`)
      expect(result.code).toContain(`import { mergeDefaults as _mergeDefaults } from 'vue'`)
      expectCompiledPropsParity(result.code, code, id)
    }
  })

  it('enum runtime inference parity', () => {
    const cases = [
      [`<script setup lang="ts">
const enum Foo { A = 123 }
defineProps<{ foo: Foo }>()
</script>`, `type: Number`],
      [`<script setup lang="ts">
const enum Foo { A = '123' }
defineProps<{ foo: Foo }>()
</script>`, `type: String`],
      [`<script setup lang="ts">
const enum Foo { A = '123', B = 123 }
defineProps<{ foo: Foo }>()
</script>`, `type: [String, Number]`],
    ] as const

    cases.forEach(([code, expected], index) => {
      const { id, result } = run(code, `PropsEnum${index}.vue`)
      expect(result.code).toContain(expected)
      expectCompiledPropsParity(result.code, code, id)
    })
  })

  it('escapes special symbol prop names', () => {
    const code = `<script setup lang="ts">
defineProps<{
  'spa ce': unknown
  'co:lon': unknown
  'back\\\\slash': unknown
  "single'quote": unknown
}>()
</script>`
    const { id, result } = run(code, 'PropsSpecialSymbols.vue')
    expect(result.code).toContain(`"spa ce": { type: null, required: true }`)
    expect(result.code).toContain(`"co:lon": { type: null, required: true }`)
    expect(result.code).toContain(`"back\\\\slash": { type: null, required: true }`)
    expect(result.code).toContain(`"single'quote": { type: null, required: true }`)
    expectCompiledPropsParity(result.code, code, id)
  })

  it('throws for mixed type and runtime args', () => {
    const code = `<script setup lang="ts">
defineProps<{ foo: string }>({ foo: String })
</script>`
    expect(() => transformVueSfc(code, `${fixtureDir}PropsMixedArgs.vue`)).toThrow(
      `defineProps() cannot accept both type and non-type arguments`,
    )
  })
})
