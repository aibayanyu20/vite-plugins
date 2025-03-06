export const mergePropsCode = `/* Analyzed bindings: {
  "attrss": "setup-const",
  "tableData": "setup-const"
} */
import { defineComponent as _defineComponent } from 'vue'
import { resolveComponent as _resolveComponent, createVNode as _createVNode, mergeProps as _mergeProps, withCtx as _withCtx, openBlock as _openBlock, createBlock as _createBlock } from "vue"


const __sfc__ = /*@__PURE__*/_defineComponent({
    __name: 'App',
    setup(__props) {

        const attrss = {}
        const tableData = [
            {
                date: '2016-05-03',
                name: 'Tom',
                address: 'No. 189, Grove St, Los Angeles',
            },
            {
                date: '2016-05-02',
                name: 'Tom',
                address: 'No. 189, Grove St, Los Angeles',
            },
            {
                date: '2016-05-04',
                name: 'Tom',
                address: 'No. 189, Grove St, Los Angeles',
            },
            {
                date: '2016-05-01',
                name: 'Tom',
                address: 'No. 189, Grove St, Los Angeles',
            },
        ]

        return (_ctx,_cache) => {
            const _component_el_table_column = _resolveComponent("el-table-column")
            const _component_el_table = _resolveComponent("el-table")

            return (_openBlock(), _createBlock(_component_el_table, _mergeProps({
                data: tableData,
                style: {"width":"100px"}
            }, attrss), {
                default: _withCtx(() => [
                    _createVNode(_component_el_table_column, {
                        prop: "date",
                        label: "Date",
                        width: "180"
                    }),
                    _createVNode(_component_el_table_column, {
                        prop: "name",
                        label: "Name",
                        width: "180"
                    }),
                    _createVNode(_component_el_table_column, {
                        prop: "address",
                        label: "Address"
                    })
                ]),
                _: 1 /* STABLE */
            }, 16 /* FULL_PROPS */))
        }
    }

})
__sfc__.__file = "src/App.vue"
export default __sfc__`
