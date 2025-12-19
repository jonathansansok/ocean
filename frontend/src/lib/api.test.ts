import { describe, it, expect, vi, beforeEach } from "vitest"

const getSessionMock = vi.fn()

vi.mock("./supabase", () => {
  return {
    supabase: {
      auth: {
        getSession: (...args: unknown[]) => {
          console.log("[test][mock][supabase.auth.getSession] args", args)
          return getSessionMock()
        },
      },
    },
  }
})

describe("lib/api apiFetch", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    getSessionMock.mockReset()
  })

  it("manda Authorization Bearer token y parsea JSON", async () => {
    vi.stubEnv("VITE_API_BASE", "http://api.local")

    getSessionMock.mockResolvedValue({
      data: { session: { access_token: "tok123" } },
      error: null,
    })

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ data: [{ id: 1 }] }),
    })

    vi.stubGlobal("fetch", fetchMock)

    const mod = await import("./api")
    const { apiFetch } = mod

    const r = await apiFetch<{ data: { id: number }[] }>("/products")
    console.log("[test][apiFetch] result", r)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    console.log("[test][apiFetch] called", { url, init })

    expect(String(url)).toBe("http://api.local/products")
    expect(init.headers.Authorization).toBe("Bearer tok123")
    expect(r.data[0].id).toBe(1)
  })

  it("si res.ok es false lanza error con text", async () => {
    vi.stubEnv("VITE_API_BASE", "http://api.local")

    getSessionMock.mockResolvedValue({
      data: { session: { access_token: "tok123" } },
      error: null,
    })

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "fail backend",
    })

    vi.stubGlobal("fetch", fetchMock)

    const mod = await import("./api")
    const { apiFetch } = mod

    await expect(apiFetch("/orders")).rejects.toThrow("fail backend")
  })
})
