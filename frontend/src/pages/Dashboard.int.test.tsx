import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen } from "@testing-library/react"
import Dashboard from "./Dashboard"
import { renderWithAuth, makeAuth } from "../test/renderWithAuth"

const apiFetchMock = vi.fn()
const toastOkMock = vi.fn()
const toastErrMock = vi.fn()

vi.mock("../lib/api", () => {
  return {
    apiFetch: (...args: unknown[]) => {
      console.log("[test][mock][apiFetch] call", args)
      return apiFetchMock(...args)
    },
  }
})

vi.mock("../lib/notify", () => {
  return {
    toastOk: (msg: string) => {
      console.log("[test][mock][toastOk]", msg)
      return toastOkMock(msg)
    },
    toastErr: (msg: string) => {
      console.log("[test][mock][toastErr]", msg)
      return toastErrMock(msg)
    },
    toastInfo: (msg: string) => {
      console.log("[test][mock][toastInfo]", msg)
    },
  }
})

describe("Dashboard integration", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    apiFetchMock.mockReset()
    toastOkMock.mockReset()
    toastErrMock.mockReset()
  })

  it("renderiza órdenes desde /orders (GET) con items", async () => {
    apiFetchMock.mockResolvedValue({
      data: [
        {
          id: 7,
          status: "saved",
          total: 15,
          created_at: "2025-12-18T22:00:00.000Z",
          created_by: "m1",
          created_by_profile: { id: "m1", email: "m1@local.com", role: "mesero" },
          assigned_to: "m1",
          assigned_to_profile: { id: "m1", email: "m1@local.com", role: "mesero" },
          order_items: [
            { id: 1, product_id: 1, qty: 1, unit_price: 10, line_total: 10, product: { id: 1, name: "Burger", price: 10 } },
            { id: 2, product_id: 2, qty: 1, unit_price: 5, line_total: 5, product: { id: 2, name: "Papas", price: 5 } },
          ],
        },
      ],
    })

    renderWithAuth(<Dashboard />, { auth: makeAuth({ profile: { id: "m1", email: "m1@local.com", role: "mesero" } }) })

await screen.findByRole("heading", { name: /^Dashboard$/i })
await screen.findByText(/orden #7/i)
    await screen.findByText("Burger")
    await screen.findByText("Papas")
    expect(toastOkMock).toHaveBeenCalled()
  })

  it("si apiFetch falla muestra toastErr", async () => {
    apiFetchMock.mockRejectedValue(new Error("boom"))

    renderWithAuth(<Dashboard />, { auth: makeAuth() })

await screen.findByRole("heading", { name: /^Dashboard$/i })
    expect(toastErrMock).toHaveBeenCalled()
  })
})
