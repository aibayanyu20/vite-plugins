import path from 'node:path'
import { describe, expect, it } from 'vitest'
import codeRaw from './fixtures/exportDefault/code.tsx?raw'
import code1Raw from './fixtures/exportDefault/code1.tsx?raw'
import code2Raw from './fixtures/exportDefault/code2.tsx?raw'
import code3Raw from './fixtures/exportDefault/code3.tsx?raw'
import { basePath } from './fixtures/constant'
import { runTransformFixture } from './transformHelper'

describe('findComponents', () => {
  it('export default', () => {
    const code = runTransformFixture(codeRaw, path.resolve(basePath, 'exportDefault/basic.tsx'), {
      emits: false,
    })
    expect(code).toMatchInlineSnapshot(`
      "import { defineComponent } from 'vue'

      export interface Props {
        name: string
      }
      export default defineComponent({props: {
          name: { type: String, required: true, default: '1' }
        }, 
        setup(props: Props) {
          return () => <div>basic</div>
        },
      })
      "
    `)
  })
  it('export default with undefined', () => {
    const code = runTransformFixture(codeRaw, path.resolve(basePath, 'exportDefault/basic.tsx'), {
      emits: false,
      defaultPropsToUndefined: true,
    })
    expect(code).toMatchInlineSnapshot(`
      "import { defineComponent } from 'vue'

      export interface Props {
        name: string
      }
      export default defineComponent({props: {
          name: { type: String, required: true, default: '1' }
        }, 
        setup(props: Props) {
          return () => <div>basic</div>
        },
      })
      "
    `)
  })

  it('code1', () => {
    const code = runTransformFixture(code1Raw, path.resolve(basePath, 'exportDefault/code1.tsx'), {
      emits: false,
    })
    expect(code).toMatchInlineSnapshot(`
      "import { defineComponent } from 'vue'

      export interface Props {
        name?: string
      }
      export default defineComponent({props: {
          name: { type: String, required: false }
        }, 
        setup(props: Props) {
          return () => <div>basic</div>
        },
      })
      "
    `)
  })

  it('withUndefined', () => {
    const code = runTransformFixture(`${code2Raw}`, path.resolve(basePath, 'exportDefault/code2.tsx'), {
      emits: false,
      defaultPropsToUndefined: true,
    })
    expect(code).toMatchInlineSnapshot(`
      "import { mergeDefaults as _mergeDefaults } from 'vue';
      import { defineComponent } from 'vue'

      export interface Props {
        name?: string
      }

      const defaultProps: Props = {
        name: '2',
      }
      export default defineComponent({props: /*@__PURE__*/_mergeDefaults({
          name: { type: String, required: false , default: undefined}
        }, defaultProps), 
        setup(props: Props) {
          return () => <div>basic</div>
        },
      })
      "
    `)
  })

  it('code3', () => {
    const code = runTransformFixture(`${code3Raw}`, path.resolve(basePath, 'exportDefault/code3.tsx'), {
      emits: false,
    })
    expect(code).toMatchInlineSnapshot(`
      "import { mergeDefaults as _mergeDefaults } from 'vue';
      import { defineComponent } from 'vue'
      import type { Props } from './interface'
      import { defaultProps } from './interface'

      export default defineComponent({props: /*@__PURE__*/_mergeDefaults({
          a: { type: String, required: true }
        }, defaultProps), 
        setup(_props: Props) {
          return () => <div>Code3</div>
        },
      })
      "
    `)
  })
})
