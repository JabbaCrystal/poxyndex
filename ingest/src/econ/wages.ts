import { db, maybeWrite } from "../supabase.js";
import { statbankSeries } from "./statbank.js";

/**
 * Average earnings per hour, StatBank LONS60.
 * Denmark has NO statutory minimum wage; we use average hourly earnings as the
 * affordability denominator.
 *
 * NOTE: LONS60 has several mandatory dimensions (sector, component, etc.) and a
 * bare query returns HTTP 400 — so by default we use the last-known value and
 * refresh it manually now and then. To make it live, add the table's other
 * variable codes here (see the StatBank "tableinfo" for LONS60). Wages move
 * slowly, so a yearly manual bump is fine and keeps the pipeline robust.
 */
const FALLBACK = { year: 2024, hourly_dkk: 386.62 };

export async function ingestWages(): Promise<void> {
  let row = FALLBACK;
  try {
    const series = await statbankSeries("LONS60", [
      { code: "Tid", values: ["*"] },
    ]);
    const latest = series.at(-1);
    if (latest) {
      row = { year: parseInt(latest.time, 10) || FALLBACK.year, hourly_dkk: latest.value };
    }
  } catch (err) {
    console.warn(`  wages: live fetch failed, using fallback — ${(err as Error).message}`);
  }
  await maybeWrite(`wages ${row.year}`, async () => {
    const { error } = await db().from("wages").upsert(row, { onConflict: "year" });
    if (error) throw error;
  });
  console.log(`  wages: ${row.hourly_dkk} DKK/hr (${row.year})`);
}
