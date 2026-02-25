import ts from 'typescript'
import { registerTS } from '@v-c/resolve-types'
import { transform } from '../src/transform'
import { GraphContext } from '../src/utils/graphContext'

registerTS(() => ts)

export function runTransformFixture(code: string, id: string, options?: Parameters<typeof transform>[3]) {
  const res = transform(code, id, new GraphContext(), options)
  return typeof res === 'string' ? res : res.code
}
