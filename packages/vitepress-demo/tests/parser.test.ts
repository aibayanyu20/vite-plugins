import { fileURLToPath } from 'url'
import { resolve } from 'path'
import { describe, expect, it } from 'vitest'
import type { SiteConfig } from 'vitepress'
import type { ResolvedConfig } from 'vite'
import type { UserOptions } from '../src/typing'
import { Parser } from '../src/parser'
const baseDir = fileURLToPath(new URL('./', import.meta.url))
describe('parser', async () => {
  const vitepress: SiteConfig = {
    srcDir: resolve(baseDir, 'fixtures'),
    site: {
      base: '/',
    },
  } as SiteConfig
  const config = {
    root: resolve(baseDir, 'fixtures'),
    base: '/',
  } as ResolvedConfig
  const options: UserOptions = {}
  const parser = new Parser(config, options, vitepress)
  await parser.setupParser()
  it('should is demo', () => {

  })
})
