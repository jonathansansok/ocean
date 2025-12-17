import { apiFetch } from "./api"
import { isApiErr, type ApiResponse } from "../types/api"
import type { Profile } from "../types/auth"

export async function fetchMyProfile() {
  console.log("[profile] fetchMyProfile via backend")
  const r = await apiFetch<ApiResponse<Profile>>("/auth/me")
  console.log("[profile] /auth/me", r)

  if (isApiErr(r)) {
    console.log("[profile] api err", r.error)
    return null
  }

  return r.data
}
