//app\frontend\src\lib\api.ts
import { supabase } from "./supabase";

const base = import.meta.env.VITE_API_BASE as string;

export async function apiFetch(path: string, init?: RequestInit) {
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token || "";
  console.log("[apiFetch][REQ]", { path, hasToken: !!token, base });

  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  const text = await res.text();
  console.log("[apiFetch][RES]", { path, ok: res.ok, status: res.status, text });

  if (!res.ok) throw new Error(text || "Request failed");
  return text ? JSON.parse(text) : null;
}
