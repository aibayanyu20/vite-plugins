import path from 'node:path'
import { describe, expect, it } from 'vitest'
import generate from '@babel/generator'
import { createContext } from '../src/utils/context'
import { findComponents } from '../src/parser'
import { resolveProps } from '../src/resolves/props'
import { checkMergeDefaults } from '../src/utils/checkMergeDefaults'
import { basePath } from './fixtures/constant'
import rawCode1 from './fixtures/types/code1.tsx?raw'
import rawCode2 from './fixtures/types/code2.tsx?raw'
import rawCode3 from './fixtures/types/code3.tsx?raw'

describe('types', () => {
  it('code1', () => {
    const code = compiler(rawCode1, 'code1.tsx')
    expect(code).toMatchInlineSnapshot(`
      "import { mergeDefaults as _mergeDefaults } from 'vue';
      import { defineComponent } from 'vue';
      interface Props {
        a?: string;
      }
      const defaultProps = {
        a: 'a'
      };
      export const Code = defineComponent<Props>({
        props: /*@__PURE__*/_mergeDefaults({
          a: {
            type: String,
            required: false
          }
        }, defaultProps),
        setup(props) {
          return () => {
            return <div>{props.a}</div>;
          };
        }
      });
      export default defineComponent<Props>({
        props: /*@__PURE__*/_mergeDefaults({
          a: {
            type: String,
            required: false
          }
        }, defaultProps),
        setup(props) {
          return () => {
            return <div>{props.a}</div>;
          };
        }
      });"
    `)
  })

  it('code2', () => {
    const code = compiler(rawCode2, 'code2.tsx')
    expect(code).toMatchInlineSnapshot(`
      "import { mergeDefaults as _mergeDefaults } from 'vue';
      import { defineComponent } from 'vue';
      interface Props {
        b?: string;
      }
      const defaultProps = {
        b: 'b',
        a: '1'
      };
      export const Code = defineComponent<{
        a: string;
      } & Props>({
        props: /*@__PURE__*/_mergeDefaults({
          a: {
            type: String,
            required: true
          },
          b: {
            type: String,
            required: false
          }
        }, defaultProps),
        setup(props) {
          return () => {
            return <div>code</div>;
          };
        }
      });"
    `)
  })

  it('code3', () => {
    const code = compiler(rawCode3, 'code3.tsx')
    expect(code).toMatchInlineSnapshot(`
      "import { mergeDefaults as _mergeDefaults } from 'vue';
      import { defineComponent } from 'vue';
      interface Props {
        name: string;
      }
      export const Code3 = defineComponent((props: Props) => {
        return () => <div>Code3</div>;
      }, {
        props: {
          name: {
            type: String,
            required: true,
            default: '1'
          }
        }
      });
      export const Code32 = defineComponent<Props>(props => {
        return () => <div>Code3</div>;
      }, {
        props: {
          name: {
            type: String,
            required: true,
            default: '1'
          }
        }
      });
      const props1 = {
        name: '1'
      };
      export const Code31 = defineComponent((props: Props) => {
        return () => <div>Code3</div>;
      }, {
        props: /*@__PURE__*/_mergeDefaults({
          name: {
            type: String,
            required: true
          }
        }, props1)
      });"
    `)
  })
})

function compiler(raw: string, id: string) {
  const ctx = createContext(raw, path.resolve(basePath, `types/${id}`))
  const expression = findComponents(ctx.ast)
  for (const callExpression of expression)
    resolveProps(callExpression, ctx)
  checkMergeDefaults(ctx)

  return generate(ctx.ast).code
}
