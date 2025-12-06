
import { describe, it, expect, vi } from 'vitest'
import { getDepModules } from '../src/utils/depModules'
import { GraphContext } from '../src/utils/graphContext'

// Mock invalidateTypeCacheId
vi.mock('../src/utils/invalidate', () => ({
  invalidateTypeCacheId: vi.fn()
}))

describe('getDepModules', () => {
  it('should handle circular dependencies without stack overflow', () => {
    const graphCtx = new GraphContext()
    const moduleGraph = {
      getModuleById: (id: string) => ({ id, file: id })
    } as any

    // A -> B -> A
    // Note: getDepModules uses mapFile to find *dependencies*.
    // If graphCtx.mapFile.get(A) returns [B], it means A depends on B?
    // Or is it "files that depend on A"?
    // In src/index.ts handleHotUpdate:
    // `const dependentFileIds = graphCtx.get(file)`
    // Then it iterates dependentFileIds to find modules affected.
    // If file is changed, we look up `graphCtx.get(file)` -> who depends on this file.
    // Let's verify `GraphContext` usage.
    
    // In `transform`:
    // `graphCtx.add(originalFile, id)`
    // If `originalFile` depends on `id`?
    // Let's look at `transform.ts`. But assuming standard HMR logic:
    // We want to invalidate files that *import* the modified file.
    
    // In depModules.ts:
    // mapFile.get(id) returns `ids`.
    // It calls getDepModules recursively on `ids`.
    // So if A -> B (A imports B), changing B should invalidate A.
    // So if I modify B, mapFile.get(B) should return [A].
    // Then getDepModules(A) is called.
    // If A also is imported by B (circular), mapFile.get(A) returns [B].
    // getDepModules(B) is called again -> Loop.

    graphCtx.mapFile.set('/path/to/A.tsx', ['/path/to/B.tsx'])
    graphCtx.mapFile.set('/path/to/B.tsx', ['/path/to/A.tsx'])

    expect(() => {
      getDepModules('/path/to/A.tsx', graphCtx, moduleGraph)
    }).not.toThrow()
  })
})
