import { defineComponent } from 'vue'

export interface Props {
  name?: string
}
export default defineComponent({
  setup(props: Props) {
    return () => <div>basic</div>
  },
})
