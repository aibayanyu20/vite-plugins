import { fileURLToPath } from 'url'
import { resolve } from 'path'

export const VITEPRESS_ID = '@siteDemo'

export const ALIAS = '/@site-demos'
export const VITEPRESS_ID_PATH = `/${VITEPRESS_ID}`

export const PKG_ROOT = resolve(fileURLToPath(import.meta.url), '../')
