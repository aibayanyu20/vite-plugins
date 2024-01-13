import { defineComponent, ref } from 'vue'
import type { Props } from './typing'

export const Generic = defineComponent(
    <T extends string | number>(props: { msg: T; list: T[] }) => {
      const count = ref(0)

      return () => (
        <div>
          {props.msg}
          {' '}
          {count.value}
        </div>
      )
    },
)
export const Generic1 = defineComponent(
    <T extends Props | number>(props: { msg: T; list: T[] }) => {
      const count = ref(0)

      return () => (
        <div>
          {props.msg}
          {' '}
          {count.value}
        </div>
      )
    },
)
