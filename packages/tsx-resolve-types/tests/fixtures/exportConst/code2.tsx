import { defineComponent } from 'vue'

export interface Props {
  a?: string
}
export const defaultProps: Props = {
  a: '1',
}
export const Code2 = defineComponent({
  setup(props: Props = defaultProps) {
    return () => {
      return <div>Code2</div>
    }
  },
})

export const Code21 = defineComponent({
  setup(props: Props = defaultProps) {
    return () => {
      return <div>Code2</div>
    }
  },
})
