import { createContext } from "react"
import type { Profile } from "../types/auth"

export type AuthState = {
  loading: boolean
  authed: boolean
  profile: Profile | null
  refresh: () => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthState>({
  loading: true,
  authed: false,
  profile: null,
  refresh: async () => {},
  logout: async () => {},
})
