import { describe, it, expect } from "vitest"
import { isApiErr, isApiOk, type ApiResponse } from "./api"

describe("types/api", () => {
  it("isApiErr true cuando hay error", () => {
    const r: ApiResponse<number> = { error: "boom" }
    console.log("[test][api] isApiErr", r)
    expect(isApiErr(r)).toBe(true)
    expect(isApiOk(r)).toBe(false)
  })

  it("isApiOk true cuando hay data", () => {
    const r: ApiResponse<number> = { data: 123 }
    console.log("[test][api] isApiOk", r)
    expect(isApiOk(r)).toBe(true)
    expect(isApiErr(r)).toBe(false)
  })
})
