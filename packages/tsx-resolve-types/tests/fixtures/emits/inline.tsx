import type { SetupContext } from 'vue'
import { defineComponent } from 'vue'

interface Emits {
  'change': [string]
  'click': [Event]
}
export const Inline1 = defineComponent({
  setup(props, { emit }: SetupContext<{
    'change': [string]
  }>) {
    const func = () => {
      emit('change', 'inline')
    }
    return () => {
      return (
        <div>
          Inline1
        </div>
      )
    }
  },
})

export const Inline2 = defineComponent({
  setup(props, { emit }: SetupContext<Emits>) {
    const func = () => {
      emit('change', 'inline')
    }
    return () => {
      return (
        <div>
          Inline2
        </div>
      )
    }
  },
})
export const Inline3 = defineComponent({
  setup(props, ctx: SetupContext<Emits>) {
    const func = () => {
      ctx.emit('change', 'inline')
    }
    return () => {
      return (
        <div>
          Inline2
        </div>
      )
    }
  },
})
