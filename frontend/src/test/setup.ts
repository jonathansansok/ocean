import "@testing-library/jest-dom/vitest"
import { afterEach } from "vitest"
import { cleanup } from "@testing-library/react"

console.log("[test][setup] init")

afterEach(() => {
  console.log("[test][setup] cleanup")
  cleanup()
})
