import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  external: [
    'vite',
    '@babel/parser',
    '@babel/traverse',
    '@babel/types',
    '@babel/generator',
    '@vue/compiler-sfc',
    'magic-string',
    'typescript',
  ],
  dts: true,
  format: ['esm', 'cjs'],
})
