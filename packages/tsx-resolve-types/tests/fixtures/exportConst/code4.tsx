import { defineComponent } from 'vue'
import type { Props, Props1 } from './interface'
import { defaultProps, defaultProps1 } from './interface'

export const Code2 = defineComponent({
  setup(props: Props = defaultProps) {
    return () => {
      return <div>Code2</div>
    }
  },
})

export default defineComponent({
  setup(props: Props1 = defaultProps1) {
    return () => {
      return <div>Code2</div>
    }
  },
})
