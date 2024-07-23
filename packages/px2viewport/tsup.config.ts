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
    'magic-string-ast',
    'mlly',
  ],
  dts: true,
  format: ['esm', 'cjs'],
})
