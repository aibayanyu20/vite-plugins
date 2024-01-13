import { fileURLToPath } from 'node:url'

export const basePath = fileURLToPath(new URL('./', import.meta.url))
