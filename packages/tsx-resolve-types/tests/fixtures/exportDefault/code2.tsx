import { defineComponent } from 'vue'

export interface Props {
  name?: string
}

const defaultProps: Props = {
  name: '2',
}
export default defineComponent({
  setup(props: Props = defaultProps) {
    return () => <div>basic</div>
  },
})
