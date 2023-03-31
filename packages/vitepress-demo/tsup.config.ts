import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  external: ['vite', 'vitepress', 'vue', 'chokidar', 'fs-extra', 'magic-string', 'htmlparser2', 'dom-serializer', 'markdown-it'],
  format: ['esm', 'cjs'],
  dts: true,
})
