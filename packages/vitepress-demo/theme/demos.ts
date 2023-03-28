import { computed, readonly, shallowRef } from 'vue'
import type { Ref } from 'vue'
import demoData from '@demosData'

// @ts-expect-error this is siteDemoData
export const siteDemosRef: Ref<any> = shallowRef(import.meta.env.PROD ? demoData : readonly(demoData))

// @ts-expect-error this is siteDemoData
if (import.meta.hot) {
// @ts-expect-error this is siteDemoData
  import.meta.hot.on('vitpress:demo', (payload: any) => {
    if (payload) {
      // TODO
    }
  })
}

export const useSiteDemo = (path: string) => {
  const data = computed(() => {
    return siteDemosRef.value[path]
  })
  return {
    data,
  }
}
