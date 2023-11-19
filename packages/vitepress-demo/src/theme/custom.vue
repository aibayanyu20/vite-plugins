<script lang="ts" setup>
import { onMounted, shallowRef } from 'vue'
import { useSiteDemos } from './hooks/site-demo'

const props = defineProps<{ src: string }>()

const siteDemoData = shallowRef({})
const { demo, render, content, code } = useSiteDemos(props, siteDemoData)
const hash = shallowRef()
onMounted(async () => {
  const { default: siteDemos } = await import('@siteDemo')
  siteDemoData.value = siteDemos
  hash.value = location.hash.slice(1)
  window.addEventListener('hashchange', () => {
    hash.value = location.hash.slice(1)
  })
})
</script>

<template>
  <div>
    <slot :component="demo" :render="render" :content="content" :code="code" />
  </div>
</template>

<style scoped>

</style>
