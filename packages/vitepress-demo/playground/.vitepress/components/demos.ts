import { shallowRef } from 'vue'
// @ts-expect-error this is demos
import vitepressDemo from '@siteDemo'

export const data = shallowRef(vitepressDemo)

// @ts-expect-error this is hot
if (import.meta?.hot) {
// @ts-expect-error this is hot
  import.meta.hot.accept('/@siteDemo', (m) => {
    data.value = m.default
  })
}
