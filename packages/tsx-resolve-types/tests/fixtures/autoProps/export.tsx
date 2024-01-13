import { defineComponent } from 'vue'

export interface CommonProps {
  b: string
}

export default defineComponent<CommonProps>({
  setup() {
    return () => {
      return <div></div>
    }
  },
})
