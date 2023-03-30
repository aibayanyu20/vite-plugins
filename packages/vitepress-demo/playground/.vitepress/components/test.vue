<script setup lang="ts">
import { ref } from 'vue'
import { data } from './demos'
const counter = ref(1)
console.log(data)
</script>

<template>
  <div>
    测试11111111
    {{ counter }}
    <button @click="counter++">
      增加
    </button>
  </div>
</template>
