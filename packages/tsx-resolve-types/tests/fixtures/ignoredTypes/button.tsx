import { defineComponent } from 'vue'
import type { ButtonProps } from './emits'

export default defineComponent<ButtonProps>((props) => {
  return () => <button>{props.activeKey}</button>
})
