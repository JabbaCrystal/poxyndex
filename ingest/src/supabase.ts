import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { DRY_RUN } from "./config.js";

let _client: SupabaseClient | null = null;

export function db(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL / SUPABASE_SERVICE_KEY. Set them in ingest/.env (local) " +
        "or as GitHub Actions secrets (CI)."
    );
  }
  _client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}

/** Wrap a write so DRY_RUN logs instead of mutating. */
export async function maybeWrite<T>(
  label: string,
  fn: () => Promise<T>
): Promise<T | null> {
  if (DRY_RUN) {
    console.log(`  [dry-run] would write: ${label}`);
    return null;
  }
  return fn();
}
