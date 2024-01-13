import path from 'node:path'
import { describe, expect, it } from 'vitest'
import generate from '@babel/generator'
import { createContext } from '../src/utils/context'
import { findComponents } from '../src/parser'
import { resolveProps } from '../src/resolves/props'
import { checkMergeDefaults } from '../src/utils/checkMergeDefaults'
import { basePath } from './fixtures/constant'
import code1Raw from './fixtures/exportConst/code1.tsx?raw'
import code2Raw from './fixtures/exportConst/code2.tsx?raw'
import code3Raw from './fixtures/exportConst/code3.tsx?raw'
import code4Raw from './fixtures/exportConst/code4.tsx?raw'

describe('exportConst', () => {
  it('code1', () => {
    const code = compiler(code1Raw, 'code1.tsx')
    expect(code).toMatchInlineSnapshot(`
      "import { defineComponent } from 'vue';
      export interface Props {
        name: string;
      }
      export const Code1 = defineComponent({
        props: {
          name: {
            type: String,
            required: true,
            default: '1'
          }
        },
        setup(props: Props = {
          name: '1'
        }) {
          return () => <div>Code1</div>;
        }
      });"
    `)
  })

  it('code2', () => {
    const code = compiler(code2Raw, 'code2.tsx')
    expect(code).toMatchInlineSnapshot(`
      "import { mergeDefaults as _mergeDefaults } from 'vue';
      import { defineComponent } from 'vue';
      export interface Props {
        a?: string;
      }
      export const defaultProps: Props = {
        a: '1'
      };
      export const Code2 = defineComponent({
        props: /*#__PURE__*/_mergeDefaults({
          a: {
            type: String,
            required: false
          }
        }, defaultProps),
        setup(props: Props = defaultProps) {
          return () => {
            return <div>Code2</div>;
          };
        }
      });
      export const Code21 = defineComponent({
        props: /*#__PURE__*/_mergeDefaults({
          a: {
            type: String,
            required: false
          }
        }, defaultProps),
        setup(props: Props = defaultProps) {
          return () => {
            return <div>Code2</div>;
          };
        }
      });"
    `)
  })

  it('code3', () => {
    const code = compiler(code3Raw, 'code3.tsx')
    expect(code).toMatchInlineSnapshot(`
      "import { mergeDefaults as _mergeDefaults } from 'vue';
      import { defineComponent } from 'vue';
      import type { Props } from './interface';
      import { defaultProps } from './interface';
      export const Code2 = defineComponent({
        props: /*#__PURE__*/_mergeDefaults({
          a: {
            type: String,
            required: false
          }
        }, defaultProps),
        setup(props: Props = defaultProps) {
          return () => {
            return <div>Code2</div>;
          };
        }
      });
      export const Code21 = defineComponent({
        props: /*#__PURE__*/_mergeDefaults({
          a: {
            type: String,
            required: false
          }
        }, defaultProps),
        setup(props: Props = defaultProps) {
          return () => {
            return <div>Code2</div>;
          };
        }
      });"
    `)
  })

  it('code4', () => {
    const code = compiler(code4Raw, 'code4.tsx')
    expect(code).toMatchInlineSnapshot(`
      "import { mergeDefaults as _mergeDefaults } from 'vue';
      import { defineComponent } from 'vue';
      import type { Props, Props1 } from './interface';
      import { defaultProps, defaultProps1 } from './interface';
      export const Code2 = defineComponent({
        props: /*#__PURE__*/_mergeDefaults({
          a: {
            type: String,
            required: false
          }
        }, defaultProps),
        setup(props: Props = defaultProps) {
          return () => {
            return <div>Code2</div>;
          };
        }
      });
      export default defineComponent({
        props: /*#__PURE__*/_mergeDefaults({
          b: {
            type: String,
            required: false
          }
        }, defaultProps1),
        setup(props: Props1 = defaultProps1) {
          return () => {
            return <div>Code2</div>;
          };
        }
      });"
    `)
  })
})

function compiler(raw: string, id: string) {
  const ctx = createContext(raw, path.resolve(basePath, `exportConst/${id}`))
  const expression = findComponents(ctx.ast)
  for (const callExpression of expression)
    resolveProps(callExpression, ctx)
  checkMergeDefaults(ctx)

  return generate(ctx.ast).code
}
