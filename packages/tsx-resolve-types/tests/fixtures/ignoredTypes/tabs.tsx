import { defineComponent } from 'vue'
import type { TabsProps } from './emits'

export default defineComponent<TabsProps>((props) => {
  return () => <div>{props.activeKey}</div>
})
