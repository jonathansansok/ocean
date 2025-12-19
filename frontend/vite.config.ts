import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"

console.log("[vite.config] load")

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
    css: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
  },
})
