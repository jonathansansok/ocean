//app\frontend\src\lib\profile.ts
import { apiFetch } from "./api";

export type Profile = {
  id: string;
  email: string;
  role: "admin" | "mesero";
};

export async function fetchMyProfile() {
  console.log("[profile] fetchMyProfile via backend");
  const r = await apiFetch("/auth/me");
  console.log("[profile] /auth/me", r);
  return (r?.data || null) as Profile | null;
}
