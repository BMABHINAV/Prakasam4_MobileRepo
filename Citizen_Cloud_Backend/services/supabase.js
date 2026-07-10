import { createClient } from "@supabase/supabase-js";

let supabase;

export function initSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  
  if (!url || !key) {
    console.warn("[SUPABASE] Missing credentials in .env. Supabase DB calls will fail.");
    return;
  }

  supabase = createClient(url, key);
  console.log(`[SUPABASE] Connected to ${url}`);
}

export function getClient() {
  return supabase;
}
