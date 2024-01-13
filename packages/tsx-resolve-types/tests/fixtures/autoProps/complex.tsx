import { defineComponent } from 'vue'

export interface CommonProps {
  b: string
}

export interface ComplexProps {
  a: string
}

export const Complex = defineComponent<CommonProps & ComplexProps>(() => {
  return () => {
    return <div></div>
  }
})

export const Complex1 = defineComponent((_props: CommonProps & ComplexProps) => {
  return () => {
    return <div></div>
  }
})

export const Complex2 = defineComponent((_props: CommonProps & { c: string }) => {
  return () => {
    return <div></div>
  }
})

export const Complex3 = defineComponent({
  setup(_props: CommonProps & ComplexProps) {
    return () => {
      return <div></div>
    }
  },
})

export const Complex4 = defineComponent({
  props: ['a', 'b'],
  setup(_props: CommonProps & ComplexProps) {
    return () => {
      return <div></div>
    }
  },
})
