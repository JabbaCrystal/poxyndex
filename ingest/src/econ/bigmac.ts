import { db, maybeWrite } from "../supabase.js";

/**
 * Danish Big Mac price (DKK), from The Economist's open data set, so we can
 * literally peg the Poxyndex to the Big Mac Index.
 * Source CSV includes a `local_price` column per country/date.
 */
const CSV_URL =
  "https://raw.githubusercontent.com/TheEconomist/big-mac-data/master/output-data/big-mac-raw-index.csv";

const FALLBACK_DKK = 38; // approx Danish Big Mac price; updated when the CSV is reachable

export async function ingestBigMac(): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  let dkk = FALLBACK_DKK;
  let source = "fallback";

  try {
    const res = await fetch(CSV_URL);
    if (res.ok) {
      const csv = await res.text();
      const lines = csv.trim().split(/\r?\n/);
      const header = lines[0]!.split(",");
      const iso = header.indexOf("iso_a3");
      const priceCol = header.indexOf("local_price");
      const dateCol = header.indexOf("date");
      // Take the most recent Denmark (DNK) row.
      let best: { date: string; price: number } | null = null;
      for (const line of lines.slice(1)) {
        const cols = line.split(",");
        if (cols[iso] !== "DNK") continue;
        const price = Number(cols[priceCol]);
        const date = cols[dateCol] ?? "";
        if (Number.isFinite(price) && (!best || date > best.date)) best = { date, price };
      }
      if (best) {
        dkk = Math.round(best.price * 100) / 100;
        source = `economist:${best.date}`;
      }
    }
  } catch (err) {
    console.warn(`  bigmac: live fetch failed, using fallback — ${(err as Error).message}`);
  }

  await maybeWrite(`bigmac ${today}`, async () => {
    const { error } = await db()
      .from("bigmac")
      .upsert({ day: today, dkk_price: dkk, source }, { onConflict: "day" });
    if (error) throw error;
  });
  console.log(`  bigmac: ${dkk} DKK (${source})`);
}
