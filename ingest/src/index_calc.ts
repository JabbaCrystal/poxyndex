import { db, maybeWrite } from "./supabase.js";
import { median, mean } from "./util.js";

const DAY_MS = 86_400_000;

/**
 * Compute the Poxyndex for today from current DB state and write index_daily.
 * All metrics default to median + a visible N; everything degrades gracefully
 * to null when the market is empty (the common case for one rare DVD).
 */
export async function computeIndex(): Promise<Record<string, unknown>> {
  const today = new Date().toISOString().slice(0, 10);

  // Active, deduped, non-reference copies = "the market".
  const { data: active } = await db()
    .from("listings")
    .select("price_dkk, region")
    .eq("status", "active")
    .eq("is_reference", false)
    .is("dupe_of", null);

  const prices = (active ?? []).map((l) => l.price_dkk).filter((p): p is number => p != null);
  const medianAsking = median(prices);
  const meanAsking = mean(prices);
  const activeCount = (active ?? []).length;

  // Recently sold (last 90d) for the sold-price + velocity metrics.
  const since = new Date(Date.now() - 90 * DAY_MS).toISOString();
  const { data: sold } = await db()
    .from("listings")
    .select("price_dkk, first_seen, disappeared_at")
    .eq("status", "likely_sold")
    .gte("disappeared_at", since);

  const soldPrices = (sold ?? []).map((l) => l.price_dkk).filter((p): p is number => p != null);
  const medianSold = median(soldPrices);
  const daysToSell = (sold ?? [])
    .filter((l) => l.disappeared_at)
    .map((l) => (new Date(l.disappeared_at!).getTime() - new Date(l.first_seen).getTime()) / DAY_MS);
  const medianDaysToSell = median(daysToSell);

  const bidAskGap =
    medianAsking && medianSold ? (medianAsking - medianSold) / medianAsking : null;

  // Regional medians.
  const byRegion: Record<string, number[]> = {};
  for (const l of active ?? []) {
    if (l.region && l.price_dkk != null) (byRegion[l.region] ??= []).push(l.price_dkk);
  }
  const regional: Record<string, number> = {};
  for (const [r, ps] of Object.entries(byRegion)) {
    const m = median(ps);
    if (m != null) regional[r] = m;
  }

  // Economic overlays (latest available).
  const cpi = (await db().from("cpi_monthly").select("idx").order("month", { ascending: false }).limit(1)).data?.[0]?.idx ?? null;
  const wage = (await db().from("wages").select("hourly_dkk").order("year", { ascending: false }).limit(1)).data?.[0]?.hourly_dkk ?? null;
  const bigmac = (await db().from("bigmac").select("dkk_price").order("day", { ascending: false }).limit(1)).data?.[0]?.dkk_price ?? null;

  // CPI base for PRIS01 is 2025=100, so real price = nominal * 100 / cpi_now.
  const realIndex = medianAsking && cpi ? (medianAsking * 100) / cpi : null;
  const workMinutes = medianAsking && wage ? (medianAsking / wage) * 60 : null;
  const bigMacEquiv = medianAsking && bigmac ? medianAsking / bigmac : null;

  const row = {
    day: today,
    active_count: activeCount,
    median_asking_dkk: medianAsking,
    mean_asking_dkk: meanAsking,
    median_sold_dkk: medianSold,
    real_index: realIndex,
    work_minutes: workMinutes,
    big_mac_equiv: bigMacEquiv,
    median_days_to_sell: medianDaysToSell,
    bid_ask_gap: bidAskGap,
    regional,
    meta: {
      sold_n: soldPrices.length,
      cpi_idx: cpi,
      hourly_wage: wage,
      bigmac_dkk: bigmac,
      note: activeCount < 3 ? "thin market — headline is illustrative, not a trend" : null,
    },
  };

  await maybeWrite(`index_daily ${today}`, async () => {
    const { error } = await db().from("index_daily").upsert(row, { onConflict: "day" });
    if (error) throw error;
  });

  console.log(
    `  index: ${activeCount} active, median ${medianAsking ?? "—"} DKK` +
      (workMinutes ? `, ${Math.round(workMinutes)} work-min` : "") +
      (bigMacEquiv ? `, ${bigMacEquiv.toFixed(1)} Big Macs` : "")
  );
  return row;
}
