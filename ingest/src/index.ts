// Poxyndex daily ingest entrypoint.
// Run: `npm run ingest`  (or `npm run ingest:dry` to log without writing).
//
// Order: scrape sources -> persist + reconcile sold -> dedupe -> econ overlays
//        -> compute index -> heartbeat (also the Supabase keep-alive write).

import { DRY_RUN } from "./config.js";
import { db } from "./supabase.js";
import { scrapeDba } from "./sources/dba.js";
import { scrapeGulOgGratis } from "./sources/guloggratis.js";
import { scrapeLaserdisken } from "./sources/laserdisken.js";
import { persistListings } from "./listings.js";
import { dedupe } from "./dedupe.js";
import { ingestCpi } from "./econ/cpi.js";
import { ingestWages } from "./econ/wages.js";
import { ingestFx } from "./econ/fx.js";
import { ingestBigMac } from "./econ/bigmac.js";
import { computeIndex } from "./index_calc.js";
import type { RawListing, SourceName } from "./types.js";

async function safe<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error(`! ${label} failed: ${(err as Error).message}`);
    return fallback;
  }
}

async function main() {
  const startedAt = new Date().toISOString();
  console.log(`\n=== Poxyndex ingest @ ${startedAt}${DRY_RUN ? " (DRY RUN)" : ""} ===`);

  // 1. Scrape sources (each isolated so one failure can't sink the run).
  console.log("• scraping sources");
  const dba = await safe("dba", scrapeDba, [] as RawListing[]);
  const gog = await safe("guloggratis", scrapeGulOgGratis, [] as RawListing[]);
  const laser = await safe("laserdisken", scrapeLaserdisken, [] as RawListing[]);

  // All three were attempted this run; reconciliation checks each.
  const scrapedSources: SourceName[] = ["dba", "guloggratis", "laserdisken"];
  const all = [...dba, ...gog, ...laser];

  // 2. Persist + reconcile disappearances (the sold signal).
  console.log("• persisting listings");
  await safe("persist", () => persistListings(all, scrapedSources), undefined);

  // 3. Cross-platform dedupe.
  console.log("• dedupe");
  await safe("dedupe", dedupe, undefined);

  // 4. Economic overlays.
  console.log("• economic overlays");
  await safe("cpi", ingestCpi, undefined);
  await safe("wages", ingestWages, undefined);
  await safe("fx", ingestFx, undefined);
  await safe("bigmac", ingestBigMac, undefined);

  // 5. Compute the index.
  console.log("• computing index");
  const index = await safe("index", computeIndex, {} as Record<string, unknown>);

  // 6. Heartbeat — proves the run happened AND keeps Supabase from auto-pausing.
  if (!DRY_RUN) {
    await safe(
      "heartbeat",
      async () => {
        await db().from("heartbeat").upsert(
          {
            id: 1,
            last_run: startedAt,
            last_status: "ok",
            detail: { sources: scrapedSources, scraped: all.length, index },
          },
          { onConflict: "id" }
        );
      },
      undefined
    );
  }

  console.log("=== done ===\n");
}

main().catch((err) => {
  console.error("FATAL", err);
  process.exit(1);
});
