import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Runtime Debug Logs (Safe for production)
console.log("[Supabase Init] URL Detected:", !!supabaseUrl);
console.log("[Supabase Init] Key Detected:", !!supabaseAnonKey);

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.error(
    "CRITICAL: Supabase credentials missing! Check Vercel Environment Variables."
  );
}

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
