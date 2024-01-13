import path from 'node:path'
import { describe, expect, it } from 'vitest'
import generate from '@babel/generator'
import { findComponents } from '../src/parser'
import { createContext } from '../src/utils/context'
import { resolveProps } from '../src/resolves/props'
import { checkMergeDefaults } from '../src/utils/checkMergeDefaults'
import codeRaw from './fixtures/exportDefault/code.tsx?raw'
import code1Raw from './fixtures/exportDefault/code1.tsx?raw'
import code2Raw from './fixtures/exportDefault/code2.tsx?raw'
import code3Raw from './fixtures/exportDefault/code3.tsx?raw'
import { basePath } from './fixtures/constant'

describe('findComponents', () => {
  it('export default', () => {
    const ctx = createContext(codeRaw, path.resolve(basePath, 'exportDefault/basic.tsx'))
    const expression = findComponents(ctx.ast)
    for (const callExpression of expression)
      resolveProps(callExpression, ctx)
    const code = generate(ctx.ast).code
    expect(code).toMatchInlineSnapshot(`
      "import { defineComponent } from 'vue';
      export interface Props {
        name: string;
      }
      export default defineComponent({
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
          return () => <div>basic</div>;
        }
      });"
    `)
  })

  it('code1', () => {
    const ctx = createContext(code1Raw, path.resolve(basePath, 'exportDefault/code1.tsx'))
    const expression = findComponents(ctx.ast)
    for (const callExpression of expression)
      resolveProps(callExpression, ctx)
    const code = generate(ctx.ast).code
    expect(code).toMatchInlineSnapshot(`
      "import { defineComponent } from 'vue';
      export interface Props {
        name?: string;
      }
      export default defineComponent({
        props: {
          name: {
            type: String,
            required: false
          }
        },
        setup(props: Props) {
          return () => <div>basic</div>;
        }
      });"
    `)
  })

  it('code2', () => {
    const ctx = createContext(`${code2Raw}`, path.resolve(basePath, 'exportDefault/code2.tsx'))
    const expression = findComponents(ctx.ast)
    for (const callExpression of expression)
      resolveProps(callExpression, ctx)
    checkMergeDefaults(ctx)
    const code = generate(ctx.ast).code
    expect(code).toMatchInlineSnapshot(`
      "import { mergeDefaults as _mergeDefaults } from 'vue';
      import { defineComponent } from 'vue';
      export interface Props {
        name?: string;
      }
      const defaultProps: Props = {
        name: '2'
      };
      export default defineComponent({
        props: /*#__PURE__*/_mergeDefaults({
          name: {
            type: String,
            required: false
          }
        }, defaultProps),
        setup(props: Props = defaultProps) {
          return () => <div>basic</div>;
        }
      });"
    `)
  })

  it('code3', () => {
    const ctx = createContext(`${code3Raw}`, path.resolve(basePath, 'exportDefault/code3.tsx'))
    const expression = findComponents(ctx.ast)
    for (const callExpression of expression)
      resolveProps(callExpression, ctx)
    checkMergeDefaults(ctx)
    const code = generate(ctx.ast).code
    expect(code).toMatchInlineSnapshot(`
      "import { mergeDefaults as _mergeDefaults } from 'vue';
      import { defineComponent } from 'vue';
      import type { Props } from './interface';
      import { defaultProps } from './interface';
      export default defineComponent({
        props: /*#__PURE__*/_mergeDefaults({
          a: {
            type: String,
            required: true
          }
        }, defaultProps),
        setup(_props: Props = defaultProps) {
          return () => <div>Code3</div>;
        }
      });"
    `)
  })
})
