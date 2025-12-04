import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
  ],
  external: [
    'vite',
    '@babel/parser',
    '@babel/traverse',
    '@babel/types',
    '@babel/generator',
    '@vue/compiler-sfc',
    '@v-c/resolve-types',
    'typescript',
  ],
  dts: true,
  format: ['esm', 'cjs'],
})
