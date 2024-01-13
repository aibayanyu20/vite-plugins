import _generate from '@babel/generator'

export const generate = typeof (_generate as any).default === 'undefined'
  ? _generate
  : ((_generate as any).default as typeof _generate)
