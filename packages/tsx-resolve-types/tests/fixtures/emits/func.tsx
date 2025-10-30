import type { SetupContext } from 'vue'
import { defineComponent } from 'vue'

export const Func1 = defineComponent((_, ctx: SetupContext<{
  'change': [string]
}>) => {
  const func = () => {
    ctx.emit('change', 'func')
  }
  return () => {
    return <div></div>
  }
})

interface Emits {
  'change': [string]
  'click': [Event]
}
export const Func2 = defineComponent((_, ctx: SetupContext<Emits>) => {
  const func = () => {
    ctx.emit('change', 'func')
  }
  return () => {
    return <div></div>
  }
})

export default defineComponent({
  setup(_, ctx: SetupContext<Emits>) {
    return () => <div>func</div>
  },
})

interface Emits1 {
  'click': [Event]
}
export const Func3 = defineComponent((_, { emit }: SetupContext<Emits1>) => {
  return () => {
    return <div> Func</div>
  }
})

export const Func4 = defineComponent<{ a: string }, Emits1>(() => {
  return () => {
    return null
  }
})
