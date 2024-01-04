import { defineComponent } from 'vue'

export const DefaultTsx = defineComponent<{ a?: string }>({
  setup(props = { a: '1' }) {
    return () => {
      return <div></div>
    }
  },
})
