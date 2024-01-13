import { defineComponent } from 'vue'

export interface Props {
  name: string
}
export const Code1 = defineComponent({
  setup(props: Props = { name: '1' }) {
    return () => <div>Code1</div>
  },
})
