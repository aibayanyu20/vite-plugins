import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
  ],
  external: [
    'vite',
    '@babel/parser',
    '@babel/types',
    '@vue/compiler-sfc',
    '@v-c/resolve-types',
    'typescript',
  ],
  dts: true,
  format: ['esm', 'cjs'],
})
