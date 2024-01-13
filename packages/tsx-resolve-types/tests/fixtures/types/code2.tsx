import { defineComponent } from 'vue'

interface Props {
  b?: string
}

const defaultProps = {
  b: 'b',
  a: '1',
}
export const Code = defineComponent<{ a: string } & Props >({
  setup(props = defaultProps) {
    return () => {
      return <div>code</div>
    }
  },
})
