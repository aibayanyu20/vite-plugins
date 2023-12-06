import type { ExtractPropTypes, PropType } from 'vue'

export interface Props {
  foo: string
  bar: number
}

export const extraProps = {
  test: {
    type: Object as PropType<{ a: string }>,
  },
}

export type ExtraProps = ExtractPropTypes<typeof extraProps>
