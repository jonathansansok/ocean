import { supabase } from "./supabase";

const base = import.meta.env.VITE_API_BASE as string;

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token || "";
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  const text = await res.text();

  if (!res.ok) throw new Error(text || "Request failed");
  return text ? (JSON.parse(text) as T) : (null as T);
}
