import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  external: [
    'vite',
    '@babel/parser',
    '@babel/traverse',
    '@babel/types',
    '@vue/compiler-sfc',
    'magic-string',
  ],
  dts: true,
  format: ['esm', 'cjs'],
})
