export const testCode1 = `import { defineComponent as _defineComponent } from "vue";
import { ref } from "vue";
const _sfc_main = /* @__PURE__ */ _defineComponent({
  __name: "index",
  setup(__props, { expose: __expose }) {
    __expose();
    const msg = ref("S");
    const __returned__ = { msg };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
import { toDisplayString as _toDisplayString, normalizeStyle as _normalizeStyle, createElementVNode as _createElementVNode, createTextVNode as _createTextVNode, resolveComponent as _resolveComponent, withCtx as _withCtx, createVNode as _createVNode, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue";
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_van_button = _resolveComponent("van-button");
  return _openBlock(), _createElementBlock("div", null, [
    _createElementVNode("div", null, [
      _createElementVNode(
        "div",
        {
          style: _normalizeStyle([{ "width": "100px", "height": "100px", "background-color": "aqua" }, { fontSize: "12px" }]),
          class: "aaa"
        },
        _toDisplayString($setup.msg),
        1
        /* TEXT */
      ),
      _createVNode(_component_van_button, { block: "" }, {
        default: _withCtx(() => [
          _createTextVNode(" \u6D4B\u8BD5 ")
        ]),
        _: 1
        /* STABLE */
      })
    ])
  ]);
}
import "/Users/zhuzhengjian/workspace/puhua/mobile-project/src/runtime/views/home/index.vue?vue&type=style&index=0&lang.less";
_sfc_main.__hmrId = "60945987";
typeof __VUE_HMR_RUNTIME__ !== "undefined" && __VUE_HMR_RUNTIME__.createRecord(_sfc_main.__hmrId, _sfc_main);
export const _rerender_only = true;
import.meta.hot.accept((mod) => {
  if (!mod) return;
  const { default: updated, _rerender_only: _rerender_only2 } = mod;
  if (_rerender_only2) {
    __VUE_HMR_RUNTIME__.rerender(updated.__hmrId, updated.render);
  } else {
    __VUE_HMR_RUNTIME__.reload(updated.__hmrId, updated);
  }
});
import _export_sfc from "\\0plugin-vue:export-helper";
export default /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render], ["__file", "/Users/zhuzhengjian/workspace/puhua/mobile-project/src/runtime/views/home/index.vue"]]);`
export const testCode2 = `import { defineComponent as _defineComponent } from "vue";
import { ref } from "vue";
const _sfc_main = /* @__PURE__ */ _defineComponent({
  __name: "index",
  setup(__props, { expose: __expose }) {
    __expose();
    const msg = ref("S");
    const __returned__ = { msg };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
import { toDisplayString as _toDisplayString, createElementVNode as _createElementVNode, createTextVNode as _createTextVNode, resolveComponent as _resolveComponent, withCtx as _withCtx, createVNode as _createVNode, openBlock as _openBlock, createElementBlock as _createElementBlock, normalizeStyle as _normalizeStyle } from "vue";
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_van_button = _resolveComponent("van-button");
  return _openBlock(), _createElementBlock("div", null, [
    _createElementVNode("div", null, [
      _createElementVNode(
        "div",
        {
          style: _normalizeStyle([{ "width": "100px", "height": "100px", "background-color": "aqua" }, { fontSize: "12px" }]),
          class: "aaa"
        },
        _toDisplayString($setup.msg),
        1
        /* TEXT */
      ),
      _createVNode(_component_van_button, { block: "" }, {
        default: _withCtx(() => [
          _createTextVNode(" \u6D4B\u8BD5 ")
        ]),
        _: 1
        /* STABLE */
      })
    ])
  ]);
}
import "/Users/zhuzhengjian/workspace/puhua/mobile-project/src/runtime/views/home/index.vue?vue&type=style&index=0&lang.less";
_sfc_main.__hmrId = "60945987";
typeof __VUE_HMR_RUNTIME__ !== "undefined" && __VUE_HMR_RUNTIME__.createRecord(_sfc_main.__hmrId, _sfc_main);
export const _rerender_only = true;
import.meta.hot.accept((mod) => {
  if (!mod) return;
  const { default: updated, _rerender_only: _rerender_only2 } = mod;
  if (_rerender_only2) {
    __VUE_HMR_RUNTIME__.rerender(updated.__hmrId, updated.render);
  } else {
    __VUE_HMR_RUNTIME__.reload(updated.__hmrId, updated);
  }
});
import _export_sfc from "\\0plugin-vue:export-helper";
export default /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render], ["__file", "/Users/zhuzhengjian/workspace/puhua/mobile-project/src/runtime/views/home/index.vue"]]);`

export const testCode3 = `import { defineComponent as _defineComponent } from "vue";
import { ref } from "vue";
const _sfc_main = /* @__PURE__ */ _defineComponent({
  __name: "index",
  setup(__props, { expose: __expose }) {
    __expose();
    const msg = ref("S");
    const __returned__ = { msg };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
import { toDisplayString as _toDisplayString, normalizeStyle as _normalizeStyle, createElementVNode as _createElementVNode, createTextVNode as _createTextVNode, resolveComponent as _resolveComponent, withCtx as _withCtx, createVNode as _createVNode, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue";
const _hoisted_1 = {
  style: { "width": "100px", "height": "100px", "background-color": "aqua" },
  class: "aaa"
};
const _hoisted_2 = { style: { "width": "100px", "height": "100px", "background-color": "aqua" } };
const _hoisted_3 = { style: { fontSize: "12px" } };
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_van_button = _resolveComponent("van-button");
  return _openBlock(), _createElementBlock("div", null, [
    _createElementVNode("div", null, [
      _createElementVNode(
        "div",
        {
          style: _normalizeStyle([{ "width": "100px", "height": "100px", "background-color": "aqua" }, { fontSize: "12px" }]),
          class: "aaa"
        },
        _toDisplayString($setup.msg),
        1
        /* TEXT */
      ),
      _createElementVNode(
        "div",
        _hoisted_1,
        _toDisplayString($setup.msg) + "11 ",
        1
        /* TEXT */
      ),
      _createElementVNode(
        "div",
        _hoisted_2,
        _toDisplayString($setup.msg) + "12 ",
        1
        /* TEXT */
      ),
      _createElementVNode(
        "div",
        _hoisted_3,
        _toDisplayString($setup.msg) + "13 ",
        1
        /* TEXT */
      ),
      _createVNode(_component_van_button, { block: "" }, {
        default: _withCtx(() => [
          _createTextVNode(" \u6D4B\u8BD5 ")
        ]),
        _: 1
        /* STABLE */
      })
    ])
  ]);
}
import "/Users/zhuzhengjian/workspace/puhua/mobile-project/src/runtime/views/home/index.vue?vue&type=style&index=0&lang.less";
_sfc_main.__hmrId = "60945987";
typeof __VUE_HMR_RUNTIME__ !== "undefined" && __VUE_HMR_RUNTIME__.createRecord(_sfc_main.__hmrId, _sfc_main);
import.meta.hot.accept((mod) => {
  if (!mod) return;
  const { default: updated, _rerender_only } = mod;
  if (_rerender_only) {
    __VUE_HMR_RUNTIME__.rerender(updated.__hmrId, updated.render);
  } else {
    __VUE_HMR_RUNTIME__.reload(updated.__hmrId, updated);
  }
});
import _export_sfc from "\\0plugin-vue:export-helper";
export default /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render], ["__file", "/Users/zhuzhengjian/workspace/puhua/mobile-project/src/runtime/views/home/index.vue"]]);`
