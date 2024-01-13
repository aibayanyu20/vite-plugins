<script setup lang="ts">
import type { TableProps } from './typing.ts'

const props = defineProps<TableProps>()
</script>

<template>
  <div>
    {{ props }}
  </div>
</template>

<style scoped>

</style>
