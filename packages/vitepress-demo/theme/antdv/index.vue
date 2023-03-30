<script lang="ts" setup>
import { computed, onMounted, shallowRef } from 'vue'
import { useData } from 'vitepress'
import { useSiteDemos } from '../hooks/site-demo'
import { useClipboard } from '../hooks/clip-board'
import Expand from './icons/Expand.vue'
import UnExpand from './icons/UnExpand.vue'
import FileCopy from './icons/FileCopy.vue'
import FileSuccess from './icons/FileSuccess.vue'
const props = defineProps<{ src: string ;title?: string ;desc?: string;raw?: boolean }>()
const { demo, render, content, code } = useSiteDemos(props)
const { isDark } = useData()
const titleId = computed(() => {
  const ids = props.src.split('.')[0].split('/')
  return `${ids.join('-')}`
})

const hash = shallowRef()
onMounted(() => {
  hash.value = location.hash.slice(1)
  window.addEventListener('hashchange', () => {
    hash.value = location.hash.slice(1)
  })
})

const { copied, copy } = useClipboard()

const handleCopy = () => {
  copy(code)
}

const expand = shallowRef(false)
const handleExpand = () => {
  expand.value = !expand.value
}

const classes = computed(() => {
  return {
    'expand': expand.value,
    'code-box-dark': isDark.value,
    'code-box-active': hash.value === titleId.value,
  }
})
</script>

<template>
  <section v-if="!raw" :id="titleId" class="code-box" :class="classes">
    <section v-if="demo" class="code-box-demo">
      <component :is="demo" />
    </section>
    <section class="code-box-meta markdown">
      <div v-if="content?.title || title" class="code-box-title">
        <a :href="`#${titleId}`">{{ content.title ?? title }}</a>
      </div>
      <div v-if="content?.content || desc" class="code-box-description">
        <div v-html="content.content ?? desc" />
      </div>
      <div class="code-box-actions">
        <!--            -->
        <div class="code-box-code-action">
          <FileCopy v-if="!copied" @click="handleCopy" />
          <FileSuccess v-else style="color: var(--vp-c-brand)" />
        </div>
        <div class="code-box-code-action">
          <UnExpand :class="`code-expand-icon-${expand ? 'show' : 'hide'}`" @click="handleExpand" />
          <Expand :class="`code-expand-icon-${!expand ? 'show' : 'hide'}`" @click="handleExpand" />
        </div>
      </div>
    </section>
    <section v-show="expand" class="highlight-wrapper">
      <div v-if="render" v-html="render" />
    </section>
  </section>
  <template v-else>
    <div v-if="render" v-html="render" />
  </template>
</template>

<style>
.code-box {
  --code-icon-color: rgba(0, 0, 0, 0.55);
  --code-icon-color-hover: rgba(0, 0, 0, 0.85);
  position: relative;
  display: inline-block;
  width: 100%;
  margin: 0 0 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  -webkit-transition: all 0.2s;
  transition: all 0.2s;
}

.expand .code-box-meta{
    border-bottom: 1px solid var(--vp-c-divider);
    border-radius: 0;
}

.code-box-dark{
    --code-icon-color: rgba(255, 255, 255, 0.55);
    --code-icon-color-hover: rgba(255, 255, 255, 0.85);
}

.code-box-active{
  border: 1px solid var(--vp-c-brand);
}

.code-box .code-box-demo{
  background-color: var(--vp-c-bg);
  border-radius: 6px 6px 0 0;
  padding: 42px 24px 50px;
  color: var(--vp-c-text-1);
  border-bottom: 1px solid var(--vp-c-divider);
}

.code-box-meta{
  position: relative;
  width: 100%;
  font-size: 14px;
  border-radius: 0 0 6px 6px;
  transition: background-color .4s;
  -webkit-transition: background-color .4s;
}
.markdown{
  color: var(--vp-c-text-1);
  font-size: 14px;
  line-height: 2;
}
.code-box .code-box-title, .code-box .code-box-title a{
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-bg);
}
.code-box-title{
  position: absolute;
  top: -14px;
  margin-left: 16px;
  padding: 1px 8px;
  border-radius: 6px 6px 0 0;
  transition: background-color .4s;
  -webkit-transition: background-color .4s;
}
.code-box-title a:hover{
    text-decoration: none;
}
.code-box-description{
  padding: 18px 24px 12px;
}
.code-box-description p{
    margin: 0;
}

.code-box-actions{
    display: flex;
    -webkit-box-pack: center;
    justify-content: center;
    -webkit-justify-content: center;
    padding: 12px 0;
    border-top: 1px dashed var(--vp-c-divider);
    opacity: 0.7;
    transition: opacity .3s;
    -webkit-transition: opacity .3s;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
}
.code-box .code-box-code-action{
    cursor: pointer;
    position: relative;
    display: flex;
    align-items: center;
    width: 16px;
    height: 16px;
    color: var(--code-icon-color);
    transition: all .2s;
    -webkit-transition: all .2s;
    -webkit-box-align: center;
}
.code-box .code-box-code-action:hover{
    color: var(--code-icon-color-hover);
}
.code-box .code-expand-icon-hide{
    opacity: 0;
    pointer-events: none;
}
.code-box .code-expand-icon-show,.code-box .code-expand-icon-hide{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    box-shadow: none;
    transition: all .4s;
    user-select: none;
}
.code-box .code-expand-icon-show{
    opacity: 0.55;
    pointer-events: auto;
}
.code-box .code-expand-icon-show:hover{
    opacity: 1;
}
.highlight-wrapper{
    overflow: auto;
    border-radius: 0 0 6px 6px;
}
.code-box div[class*='language-']{
    margin: 0;
    border-radius: 0;
}
@media (min-width: 640px) {
    .code-box  div[class*='language-']{
        margin: 0;
        border-radius: 0;
    }
}
</style>
