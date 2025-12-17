//app\frontend\src\lib\supabase.ts
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

console.log("[supabase][fe] init", { hasUrl: !!url, hasAnon: !!anon });

export const supabase = createClient(url, anon);