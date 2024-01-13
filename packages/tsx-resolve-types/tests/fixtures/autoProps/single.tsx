import { defineComponent } from 'vue'
import type { Props } from './typing'

export interface Props1 {
  foo1: string
  bar1: number
}

export type Props2 = Props & Props1
export type Props3 = Pick<Props2, 'foo1' | 'foo'>

export const Single = defineComponent<Props>(() => {
  return () => {
    return <div></div>
  }
})

export const Single2 = defineComponent((_props: Props2) => {
  return () => {
    return <div></div>
  }
})

export const Single3 = defineComponent({
  setup(_props: Props3) {
    return () => {
      return <div></div>
    }
  },
})
