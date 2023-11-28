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

export const Common = defineComponent((_props: CommonProps & ComplexProps) => {
  return () => {
    return <div></div>
  }
})

export const Common2 = defineComponent((_props: CommonProps & { c: string }) => {
  return () => {
    return <div></div>
  }
})
