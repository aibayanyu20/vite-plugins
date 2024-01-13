import type { SetupContext } from 'vue'
import { defineComponent } from 'vue'

import type { TableProps, TestProps } from './typing'
import { tablePropsDef } from './typing'

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

interface Emits {
  click: [Event]
}

export default defineComponent((props: TableProps = tablePropsDef, { attrs }: SetupContext<Emits>) => {
  return () => {
    return (
      <div>
        {props.test2}
        1111111
        {props.test4}
        attrs
        <span style={{ color: 'red' }}>
          {props.test}
        </span>
        { attrs.num }
        <Test1 {...props}></Test1>
        <Test2 {...props}></Test2>
      </div>
    )
  }
})
