import type { EnhanceAppContext } from 'vitepress'
import { ref } from 'vue'

export const siteDemoDataContext = 'SITE_DEMO_DATA_CONTEXT'
export default function (ctx: EnhanceAppContext) {
  const siteDemoData = ref()
  // @ts-expect-error this is hot
  if (import.meta.hot) {
    // @ts-expect-error this is hot
    import.meta.hot.accept('/@siteDemo', (m: any) => {
      siteDemoData.value = m.default
    })
  }
  // @ts-expect-error this is hot
  if (!import.meta.env.SSR) {
    import('@siteDemo').then((m) => {
      siteDemoData.value = m.default
    })
  }
  ctx.app.provide(siteDemoDataContext, siteDemoData)
}
