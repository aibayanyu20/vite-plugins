import _traverse from '@babel/traverse'

export const traverse = typeof (_traverse as any).default === 'undefined'
  ? _traverse
  : ((_traverse as any).default as typeof _traverse)
