import { defineComponent } from 'vue'

export interface Props {
  name: string
}
export default defineComponent({
  setup(props: Props = { name: '1' }) {
    return () => <div>basic</div>
  },
})
