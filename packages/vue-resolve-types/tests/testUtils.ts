import { fileURLToPath } from 'node:url'
import { expect } from 'vitest'
import { compileScript, parse } from 'vue/compiler-sfc'

export const fixtureDir = fileURLToPath(new URL('./fixtures/', import.meta.url))

export function normalize(code: string) {
  return code
    .replace(/\/\*@__PURE__\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/,\s+/g, ',')
    .trim()
}

export function compileSfc(code: string, filename: string) {
  const { descriptor } = parse(code, { filename })
  return compileScript(descriptor, { id: 'test' }).content
}

export function getCompiledPropsSection(code: string, filename: string) {
  const content = compileSfc(code, filename)
  const match = content.match(/props:\s*([\s\S]*?),\s*setup\(/)
  if (!match)
    throw new Error(`No props section in compiled output for ${filename}`)
  return normalize(match[1])
}

export function getCompiledEmitsSection(code: string, filename: string) {
  const content = compileSfc(code, filename)
  const match = content.match(/emits:\s*([\s\S]*?),\s*setup\(/)
  if (!match)
    throw new Error(`No emits section in compiled output for ${filename}`)
  return normalize(match[1])
}

export function expectCompiledPropsParity(
  transformedCode: string,
  sourceCode: string,
  filename: string,
) {
  expect(getCompiledPropsSection(transformedCode, filename)).toBe(
    getCompiledPropsSection(sourceCode, filename),
  )
}

export function expectCompiledEmitsParity(
  transformedCode: string,
  sourceCode: string,
  filename: string,
) {
  expect(getCompiledEmitsSection(transformedCode, filename)).toBe(
    getCompiledEmitsSection(sourceCode, filename),
  )
}
