import { findStaticImports } from 'mlly'
import { MagicString } from 'magic-string-ast'
import { inlineTransform } from './inlineTransform'
import type { Px2viewportOptionsCommon } from './index'

export function transform(code: string, config?: Px2viewportOptionsCommon): undefined | any {
  code = inlineTransform(code, config)
  const m = new MagicString(code)
  // 处理全局的参数来实现px2viewport
  const imports = findStaticImports(code)
  for (const source of imports) {
    if (source.specifier === 'vue') {
      // 判断里面是否包含 normalizeStyle as _normalizeStyle,
      // 如果包含就去掉，然后用自己定义的 normalizeStyle
      const _imports = source.imports
      const normalizeStyleStr = 'normalizeStyle as _normalizeStyle'
      if (_imports && _imports.includes(normalizeStyleStr)) {
        let replaceCode = normalizeStyleStr
        if (_imports.includes(`${normalizeStyleStr},`)) {
          // 有逗号的情况
          replaceCode = `${normalizeStyleStr},`
        }
        else if (_imports.includes(`, ${normalizeStyleStr}`)) {
          // 有逗号的情况
          replaceCode = `, ${normalizeStyleStr}`
        }
        const newImports = _imports.replace(replaceCode, '')
        // \n_normalizeStyle.prototype.baseWidth=${baseWidth};
        const replaceImport = `import ${newImports} from '${source.specifier}'\nimport { normalizeStyle as _normalizeStyle } from '@mistjs/vite-plugin-px2viewport/vue';\n`
        m.overwrite(source.start, source.end, replaceImport)
      }
    }
  }
  return {
    code: m.toString(),
    map: m.generateMap({ hires: true }),
  }
}
