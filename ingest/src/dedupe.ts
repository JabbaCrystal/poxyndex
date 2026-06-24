import { db } from "./supabase.js";
import { DRY_RUN } from "./config.js";
import { titleSimilarity } from "./util.js";

/**
 * Cross-platform duplicate detection: the same physical copy posted on more
 * than one site. v1 uses cheap signals only (no image download => GDPR-safe):
 *   block on region + price band, then score on title similarity / seller hash.
 * The canonical row is the one with the EARLIEST first_seen; others get dupe_of.
 *
 * (When data grows, add perceptual image hashing — see README "Roadmap".)
 */
const PRICE_BAND = 0.1; // within 10%
const PRICE_ABS = 25; // ...or 25 DKK, whichever is larger
const TITLE_THRESHOLD = 0.45;

interface Row {
  id: string;
  source: string;
  title: string | null;
  price_dkk: number | null;
  region: string | null;
  seller_hash: string | null;
  first_seen: string;
}

function isDuplicate(a: Row, b: Row): boolean {
  if (a.source === b.source) return false; // same-source dupes are rare; skip
  if (a.region && b.region && a.region !== b.region) return false;
  if (a.price_dkk != null && b.price_dkk != null) {
    const tol = Math.max(PRICE_ABS, a.price_dkk * PRICE_BAND);
    if (Math.abs(a.price_dkk - b.price_dkk) > tol) return false;
  }
  if (a.seller_hash && b.seller_hash && a.seller_hash === b.seller_hash) return true;
  return titleSimilarity(a.title ?? "", b.title ?? "") >= TITLE_THRESHOLD;
}

export async function dedupe(): Promise<void> {
  const { data, error } = await db()
    .from("listings")
    .select("id, source, title, price_dkk, region, seller_hash, first_seen")
    .eq("status", "active")
    .eq("is_reference", false)
    .is("dupe_of", null);
  if (error) throw error;

  const rows = (data ?? []) as Row[];
  let marked = 0;

  for (let i = 0; i < rows.length; i++) {
    for (let j = i + 1; j < rows.length; j++) {
      const a = rows[i]!;
      const b = rows[j]!;
      if (!isDuplicate(a, b)) continue;
      // Keep the earliest-seen as canonical.
      const [canonical, dup] = a.first_seen <= b.first_seen ? [a, b] : [b, a];
      if (DRY_RUN) {
        console.log(`  [dry-run] dupe: ${dup.source}/${dup.id} -> ${canonical.source}/${canonical.id}`);
        continue;
      }
      await db().from("listings").update({ dupe_of: canonical.id }).eq("id", dup.id);
      marked++;
    }
  }
  console.log(`  dedupe: ${marked} duplicate(s) collapsed`);
}
