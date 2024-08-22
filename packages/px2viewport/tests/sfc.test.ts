import { describe, expect, it } from 'vitest'
import { inlineTransform } from '../src/inlineTransform'
import { sfcCode } from './fixtrures/sfc-code'

describe('sfc', () => {
  it('should work', () => {
    const code = inlineTransform(sfcCode)
    expect(code).toMatchInlineSnapshot(`
      "const __sfc__ = {};
      import { createElementVNode as _createElementVNode, createTextVNode as _createTextVNode, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue";
      function render(_ctx, _cache) {
        return _openBlock(), _createElementBlock("div", null, _cache[0] || (_cache[0] = [_createTextVNode(" 我的 "), _createElementVNode("div", {
          class: "bg-red",
          style: {
            "width": "13.33333vw",
            "height": "13.33333vw"
          }
        }, " Test ", -1 /* HOISTED */)]));
      }

      __sfc__.render = render;
      __sfc__.__file = "src/App.vue";
      export default __sfc__;"
    `)
  })
})
