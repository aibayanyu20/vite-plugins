import type { TableProps } from 'ant-design-vue'
import { defineComponent } from 'vue'

export type MyTableProps = TableProps & {
  sss?: string
}

export const LibTest = defineComponent<MyTableProps>(() => {
  return () => {
    return <div></div>
  }
})
