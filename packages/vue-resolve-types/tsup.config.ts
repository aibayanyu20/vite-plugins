import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  external: [
    'vite',
    'typescript',
    'vue/compiler-sfc',
    '@v-c/resolve-types',
    'oxc-walker',
  ],
  dts: true,
  format: ['esm', 'cjs'],
})
