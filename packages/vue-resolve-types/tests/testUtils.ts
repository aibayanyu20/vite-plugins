import { fileURLToPath } from 'node:url'
import { expect } from 'vitest'
import { compileScript, parse } from 'vue/compiler-sfc'
import type { SFCScriptCompileOptions } from 'vue/compiler-sfc'

export const fixtureDir = fileURLToPath(new URL('./fixtures/', import.meta.url))

export function normalize(code: string) {
  return code
    .replace(/\/\*@__PURE__\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/,\s+/g, ',')
    .trim()
}

export function compileSfc(
  code: string,
  filename: string,
  options: Partial<SFCScriptCompileOptions> = {},
) {
  const { descriptor } = parse(code, { filename })
  return compileScript(descriptor, { id: 'test', ...options }).content
}

export function getCompiledPropsSection(
  code: string,
  filename: string,
  options: Partial<SFCScriptCompileOptions> = {},
) {
  const content = compileSfc(code, filename, options)
  const match = content.match(/props:\s*([\s\S]*?),\s*setup\(/)
  if (!match)
    throw new Error(`No props section in compiled output for ${filename}`)
  return normalize(match[1])
}

export function getCompiledEmitsSection(
  code: string,
  filename: string,
  options: Partial<SFCScriptCompileOptions> = {},
) {
  const content = compileSfc(code, filename, options)
  const match = content.match(/emits:\s*([\s\S]*?),\s*setup\(/)
  if (!match)
    throw new Error(`No emits section in compiled output for ${filename}`)
  return normalize(match[1])
}

export function expectCompiledPropsParity(
  transformedCode: string,
  sourceCode: string,
  filename: string,
  options: Partial<SFCScriptCompileOptions> = {},
) {
  expect(getCompiledPropsSection(transformedCode, filename, options)).toBe(
    getCompiledPropsSection(sourceCode, filename, options),
  )
}

export function expectCompiledEmitsParity(
  transformedCode: string,
  sourceCode: string,
  filename: string,
  options: Partial<SFCScriptCompileOptions> = {},
) {
  expect(getCompiledEmitsSection(transformedCode, filename, options)).toBe(
    getCompiledEmitsSection(sourceCode, filename, options),
  )
}
