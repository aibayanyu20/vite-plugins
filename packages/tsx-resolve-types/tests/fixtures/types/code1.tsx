import { defineComponent } from 'vue'

interface Props {
  a?: string
}
const defaultProps = {
  a: 'a',
}
export const Code = defineComponent<Props>({
  setup(props = defaultProps) {
    return () => {
      return <div>{props.a}</div>
    }
  },
})

export default defineComponent<Props>({
  setup(props = defaultProps) {
    return () => {
      return <div>{props.a}</div>
    }
  },
})
