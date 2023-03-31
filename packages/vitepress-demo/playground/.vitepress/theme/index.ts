import type { Theme } from 'vitepress'
// eslint-disable-next-line import/no-named-as-default
import DefaultTheme from 'vitepress/theme'
import { AntdTheme } from '../../../src/theme'
export default {
  ...DefaultTheme,
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp?.(ctx)
    ctx.app.component('Demo', AntdTheme)
  },
} as Theme
