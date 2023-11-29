import { defineComponent, ref } from 'vue'

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
