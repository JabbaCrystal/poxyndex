import { db, maybeWrite } from "../supabase.js";
import { statbankSeries, statbankMonth } from "./statbank.js";

/**
 * Danish CPI from StatBank table PRIS01 (base 2025=100).
 *   VAREGR=000000  -> total
 *   ENHED=100      -> index ; ENHED=300 -> year-on-year %
 * All non-time variables must be set or StatBank errors.
 */
export async function ingestCpi(): Promise<void> {
  try {
    const [idx, yoy] = await Promise.all([
      statbankSeries("PRIS01", [
        { code: "VAREGR", values: ["000000"] },
        { code: "ENHED", values: ["100"] },
        { code: "Tid", values: ["*"] },
      ]),
      statbankSeries("PRIS01", [
        { code: "VAREGR", values: ["000000"] },
        { code: "ENHED", values: ["300"] },
        { code: "Tid", values: ["*"] },
      ]).catch(() => [] as Array<{ time: string; value: number }>),
    ]);

    const yoyByMonth = new Map(yoy.map((r) => [statbankMonth(r.time), r.value]));
    const rows = idx.map((r) => ({
      month: statbankMonth(r.time),
      idx: r.value,
      yoy: yoyByMonth.get(statbankMonth(r.time)) ?? null,
    }));
    if (rows.length === 0) {
      console.warn("  cpi: no rows parsed (skipping)");
      return;
    }
    await maybeWrite(`cpi ${rows.length} months`, async () => {
      const { error } = await db().from("cpi_monthly").upsert(rows, { onConflict: "month" });
      if (error) throw error;
    });
    console.log(`  cpi: upserted ${rows.length} months (latest ${rows.at(-1)?.month})`);
  } catch (err) {
    console.warn(`  cpi: failed — ${(err as Error).message}`);
  }
}
