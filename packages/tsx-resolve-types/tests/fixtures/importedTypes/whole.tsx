import { defineComponent } from 'vue'
import type { Base } from './types'

export default defineComponent<Base>((props) => {
  return () => <div>{props.cap}</div>
})
