import { computed, defineAsyncComponent, reactive, readonly, shallowRef, watch } from 'vue'
import demoData from '@demosData'

console.log(demoData)
// @ts-expect-error this is siteDemoData
export const siteDemosRef: Record<string, any> = import.meta.env.DEV ? reactive(demoData) : readonly(demoData)

// @ts-expect-error this is siteDemoData
if (import.meta.hot) {
  const updateSiteDemo = (data: any, key: string) => {
    if (data) {
      const item = siteDemosRef[key]
      if (item && item.data)
        Object.assign(item.data, data)
    }
  }

  const addSiteDemo = (data: any, key: string, comp?: string) => {
    if (data) {
      siteDemosRef[key] = {
        data,
        // eslint-disable-next-line no-new-func
        comp: comp ? new Function(`return ${comp}`)() : undefined,
      }
    }
  }

  const deleteSiteDemo = (key: string) => {
    delete siteDemosRef[key]
  }

  // @ts-expect-error this is siteDemoData
  import.meta.hot.on('vitepress:demo', (payload: any) => {
    if (payload) {
      if (payload.type === 'update')
        updateSiteDemo(payload.data, payload.key)

      else if (payload.type === 'add')
        addSiteDemo(payload.data, payload.key, payload.comp)
      else if (payload.type === 'del')
        deleteSiteDemo(payload.key)
    }
  })
}

export const useSiteDemo = (path: string) => {
  const data = computed(() => {
    return siteDemosRef[path]?.data
  })
  const comp = shallowRef()
  watch(data, () => {
    const compPath = siteDemosRef[path]?.comp
    if (compPath)
      comp.value = defineAsyncComponent(compPath)
  }, { immediate: true, flush: 'post' })
  return {
    data,
    comp,
  }
}
