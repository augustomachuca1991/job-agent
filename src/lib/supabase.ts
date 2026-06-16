import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;
let _url = "";
let _key = "";

export function connect(url: string, key: string) {
  if (_client && _url === url && _key === key) return _client;
  _url = url;
  _key = key;
  _client = createClient(url, key, { auth: { persistSession: false } });
  return _client;
}
