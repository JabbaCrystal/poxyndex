import { db, maybeWrite } from "../supabase.js";

/**
 * DKK per USD. Primary: Nationalbanken XML (rates are quoted per 100 units —
 * a classic 100x footgun). Fallback: Frankfurter (ECB, no key).
 * No rate on weekends/holidays -> we just upsert today with the latest known.
 */
export async function ingestFx(): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  let dkkPerUsd: number | null = null;

  try {
    const res = await fetch("https://www.nationalbanken.dk/api/currencyratesxml");
    if (res.ok) {
      const xml = await res.text();
      // <currency code="USD" rate="659.22"/> -> DKK per 100 USD
      const m = xml.match(/code="USD"[^>]*rate="([\d.,]+)"/i);
      if (m) dkkPerUsd = Number(m[1]!.replace(",", ".")) / 100;
    }
  } catch {
    /* fall through to Frankfurter */
  }

  if (!dkkPerUsd) {
    try {
      const res = await fetch("https://api.frankfurter.app/latest?from=USD&to=DKK");
      if (res.ok) {
        const j = (await res.json()) as { rates?: { DKK?: number } };
        if (j.rates?.DKK) dkkPerUsd = j.rates.DKK;
      }
    } catch {
      /* give up gracefully */
    }
  }

  if (!dkkPerUsd) {
    console.warn("  fx: no rate available today (skipping)");
    return;
  }
  await maybeWrite(`fx ${today}`, async () => {
    const { error } = await db()
      .from("fx_daily")
      .upsert({ day: today, dkk_per_usd: Number(dkkPerUsd!.toFixed(4)) }, { onConflict: "day" });
    if (error) throw error;
  });
  console.log(`  fx: ${dkkPerUsd.toFixed(4)} DKK/USD`);
}
