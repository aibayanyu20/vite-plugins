import { describe, expect, it } from 'vitest'
import { createAst } from '../src/parser'
import { addProps } from '../src/parser/addProps'
import exportRaw from './fixtures/export.tsx?raw'

describe('addProps', () => {
  it('should work', () => {
    const ast = createAst(exportRaw)
    const code = addProps(ast, ['a', 'b', 'c'])
    expect(code).toMatchInlineSnapshot(`
      "export default defineComponent<CommonProps>({
        props: [\\"a\\", \\"b\\", \\"c\\"],
        setup() {
          return () => {
            return <div></div>;
          };
        }
      });"
    `)
  })

  it('should export', () => {
    const code = `Complex3 = defineComponent({
  setup(_props: CommonProps & ComplexProps) {
    return () => {
      return <div></div>
    }
  },
})`

    const ast = createAst(code)
    const code2 = addProps(ast, ['a', 'b', 'c'])
    expect(code2).toMatchInlineSnapshot(`
      "Complex3 = defineComponent({
        props: [\\"a\\", \\"b\\", \\"c\\"],
        setup(_props: CommonProps & ComplexProps) {
          return () => {
            return <div></div>;
          };
        }
      })"
    `)
  })
})
