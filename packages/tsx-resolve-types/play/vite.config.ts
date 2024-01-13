import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import inspect from 'vite-plugin-inspect'
import { tsxResolveTypes } from '../src'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tsxResolveTypes(),
    vue(),
    vueJsx(),
    inspect(),
  ],
})
