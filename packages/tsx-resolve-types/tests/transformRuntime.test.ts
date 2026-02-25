import path from 'node:path'
import { describe, expect, it } from 'vitest'
import ts from 'typescript'
import { registerTS } from '@v-c/resolve-types'
import { transform } from '../src/transform'
import { GraphContext } from '../src/utils/graphContext'
import { basePath } from './fixtures/constant'
import propsRaw from './fixtures/types/code3.tsx?raw'
import emitsRaw from './fixtures/emits/inline.tsx?raw'

registerTS(() => ts)

function runTransform(code: string, id: string, options?: Parameters<typeof transform>[3]) {
  const res = transform(code, id, new GraphContext(), options)
  return typeof res === 'string' ? res : res.code
}

describe('transform runtime path', () => {
  it('injects props using magic-string runtime path', () => {
    const code = runTransform(propsRaw, path.resolve(basePath, 'types/code3.tsx'))
    expect(code).toContain('props: /*@__PURE__*/_mergeDefaults(')
    expect(code).toContain("import { mergeDefaults as _mergeDefaults } from 'vue';")
  })

  it('injects emits using magic-string runtime path', () => {
    const code = runTransform(emitsRaw, path.resolve(basePath, 'emits/inline.tsx'))
    expect(code).toContain('emits:')
  })

  it('adds undefined defaults selectively and skips required props', () => {
    const code = runTransform(`
import { defineComponent } from 'vue'

export default defineComponent((_props: {
  req: string
  optStr?: string
  optNum?: number
  optBool?: boolean
}) => {
  return () => <div></div>
})
`, path.resolve(basePath, 'runtime/selective-default-undefined.tsx'), {
      emits: false,
      defaultPropsToUndefined: ['String'],
    })

    expect(code).toMatch(/optStr:\s*\{[^}]*type:\s*String[^}]*default:\s*undefined/)
    expect(code).not.toMatch(/req:\s*\{[^}]*default:\s*undefined/)
    expect(code).not.toMatch(/optNum:\s*\{[^}]*default:\s*undefined/)
    expect(code).not.toMatch(/optBool:\s*\{[^}]*default:\s*undefined/)
  })

  it('does not inject an extra comma when defineComponent has a trailing comma', () => {
    const code = runTransform(`
import { defineComponent } from 'vue'

export default defineComponent((_props: { foo?: string }) => {
  return () => <div></div>
},)
`, path.resolve(basePath, 'runtime/trailing-comma.tsx'), {
      emits: false,
      defaultPropsToUndefined: true,
    })

    expect(code).not.toContain(',, { props')
    expect(code).not.toContain(',\n, { props')
    expect(code).toContain('}, { props:')
    expect(code).toContain('foo: { type: String, required: false')
  })

  it('injects props for Omit<T, K> with interface extends and existing options (Breadcrumb-like)', () => {
    const code = runTransform(`
import { defineComponent } from 'vue'

type Key = string | number

interface SeparatorType {
  key?: Key
}

interface BreadcrumbItemProps extends SeparatorType {
  header?: string | number | boolean | null | object
  showArrow?: boolean
}

export default defineComponent<Omit<BreadcrumbItemProps, 'key'>>(
  (props) => {
    return () => <div>{props.header}</div>
  },
  {
    name: 'ABreadcrumbItem',
    inheritAttrs: false,
  },
)
`, path.resolve(basePath, 'runtime/breadcrumb-omit-extends.tsx'), {
      emits: false,
      defaultPropsToUndefined: true,
    })

    expect(code).toContain('props:')
    expect(code).toContain('header:')
    expect(code).toContain('showArrow:')
    expect(code).not.toContain('key:')
    expect(code).not.toContain(',\n, { props')
  })
})
