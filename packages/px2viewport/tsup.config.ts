import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/vue.ts',
  ],
  external: [
    'vite',
    '@babel/generator',
    '@babel/parser',
    '@babel/traverse',
    '@babel/types',
    'postcss-px-to-viewport-8-plugin',
    'magic-string-ast',
    'mlly',
    'vue',
  ],
  dts: true,
  format: ['esm', 'cjs'],
})
