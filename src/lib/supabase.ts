import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient, Session } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY;

// ── Auth client (with session persistence) ──
let _authClient: SupabaseClient | null = null;

function getAuthClient(): SupabaseClient {
  if (!_authClient) {
    _authClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true },
    });
  }
  return _authClient;
}

export async function signIn(email: string, password: string): Promise<Session> {
  const client = getAuthClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

export async function signOut() {
  const client = getAuthClient();
  const { error } = await client.auth.signOut();
  if (error) throw error;
  _authClient = null;
}

export async function getSession(): Promise<Session | null> {
  const client = getAuthClient();
  const { data } = await client.auth.getSession();
  return data.session;
}

// ── Data client (no auth session — uses anon key directly, same as before) ──
let _dataClient: SupabaseClient | null = null;

export function getDataClient(): SupabaseClient {
  if (!_dataClient) {
    _dataClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storageKey: "sb-jobagent-data",
      },
    });
  }
  return _dataClient;
}
