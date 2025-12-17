import { supabase } from "./supabase";

export async function fetchMyProfile() {
  const u = await supabase.auth.getUser();
  console.log("[profile] getUser", u.data.user?.id);

  if (!u.data.user) return null;

  const q = await supabase
    .from("profiles")
    .select("id,email,role")
    .eq("id", u.data.user.id)
    .maybeSingle();

  console.log("[profile] db", { error: q.error?.message, data: q.data });

  if (q.error) throw new Error(q.error.message);
  return q.data;
}
