import { describe, expect, it } from 'vitest'
import { transformVueSfc } from '../src'
import { expectCompiledEmitsParity, fixtureDir } from './testUtils'

function run(code: string, filename: string) {
  const id = `${fixtureDir}${filename}`
  const result = transformVueSfc(code, id)
  expect(result).toBeTruthy()
  return { id, result: result! }
}

describe('defineEmits (official-inspired, type->runtime only)', () => {
  it('function style emits type', () => {
    const code = `<script setup lang="ts">
const emit = defineEmits<(e: 'foo' | 'bar') => void>()
</script>`
    const { id, result } = run(code, 'EmitsFunctionType.vue')
    expect(result.code).toContain(`defineEmits([\"foo\",\"bar\"])`)
    expectCompiledEmitsParity(result.code, code, id)
  })

  it('union function type / type literal call signatures / interface extends parity', () => {
    const cases = [
      [`<script setup lang="ts">
type Emits = ((e: 'foo' | 'bar') => void) | ((e: 'baz', id: number) => void)
const emit = defineEmits<Emits>()
</script>`, 'EmitsUnionFn.vue'],
      [`<script setup lang="ts">
const emit = defineEmits<{(e: 'foo' | 'bar'): void; (e: 'baz', id: number): void;}>()
</script>`, 'EmitsCallSignatures.vue'],
      [`<script setup lang="ts">
interface Base { (e: 'foo'): void }
interface Emits extends Base { (e: 'bar'): void }
const emit = defineEmits<Emits>()
</script>`, 'EmitsInterfaceExtends.vue'],
    ] as const

    for (const [code, filename] of cases) {
      const { id, result } = run(code, filename)
      expect(result.code).toContain(`defineEmits([`)
      expectCompiledEmitsParity(result.code, code, id)
    }
  })

  it('exported and normal-script type declarations parity', () => {
    const cases = [
      [`<script setup lang="ts">
export interface Emits { (e: 'foo' | 'bar'): void }
const emit = defineEmits<Emits>()
</script>`, 'EmitsExportedInterface.vue'],
      [`<script lang="ts">
export interface Emits { (e: 'foo' | 'bar'): void }
</script>
<script setup lang="ts">
const emit = defineEmits<Emits>()
</script>`, 'EmitsNormalScriptInterface.vue'],
      [`<script setup lang="ts">
export type Emits = (e: 'foo' | 'bar') => void
const emit = defineEmits<Emits>()
</script>`, 'EmitsExportedTypeAlias.vue'],
    ] as const

    cases.forEach(([code, filename]) => {
      const { id, result } = run(code, filename)
      expectCompiledEmitsParity(result.code, code, id)
    })
  })

  it('property syntax including string literal keys', () => {
    const cases = [
      [`<script setup lang="ts">
const emit = defineEmits<{ foo: [], bar: [] }>()
</script>`, `defineEmits([\"foo\",\"bar\"])`],
      [`<script setup lang="ts">
const emit = defineEmits<{ 'foo:bar': [] }>()
</script>`, `defineEmits([\"foo:bar\"])`],
    ] as const

    cases.forEach(([code, contains], index) => {
      const { id, result } = run(code, `EmitsPropertySyntax${index}.vue`)
      expect(result.code).toContain(contains)
      expectCompiledEmitsParity(result.code, code, id)
    })
  })

  it('type references in union are resolved', () => {
    const code = `<script setup lang="ts">
type BaseEmit = "change"
type Emit = "some" | "emit" | BaseEmit
const emit = defineEmits<{
  (e: Emit): void;
  (e: "another", val: string): void;
}>()
</script>`
    const { id, result } = run(code, 'EmitsTypeRefUnion.vue')
    expect(result.code).toContain(`"change"`)
    expect(result.code).toContain(`"another"`)
    expectCompiledEmitsParity(result.code, code, id)
  })

  it('throws for mixed type and runtime args', () => {
    const code = `<script setup lang="ts">
defineEmits<{}>({})
</script>`
    expect(() => transformVueSfc(code, `${fixtureDir}EmitsMixedArgs.vue`)).toThrow(
      `defineEmits() cannot accept both type and non-type arguments`,
    )
  })

  it('throws for mixed call signature and property syntax', () => {
    const code = `<script setup lang="ts">
defineEmits<{
  foo: []
  (e: 'hi'): void
}>()
</script>`
    expect(() => transformVueSfc(code, `${fixtureDir}EmitsMixedSyntax.vue`)).toThrow(
      `defineEmits() type cannot mixed call signature and property syntax`,
    )
  })
})
