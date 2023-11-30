import { defineComponent } from 'vue'

export const Inline = defineComponent((_props: { c: string;a: number }) => {
  return () => {
    return <div></div>
  }
})

export const Inline1 = defineComponent<{ c: string;a: number }>(() => {
  return () => {
    return <div></div>
  }
})
export const Inline2 = defineComponent({
  setup(_props: { c: string;a: number }) {
    return () => {
      return <div></div>
    }
  },
})

export default defineComponent({
  setup(_props: { c: string;a: number ;b: string }) {
    return () => {
      return <div></div>
    }
  },
})
