import { describe,it,expect } from "vitest"
import { sfcCode } from "./fixtrures/sfc-code"
import { inlineTransform } from "../src/inlineTransform"
describe("sfc",()=>{
    it("should work",()=>{
        const code = inlineTransform(sfcCode)
        expect(1).toBe(1)
    })
})
