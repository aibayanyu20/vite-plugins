import fs from 'node:fs/promises'
import path from 'node:path'
import type { PreviewServer, ViteDevServer } from 'vite'
import { JS_EXT_RE, bundleRequire } from 'bundle-require'
import chokidar from 'chokidar'
import { H3, defineEventHandler, toNodeHandler } from 'h3'
import { createRouter } from 'rou3'
import { glob } from 'tinyglobby'
import { normalizePath } from 'vite'
import type { ViteMockContext } from '.'
import { logger } from '.'

function generateRoutePath(basePath: string, mockPath: string, baseUrl: string) {
  if (mockPath === '.')
    mockPath = ''

  if (basePath === 'index')
    basePath = ''

  return normalizePath(path.join(baseUrl, mockPath, basePath))
}

type Method = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options'

// 颜色工具函数
const colors = {
  green: (text: string) => `\u001B[32m${text}\u001B[0m`,
  red: (text: string) => `\u001B[31m${text}\u001B[0m`,
  blue: (text: string) => `\u001B[34m${text}\u001B[0m`,
  yellow: (text: string) => `\u001B[33m${text}\u001B[0m`,
  cyan: (text: string) => `\u001B[36m${text}\u001B[0m`,
  magenta: (text: string) => `\u001B[35m${text}\u001B[0m`,
  gray: (text: string) => `\u001B[90m${text}\u001B[0m`,
  bold: (text: string) => `\u001B[1m${text}\u001B[0m`,
}

// HTTP 方法颜色映射
function getMethodColor(method: string) {
  switch (method.toLowerCase()) {
    case 'get': return colors.green
    case 'post': return colors.blue
    case 'put': return colors.yellow
    case 'patch': return colors.cyan
    case 'delete': return colors.red
    case 'head': return colors.magenta
    case 'options': return colors.gray
    default: return (text: string) => text
  }
}

// 格式化路由键，确保对齐
function formatRouteKey(method: string, url: string) {
  const methodPadded = method.toUpperCase().padEnd(7) // 最长的方法名是 OPTIONS (7个字符)
  const coloredMethod = getMethodColor(method)(methodPadded)

  // 为路径添加更丰富的颜色 - 路径用粗体青色，更加醒目
  const coloredUrl = colors.bold(colors.cyan(url))

  return `${coloredMethod} ${coloredUrl}`
}

// 跟踪已注册的路由
export async function mockServer(server: ViteDevServer | PreviewServer, ctx: ViteMockContext) {
  const h3 = new H3()
  const registeredRoutes = ctx.registeredRoutes
  // 注册router路由信息
  const baseUrl = ctx.prefix ?? '/mock'
  const cwd = path.resolve(server.config.root, ctx.mockDir ?? 'mock')

  // 检查 mock 目录是否存在
  try {
    await fs.access(cwd)
  }
  catch {
    logger.warn(`Mock directory ${cwd} does not exist, creating it...`)
    try {
      await fs.mkdir(cwd, { recursive: true })
    }
    catch (error) {
      logger.error(`Failed to create mock directory: ${error instanceof Error ? error.message : String(error)}`)
      return
    }
    // eslint-disable-next-line node/prefer-global/process
    process.exit(0) // 退出进程，等待用户创建 mock 文件
  }

  let _loaded = false
  let _timer: NodeJS.Timeout | null = null

  const loadMocks = async () => {
    try {
      _loaded = true

      // 保存当前路由集合用于比较
      const previousRoutes = new Set(registeredRoutes)
      const currentRoutes = new Set<string>()

      h3._rou3 = createRouter() // 重置router
      h3._routes = [] // 重置路由信息
      // 创建一个新的router实例
      const files = await glob(
        ['**/*.ts', '**/*.js'],
        {
          ignore: ['**/*.d.ts'],
          cwd,
        },
      )

      // 重写 loadFile 来收集当前路由
      const loadFileWithTracking = async (file: string) => {
        try {
          // 获取最终的文件名
          const baseName = normalizePath(path.basename(file))
          // 获取文件路径，不包含文件
          const mockPath = normalizePath(path.dirname(file))

          // 改进文件名解析逻辑
          const parts = baseName.split('.')
          if (parts.length < 2) {
            logger.warn(`Invalid mock file name format: ${file}`)
            return
          }

          const basePath = parts[0]
          let method = parts[1]

          // 生成路由路径
          const module = await bundleRequire<{ default: any }>({
            filepath: path.resolve(cwd, file),
            getOutputFile(filepath, format) {
              const dirname = path.dirname(filepath)
              const basename = path.basename(filepath)
              const randomname = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
              return path.resolve(
                dirname,
                                `_${basename.replace(JS_EXT_RE, `.bundled_${randomname}.${format === 'esm' ? 'mjs' : 'cjs'}`)}`,
              )
            },
          })
          if (method === 'ts' || method === 'js')
            method = 'get'

          // 验证 HTTP 方法
          const validMethods: Method[] = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options']
          if (!validMethods.includes(method as Method)) {
            logger.warn(`Invalid HTTP method "${method}" in file ${file}, defaulting to GET`)
            method = 'get'
          }

          let handler = module.mod.default
          if (!handler)
            handler = defineEventHandler(() => ({}))

          let url = generateRoutePath(basePath, mockPath, '/')
          if (url.endsWith('/'))
            url = url.slice(0, -1) // 移除末尾的斜杠

          const printUrl = generateRoutePath(basePath, mockPath, baseUrl)

          // 生成路由标识符 (用于内部跟踪，不带颜色)
          const routeKey = `${method.toUpperCase().padEnd(7)} ${printUrl}`
          // 生成带颜色的显示键
          const displayKey = formatRouteKey(method, printUrl)
          currentRoutes.add(routeKey)

          h3.on(method as Method, url, handler)

          // 只在新路由时显示提示
          if (!registeredRoutes.has(routeKey)) {
            logger.info(`${colors.green('+')} Registered new mock route: ${displayKey}`, {
              timestamp: true,
            })
          }
        }
        catch (error) {
          logger.error(`Failed to load mock file ${file}: ${error instanceof Error ? error.message : String(error)}`)
        }
      }

      await Promise.all(files.map(loadFileWithTracking))

      // 检查被删除的路由
      for (const route of previousRoutes) {
        if (!currentRoutes.has(route)) {
          // 解析路由键来获取方法和URL
          const [method, ...urlParts] = route.trim().split(' ')
          const url = urlParts.join(' ')
          const displayKey = formatRouteKey(method, url)
          logger.info(`${colors.red('-')} Removed mock route: ${displayKey}`, {
            timestamp: true,
          })
        }
      }

      // 更新注册的路由集合
      registeredRoutes.clear()
      currentRoutes.forEach(route => registeredRoutes.add(route))
      // logger.info(`Loaded ${files.length} mock files`)
    }
    catch (error) {
      logger.error(`Failed to load mocks: ${error instanceof Error ? error.message : String(error)}`)
    }
    finally {
      _loaded = false
    }
  }
  const watcher = chokidar.watch(
    '.',
    {
      cwd,
      ignoreInitial: true,
      ignored: ['**/*.d.ts', '**/*.bundled_*', '**/node_modules/**', '**/*.mjs'],
    },
  )

  watcher.on('all', (event, file) => {
    if (_loaded || _timer)
      return

    if (file.includes('.bundled_'))
      return

    // 记录文件变化，添加颜色
    const eventColor = event === 'add'
      ? colors.green
      : event === 'unlink'
        ? colors.red
        : event === 'change'
          ? colors.yellow
          : colors.cyan
    logger.info(`Mock file ${eventColor(event)}: ${colors.bold(file)}`, {
      timestamp: true,
    })

    _timer = setTimeout(() => {
      _timer = null
      loadMocks()
    }, 300)
  })

  watcher.on('error', (error) => {
    logger.error(`Mock watcher error: ${error instanceof Error ? error.message : String(error)}`)
  })

  loadMocks()

  const _close = server.close
  server.close = async () => {
    logger.info('Closing mock server...', {
      timestamp: true,
    })
    try {
      await watcher.close()
      if (_timer) {
        clearTimeout(_timer)
        _timer = null
      }
      return _close.call(server)
    }
    catch (error) {
      logger.error(`Error closing mock server: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    }
  }
  // 保证每次调用的都是新的实例返回的router的信息
  server.middlewares.use(baseUrl, toNodeHandler(h3))
}
