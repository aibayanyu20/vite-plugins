import type { PluginOption } from 'vite'
import { createLogger } from 'vite'
import { mockServer } from './server'

export const logger = createLogger('info', {
  prefix: '[vite:mock]',
})

export interface ViteMockContext extends MockPluginOptions {
  registeredRoutes: Set<string>
}

export interface MockPluginOptions {
  /**
   * 定义插件的前缀
   * @default '/mock'
   */
  prefix?: string

  /**
   * 配置mock的目录
   * @default 'mock'
   */
  mockDir?: string
}

export function mockPlugin(options: MockPluginOptions = { prefix: '/mock', mockDir: 'mock' }): PluginOption {
  const ctx: ViteMockContext = {
    registeredRoutes: new Set<string>(),
    ...options,
  }

  return {
    name: 'vite:mock',
    async configureServer(server) {
      await mockServer(server, ctx)
    },
    async configurePreviewServer(server) {
      await mockServer(server, ctx)
    },
  }
}

export default mockPlugin
