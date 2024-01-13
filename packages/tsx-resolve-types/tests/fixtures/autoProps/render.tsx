import { defineComponent } from 'vue'

export default defineComponent({
  setup() {
    return {}
  },
  render() {
    return <div></div>
  },
})

export const A = defineComponent({
  setup(_props: { a: string }) {
    return {}
  },
  render() {
    return <div></div>
  },
})
