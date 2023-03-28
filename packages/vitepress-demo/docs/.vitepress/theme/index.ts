import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { AntdTheme } from '../../../theme'
export default {
  ...DefaultTheme,
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp?.(ctx)
    ctx.app.component('Demo', AntdTheme)
  },
} as Theme
