import { defineComponent } from 'vue'
import type { Base, Linecap } from './types'

export default defineComponent<{
  cap: Linecap
  size: Base['size']
  label?: string
}>((props) => {
  return () => <div>{props.cap}</div>
})
