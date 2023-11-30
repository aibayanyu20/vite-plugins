import { defineComponent } from 'vue'

import type { TableProps, TestProps } from './typing'

const Test1 = defineComponent<TestProps>((props) => {
  return () => {
    return (
      <div>
        {props.test2}
        <span>
          num1:
          {props.num1}

        </span>
        {props.num2}
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

export default defineComponent((props: TableProps, { attrs }) => {
  return () => {
    return (
      <div>
        {props.test2}
        1111111
        {props.test4}
        attrs
        {' '}
        { attrs.num }
        <Test1 {...props}></Test1>
        <Test2 {...props}></Test2>
      </div>
    )
  }
})
