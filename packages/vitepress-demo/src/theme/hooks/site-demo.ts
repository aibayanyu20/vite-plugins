import type { Ref } from 'vue'
import { computed, defineAsyncComponent } from 'vue'
import { useData } from 'vitepress'

function decodeBlock(block: Record<string, any>) {
  const obj: Record<string, any> = {}
  for (const blockKey in block) {
    const val = block[blockKey]
    if (typeof val === 'string')
      obj[blockKey] = decodeURIComponent(val)
    else if (typeof val === 'object')
      obj[blockKey] = decodeBlock(val)
  }
  return obj
}

export function useSiteDemos(props: { src: string }, siteDemosData: Ref) {
  const { lang } = useData()
  const demoData = computed(() => {
    return siteDemosData.value[props.src]?.data
  })
  const render = computed(() => {
    return decodeURIComponent(demoData.value?.render)
  })

  const code = computed(() => {
    return decodeURIComponent(demoData.value?.code)
  })
  const demo = computed(() => {
    if (siteDemosData.value[props.src]?.comp)
      return defineAsyncComponent(siteDemosData.value[props.src]?.comp)

    return null
  })

  const block = computed(() => {
    return demoData.value?.block ? decodeBlock(demoData.value?.block) : null
  })

  const content = computed(() => {
    if (!block.value)
      return null
    const first = Object.keys(block.value)[0]
    return block.value[lang.value] ?? block.value[first]
  })
  return { demoData, demo, render, code, block, content }
}
