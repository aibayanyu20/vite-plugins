import { VISITOR_KEYS } from '@babel/types'

interface PathLike {
  node: any
  parent: any
}

type VisitorHandler = (path: PathLike) => void
type Visitor = Record<string, VisitorHandler | undefined>

function isNode(value: unknown): value is { type: string; [key: string]: any } {
  return !!value && typeof value === 'object' && typeof (value as any).type === 'string'
}

function walkNode(node: any, parent: any, visitor: Visitor) {
  if (!isNode(node))
    return

  visitor[node.type]?.({ node, parent })

  const keys = (VISITOR_KEYS as Record<string, readonly string[] | undefined>)[node.type]
  if (!keys)
    return

  for (const key of keys) {
    const value = node[key]
    if (Array.isArray(value)) {
      for (const child of value)
        walkNode(child, node, visitor)
    }
    else {
      walkNode(value, node, visitor)
    }
  }
}

export function traverse(ast: any, visitor: Visitor) {
  walkNode(ast, null, visitor)
}
