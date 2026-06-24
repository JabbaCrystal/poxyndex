import { createClient } from "@supabase/supabase-js";
import type { IndexDaily, PublicListing, Heartbeat } from "./types";

// Public, RLS-restricted client. The anon key is SAFE to ship to the browser.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isConfigured = Boolean(url && anon);

// Use harmless placeholders when unconfigured so createClient() doesn't throw
// during the static build; the UI checks isConfigured before querying.
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  anon || "placeholder-anon-key",
  { auth: { persistSession: false } }
);

export async function fetchIndexHistory(): Promise<IndexDaily[]> {
  const { data, error } = await supabase
    .from("index_daily")
    .select("*")
    .order("day", { ascending: true });
  if (error) throw error;
  return (data ?? []) as IndexDaily[];
}

export async function fetchActiveListings(): Promise<PublicListing[]> {
  const { data, error } = await supabase
    .from("listings")
    .select("id, source, source_url, condition, price_dkk, region, status, first_seen, is_reference")
    .in("status", ["active", "out_of_stock"])
    .is("dupe_of", null)
    .order("price_dkk", { ascending: true });
  if (error) throw error;
  return (data ?? []) as PublicListing[];
}

export async function fetchHeartbeat(): Promise<Heartbeat | null> {
  const { data } = await supabase
    .from("heartbeat")
    .select("last_run, last_status")
    .eq("id", 1)
    .maybeSingle();
  return (data as Heartbeat) ?? null;
}
