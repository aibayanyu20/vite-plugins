<script lang="ts" setup>
// import { useData } from 'vitepress'
import { useSiteDemo } from '../demos'
const props = defineProps<{
  src: string
}>()
const { comp, data } = useSiteDemo(props.src)
// const data = useData()
</script>

<template>
  <div>
    <!--    -->
    demo测试
    <component :is="comp" v-if="comp" />
    <div v-if="data?.source" v-html="data.source" />
  </div>
</template>
