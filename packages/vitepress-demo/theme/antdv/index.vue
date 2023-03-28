<script lang="ts" setup>
import { useData } from 'vitepress'
const props = defineProps<{
  src: string
}>()
const data = useData()
console.log(data)
</script>

<template>
  <div>
    <!--    -->
    demo测试
  </div>
</template>
