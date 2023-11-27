<script lang="ts" setup>
import { computed, onMounted, shallowRef } from 'vue'
import { useData } from 'vitepress'
import siteDemos from '@siteDemo'
import { useSiteDemos } from '../hooks/site-demo'
import { useClipboard } from '../hooks/clip-board'
import ExpandComp from './icons/Expand.vue'
import UnExpand from './icons/UnExpand.vue'
import FileCopy from './icons/FileCopy.vue'
import FileSuccess from './icons/FileSuccess.vue'
import Codepen from './icons/Codepen.vue'
import CodeSandbox from './icons/CodeSandbox.vue'
import Stackblitz from './icons/Stackblitz.vue'

const props = defineProps<{ src: string ;title?: string ;desc?: string;raw?: boolean }>()
const siteDemoData = shallowRef(siteDemos)

// @ts-expect-error this is hot
if (import.meta.hot) {
  // @ts-expect-error this is hot
  import.meta.hot.accept('/@siteDemo', (m: any) => {
    siteDemoData.value = m.default
  })
}
const { demo, render, content, code } = useSiteDemos(props, siteDemoData)
const { isDark } = useData()
const titleId = computed(() => {
  const ids = props.src.split('.')[0].split('/')
  return `${ids.join('-')}`
})

const hash = shallowRef()

onMounted(async () => {
  hash.value = location.hash.slice(1)
  window.addEventListener('hashchange', () => {
    hash.value = location.hash.slice(1)
  })
})

const { copied, copy } = useClipboard()

function handleCopy() {
  copy(code)
}

const expand = shallowRef(false)
function handleExpand() {
  expand.value = !expand.value
}

const classes = computed(() => {
  return {
    'expand': expand.value,
    'code-box-dark': isDark.value,
    'code-box-active': hash.value === titleId.value,
  }
})

const isEmpty = computed(() => {
  return !!(code.value || content.value?.title || content.value?.content || content.value?.codesandbox || content.value?.codepen || content.value?.stackblitz)
})
</script>

<template>
  <section v-if="!raw" :id="titleId" class="code-box" :class="classes">
    <section v-if="demo" class="code-box-demo vp-raw" :class="!isEmpty ? 'code-box-demo-empty' : ''">
      <component :is="demo" />
    </section>
    <section v-if="isEmpty" class="code-box-meta markdown">
      <div v-if="content?.title || title" class="code-box-title">
        <a :href="`#${titleId}`" style="text-decoration: none">{{ content?.title ?? title }}</a>
      </div>
      <div v-if="content?.content || desc" class="code-box-description">
        <div v-html="content?.content ?? desc" />
      </div>
      <div class="code-box-actions" :class="!!(content?.content || desc) ? 'code-box-action-has-border' : ''">
        <div v-if="content?.codesandbox" class="code-box-code-action">
          <CodeSandbox />
        </div>
        <div v-if="content?.codepen" class="code-box-code-action">
          <Codepen />
        </div>
        <div v-if="content?.stackblitz" class="code-box-code-action">
          <Stackblitz />
        </div>
        <div v-if="code" class="code-box-code-action">
          <FileCopy v-if="!copied" @click="handleCopy" />
          <FileSuccess v-else style="color: var(--vp-c-brand)" />
        </div>
        <div v-if="code" class="code-box-code-action">
          <UnExpand :class="`code-expand-icon-${expand ? 'show' : 'hide'}`" @click="handleExpand" />
          <ExpandComp :class="`code-expand-icon-${!expand ? 'show' : 'hide'}`" @click="handleExpand" />
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
    --code-border-radio: 6px;
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
  border-radius: var(--code-border-radio) var(--code-border-radio) 0 0;
  padding: 42px 24px 50px;
  color: var(--vp-c-text-1);
  border-bottom: 1px solid var(--vp-c-divider);
}

.code-box .code-box-demo-empty{
    border-bottom: 0;
    border-radius: var(--code-border-radio);
}

.code-box-meta{
  position: relative;
  width: 100%;
  font-size: 14px;
  border-radius: 0 0 var(--code-border-radio) var(--code-border-radio);
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
  border-radius: var(--code-border-radio) var(--code-border-radio) 0 0;
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
    opacity: 0.7;
    transition: opacity .3s;
    -webkit-transition: opacity .3s;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
}

.code-box .code-box-action-has-border{
    border-top: 1px dashed var(--vp-c-divider);

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
    border-radius: 0 0 var(--code-border-radio) var(--code-border-radio);
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
