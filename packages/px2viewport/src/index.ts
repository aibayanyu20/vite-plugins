import type { FilterPattern, PluginOption } from 'vite'
import { createFilter } from 'vite'
import viewPort from 'postcss-px-to-viewport-8-plugin'
import { transform } from './transform'

export interface Px2viewportCSSOptions {
  /**
   * 设计稿的视口高度
   */
  viewportHeight?: number
  /**
   * 字体使用的视口单位
   */
  fontViewportUnit?: string
  /**
   * 需要忽略的CSS选择器，不会转为视口单位，使用原有的px等单位
   * 如果传入的值为字符串的话，只要选择器中含有传入值就会被匹配：例如 selectorBlackList 为 ['body'] 的话， 那么 .body-class 就会被忽略
   * 如果传入的值为正则表达式的话，那么就会依据CSS选择器是否匹配该正则：例如 selectorBlackList 为 [/^body$/] , 那么 body 会被忽略，而 .body 不会
   */
  selectorBlackList?: string[]
  /**
   * 能转化为vw的属性列表
   * 传入特定的CSS属性
   * 可以传入通配符""去匹配所有属性，例如：['']
   * 在属性的前或后添加"*",可以匹配特定的属性. (例如['position'] 会匹配 background-position-y)
   * 在特定属性前加 "!"，将不转换该属性的单位 . 例如: ['*', '!letter-spacing']，将不转换letter-spacing
   * "!" 和 ""可以组合使用， 例如: ['', '!font*']，将不转换font-size以及font-weight等属性
   */
  propList?: string[]

  /**
   * 媒体查询里的单位是否需要转换单位
   */
  mediaQuery?: boolean
  /**
   * 是否直接更换属性值，而不添加备用属性
   */
  replace?: boolean
  /**
   * 忽略某些文件夹下的文件或特定文件，例如 'node_modules' 下的文件
   * 如果值是一个正则表达式，那么匹配这个正则的文件会被忽略
   * 如果传入的值是一个数组，那么数组里的值必须为正则
   */
  exclude?: RegExp | RegExp[]
  /**
   * 如果设置了include，那将只有匹配到的文件才会被转换
   * 如果值是一个正则表达式，将包含匹配的文件，否则将排除该文件
   * 如果传入的值是一个数组，那么数组里的值必须为正则
   */
  include?: RegExp | RegExp[]
  /**
   * 是否添加根据 landscapeWidth 生成的媒体查询条件 @media (orientation: landscape)
   */
  landscape?: boolean
  /**
   * 横屏时使用的单位
   */
  landscapeUnit?: string
  /**
   * 横屏时使用的视口宽度
   * 支持传入函数，函数的参数为当前处理的文件路径
   */
  landscapeWidth?: number | ((filePath: string) => number | undefined)
}

export interface Px2viewportOptionsCommon {
  /**
   * 需要转换的单位，默认为"px"
   */
  unitToConvert?: string
  /**
   * 单位转换后保留的精度
   */
  unitPrecision?: number
  /**
   * 希望使用的视口单位
   */
  viewportUnit?: string
  /**
   * 设置最小的转换数值，如果为1的话，只有大于1的值会被转换
   */
  minPixelValue?: number
  /**
   * 设计稿的视口宽度
   */
  viewportWidth?: number | ((file: string) => number)
}

export interface Px2viewportOptions extends Px2viewportOptionsCommon {
  include?: FilterPattern
  cssOptions?: Px2viewportCSSOptions
}

export function px2viewport(options: Px2viewportOptions = {
  viewportWidth: 750,
  include: [/\.vue/, /\.[jt]sx$/],
}): PluginOption {
  const filter = createFilter(options?.include ?? [/\.vue/, /\.[jt]sx/])

  const commonConfig: Px2viewportOptionsCommon = {
    unitToConvert: options.unitToConvert ?? 'px',
    unitPrecision: options.unitPrecision ?? 5,
    viewportUnit: options.viewportUnit ?? 'vw',
    minPixelValue: options.minPixelValue,
    viewportWidth: options.viewportWidth ?? 750,
  }
  return {
    name: 'px2viewport',
    enforce: 'post',
    transform(code, id) {
      if (filter(id)) {
        let num = 750
        if (typeof options.viewportWidth === 'function')
          num = options.viewportWidth(id) ?? 750
        else
          num = options.viewportWidth ?? 750

        const res = transform(code, { ...commonConfig, viewportWidth: num })
        if (res)
          return res
      }
    },
    transformIndexHtml(html) {
      const _config = {
        ...commonConfig,
      }
      if (typeof commonConfig.viewportWidth === 'function')
        _config.viewportWidth = commonConfig.viewportWidth('px2viewport-inline')

      return {
        html,
        tags: [
          {
            tag: 'script',
            children: `window.__px2viewport = ${JSON.stringify(_config)}`,
          },
        ],
      }
    },
    config() {
      return {
        css: {
          postcss: {
            plugins: [
              viewPort({
                ...commonConfig,
                ...options?.cssOptions,
              }),
            ],
          },
        },
      }
    },
  } as PluginOption
}
