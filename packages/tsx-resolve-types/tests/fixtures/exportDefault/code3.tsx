import { defineComponent } from 'vue'
import type { Props } from './interface'
import { defaultProps } from './interface'

export default defineComponent({
  setup(_props: Props = defaultProps) {
    return () => <div>Code3</div>
  },
})
