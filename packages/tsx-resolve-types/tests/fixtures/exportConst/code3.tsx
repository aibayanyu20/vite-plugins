import { defineComponent } from 'vue'
import type { Props } from './interface'
import { defaultProps } from './interface'

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
