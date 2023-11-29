import { defineComponent } from 'vue'

import type { TableProps } from './typing'

const Test1 = defineComponent<TableProps>((props) => {
  return () => {
    return (
      <div>
        {props.test2}
        11
      </div>
    )
  }
})

const Test2 = defineComponent({
  setup(props: TableProps) {
    return () => {
      return <div>{props.test}</div>
    }
  },
})

export default defineComponent((props: TableProps) => {
  return () => {
    return (
      <div>
        {props.test2}
        1111111
        {props.test4}
        2222
        <Test1 {...props}></Test1>
        <Test2 {...props}></Test2>
      </div>
    )
  }
})
