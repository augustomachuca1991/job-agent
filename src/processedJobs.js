import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function isProcessed(url) {
  const { data, error } = await supabase.from("processed_jobs").select("url").eq("url", url).maybeSingle();

  if (error) throw error;

  return !!data;
}

export async function markProcessed(url, company, title, score) {
  const { error } = await supabase.from("processed_jobs").upsert({
    url,
    company: company || null,
    title: title || null,
    score: score || null,
    processed_at: new Date().toISOString(),
  });

  if (error) throw error;
}
