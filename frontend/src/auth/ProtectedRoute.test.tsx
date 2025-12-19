import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import ProtectedRoute from "./ProtectedRoute"
import { AuthContext, type AuthState } from "./authContext"

function renderWithAuth(state: AuthState, initial = "/private") {
  console.log("[test][ProtectedRoute] renderWithAuth", { state, initial })

  return render(
    <AuthContext.Provider value={state}>
      <MemoryRouter initialEntries={[initial]}>
        <Routes>
          <Route path="/login" element={<div>LoginPage</div>} />
          <Route
            path="/private"
            element={
              <ProtectedRoute>
                <div>Secret</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

describe("ProtectedRoute", () => {
  it("si loading true y no authed muestra Loading", () => {
    renderWithAuth({
      loading: true,
      authed: false,
      profile: null,
      refresh: async () => console.log("[test][auth] refresh"),
      logout: async () => console.log("[test][auth] logout"),
    })

    expect(screen.getByText("Loading...")).toBeInTheDocument()
  })

  it("si no authed redirige a /login", async () => {
    renderWithAuth({
      loading: false,
      authed: false,
      profile: null,
      refresh: async () => console.log("[test][auth] refresh"),
      logout: async () => console.log("[test][auth] logout"),
    })

    expect(screen.getByText("LoginPage")).toBeInTheDocument()
  })

  it("si authed renderiza children", () => {
    renderWithAuth({
      loading: false,
      authed: true,
      profile: { id: "1", email: "a@a.com", role: "admin" },
      refresh: async () => console.log("[test][auth] refresh"),
      logout: async () => console.log("[test][auth] logout"),
    })

    expect(screen.getByText("Secret")).toBeInTheDocument()
  })
})
