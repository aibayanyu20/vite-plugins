<script lang="ts" setup>
// import { useData } from 'vitepress'
import { useSiteDemo } from '../demos'
const props = defineProps<{
  src: string
  raw?: boolean
}>()
const { comp, data } = useSiteDemo(props.src)
// const data = useData()
</script>

<template>
  <template v-if="raw">
    <div v-if="data?.source" v-html="data.source" />
  </template>
  <template v-else>
    <div>
      <!--    -->
      demo测试
      <component :is="comp" v-if="comp" />
      <div v-if="data?.source" v-html="data.source" />
    </div>
  </template>
</template>
