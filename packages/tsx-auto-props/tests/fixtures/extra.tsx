import { defineComponent } from 'vue'
import type { ExtraProps } from './typing'

export const Extra = defineComponent<ExtraProps>({
  setup() {
    return () => {
      return <div></div>
    }
  },
})
