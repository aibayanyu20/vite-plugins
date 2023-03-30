<script lang="ts" setup>
import { useSiteDemos } from '../hooks/site-demo'
const props = defineProps<{ src: string ;title?: string ;desc?: string }>()
const { demo, render, content } = useSiteDemos(props)
</script>

<template>
  <div>
    {{ content }}
    <div v-if="demo">
      <component :is="demo" />
    </div>
    <div v-if="render" v-html="render" />
  </div>
</template>
