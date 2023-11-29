import { defineComponent } from 'vue'

import type { TableProps } from './typing'

const Test1 = defineComponent<TableProps>((props) => {
  return () => {
    return <div>{props.test2}</div>
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
    console.log(props)

    return (
      <div>
        {props.test2}
        1111111
        <Test1 {...props}></Test1>
        <Test2 {...props}></Test2>
      </div>
    )
  }
})
