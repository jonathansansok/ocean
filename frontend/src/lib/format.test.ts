import { describe, it, expect } from "vitest"
import { formatDateTime } from "./format"

describe("lib/format", () => {
  it("formatea un ISO valido", () => {
    const iso = "2025-12-18T22:00:00.000Z"
    const out = formatDateTime(iso)
    console.log("[test][formatDateTime] out", { iso, out })
    expect(typeof out).toBe("string")
    expect(out.length).toBeGreaterThan(0)
  })

  it("si es invalido devuelve el input", () => {
    const iso = "nope"
    const out = formatDateTime(iso)
    console.log("[test][formatDateTime] invalid", { iso, out })
    expect(out).toBe(iso)
  })
})
