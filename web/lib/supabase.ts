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

export interface CpiPoint {
  month: string; // 'YYYY-MM'
  idx: number;
}

export async function fetchCpiMonthly(): Promise<CpiPoint[]> {
  const { data, error } = await supabase
    .from("cpi_monthly")
    .select("month, idx")
    .order("month", { ascending: true });
  if (error) throw error;
  return (data ?? []).filter((d): d is CpiPoint => d.idx != null);
}

export interface CommunityRow {
  paid_dkk: number;
  region: string | null;
}

/** Self-reported community submissions. Returns [] on any error (e.g. table
 *  not created yet) so the feature degrades gracefully. */
export async function fetchCommunityPaid(): Promise<CommunityRow[]> {
  try {
    const { data, error } = await supabase.from("community_paid").select("paid_dkk, region");
    if (error) return [];
    return (data ?? []) as CommunityRow[];
  } catch {
    return [];
  }
}

/** Upsert this device's single data point. Silently no-ops on error. */
export async function upsertCommunityPaid(row: {
  device_id: string;
  paid_dkk: number;
  bought_month: string;
  region: string | null;
}): Promise<void> {
  try {
    await supabase
      .from("community_paid")
      .upsert({ ...row, updated_at: new Date().toISOString() }, { onConflict: "device_id" });
  } catch {
    /* ignore — community layer is best-effort */
  }
}

export async function fetchLatestFx(): Promise<number | null> {
  const { data } = await supabase
    .from("fx_daily")
    .select("dkk_per_usd")
    .order("day", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as { dkk_per_usd?: number } | null)?.dkk_per_usd ?? null;
}

export async function fetchHeartbeat(): Promise<Heartbeat | null> {
  const { data } = await supabase
    .from("heartbeat")
    .select("last_run, last_status")
    .eq("id", 1)
    .maybeSingle();
  return (data as Heartbeat) ?? null;
}
