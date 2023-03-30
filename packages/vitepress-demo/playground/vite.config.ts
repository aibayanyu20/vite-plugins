import { defineConfig } from 'vite'
import { vitepressDemo } from '../src'

export default defineConfig({
  plugins: [
    vitepressDemo({
    }),
  ],
  server: {
    port: 2222,
  },
})
