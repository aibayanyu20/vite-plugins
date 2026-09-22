import { defineComponent } from 'vue'
import type { Base } from './index'

export default defineComponent<{
  cap: Base['cap']
  size: Base['size']
}>((props) => {
  return () => <div>{props.cap}</div>
})
