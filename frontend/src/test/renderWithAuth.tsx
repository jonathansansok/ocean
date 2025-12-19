import React from "react"
import { render } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { AuthContext, type AuthState } from "../auth/authContext"

export function renderWithAuth(
  ui: React.ReactNode,
  {
    auth,
    route = "/",
  }: {
    auth: AuthState
    route?: string
  }
) {
  console.log("[test][renderWithAuth] start", { route, authed: auth.authed, loading: auth.loading, role: auth.profile?.role })

  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </AuthContext.Provider>
  )
}

export function makeAuth(overrides?: Partial<AuthState>): AuthState {
  const base: AuthState = {
    loading: false,
    authed: true,
    profile: { id: "u1", email: "mesero@local.com", role: "mesero" },
    refresh: async () => console.log("[test][auth] refresh"),
    logout: async () => console.log("[test][auth] logout"),
  }

  const out = { ...base, ...(overrides || {}) }
  console.log("[test][makeAuth]", { loading: out.loading, authed: out.authed, role: out.profile?.role })
  return out
}
