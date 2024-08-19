import { createFilter } from "vite"
import { describe,it,expect } from "vitest"

describe("test filter",()=>{
    it("test",()=>{
        const filter = createFilter([/\.vue$/, /\.[jt]sx$/])
        const id = `ss/test.jsx`
        expect(filter(id)).toBe(true)
    })
})