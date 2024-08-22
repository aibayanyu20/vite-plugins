export const sfcCode = `const __sfc__ = {};
import { createElementVNode as _createElementVNode, createTextVNode as _createTextVNode, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue"
function render(_ctx, _cache) {
  return (_openBlock(), _createElementBlock("div", null, _cache[0] || (_cache[0] = [
    _createTextVNode(" 我的 "),
    _createElementVNode("div", {
      class: "bg-red",
      style: {"width":"100px","height":"100px"}
    }, " Test ", -1 /* HOISTED */)
  ])))
}
__sfc__.render = render
__sfc__.__file = "src/App.vue"
export default __sfc__`
