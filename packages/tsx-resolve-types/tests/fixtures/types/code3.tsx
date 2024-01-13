import { defineComponent } from 'vue'

interface Props {
  name: string
}
export const Code3 = defineComponent((props: Props = { name: '1' }) => {
  return () => <div>Code3</div>
})

export const Code32 = defineComponent<Props>((props = { name: '1' }) => {
  return () => <div>Code3</div>
})

const props1 = { name: '1' }
export const Code31 = defineComponent((props: Props = props1) => {
  return () => <div>Code3</div>
})
