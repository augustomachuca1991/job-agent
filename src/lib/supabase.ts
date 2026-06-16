import { createClient } from "@supabase/supabase-js";

export function connect(url: string, key: string) {
  return createClient(url, key);
}
