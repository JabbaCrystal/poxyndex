import { db } from "./supabase.js";
import { DRY_RUN, SOLD_GRACE_DAYS, EXPIRY_DAYS } from "./config.js";
import { postalToRegion, sellerHash, conditionRank } from "./util.js";
import type { RawListing, SourceName } from "./types.js";

const DAY_MS = 86_400_000;

/**
 * Upsert scraped listings + append a snapshot for each, then reconcile any
 * previously-active listing that did NOT appear this run (the sold signal).
 */
export async function persistListings(
  raw: RawListing[],
  scrapedSources: SourceName[]
): Promise<void> {
  const now = new Date().toISOString();
  const seenKeys = new Set<string>();

  for (const r of raw) {
    const key = `${r.source}:${r.sourceListingId}`;
    seenKeys.add(key);

    const region = postalToRegion(r.postalCode);
    const fields = {
      source: r.source,
      source_listing_id: r.sourceListingId,
      source_url: r.sourceUrl,
      title: r.title,
      condition: r.condition ?? null,
      condition_rank: conditionRank(r.condition),
      price_dkk: r.priceDkk,
      region,
      seller_hash: sellerHash(r.source, r.sellerId),
      is_dealer: r.isDealer ?? false,
      is_reference: r.isReference ?? false,
      last_seen: now,
      status: r.status ?? "active",
    };

    if (DRY_RUN) {
      console.log(`  [dry-run] listing ${key} @ ${r.priceDkk ?? "—"} DKK (${region ?? "?"})`);
      continue;
    }

    // Preserve first_seen: update if it exists, insert otherwise.
    const { data: existing } = await db()
      .from("listings")
      .select("id, price_dkk")
      .eq("source", r.source)
      .eq("source_listing_id", r.sourceListingId)
      .maybeSingle();

    let listingId: string;
    if (existing) {
      listingId = existing.id;
      const { error } = await db().from("listings").update(fields).eq("id", listingId);
      if (error) throw error;
    } else {
      const { data, error } = await db()
        .from("listings")
        .insert({ ...fields, first_seen: now })
        .select("id")
        .single();
      if (error) throw error;
      listingId = data.id;
    }

    const { error: snapErr } = await db().from("snapshots").insert({
      listing_id: listingId,
      observed_at: now,
      price_dkk: r.priceDkk,
      status: fields.status,
      edited_at: r.editedAt ?? null,
    });
    if (snapErr) throw snapErr;
  }

  await reconcileDisappeared(scrapedSources, seenKeys, now);
}

/** Mark active listings absent this run as gone, then age them to sold/expired. */
async function reconcileDisappeared(
  scrapedSources: SourceName[],
  seenKeys: Set<string>,
  now: string
): Promise<void> {
  if (DRY_RUN) return;

  const { data: actives, error } = await db()
    .from("listings")
    .select("id, source, source_listing_id, first_seen, status, is_reference")
    .in("source", scrapedSources)
    .in("status", ["active"]);
  if (error) throw error;

  for (const l of actives ?? []) {
    if (l.is_reference) continue;
    const key = `${l.source}:${l.source_listing_id}`;
    if (seenKeys.has(key)) continue;
    await db()
      .from("listings")
      .update({ status: "gone", disappeared_at: now })
      .eq("id", l.id);
  }

  // Age "gone" listings into likely_sold vs expired.
  const { data: gone } = await db()
    .from("listings")
    .select("id, source, first_seen, disappeared_at")
    .eq("status", "gone");

  const nowMs = Date.now();
  for (const l of gone ?? []) {
    if (!l.disappeared_at) continue;
    const goneDays = (nowMs - new Date(l.disappeared_at).getTime()) / DAY_MS;
    if (goneDays < SOLD_GRACE_DAYS) continue; // still within grace, leave as gone

    const lifetimeDays = (new Date(l.disappeared_at).getTime() - new Date(l.first_seen).getTime()) / DAY_MS;
    const expiry = EXPIRY_DAYS[l.source] ?? 60;
    // Vanished near the auto-expiry threshold => probably expired, not sold.
    const status = lifetimeDays >= expiry - 5 ? "expired" : "likely_sold";
    await db().from("listings").update({ status }).eq("id", l.id);
  }
  console.log(`  reconciled disappearances (grace ${SOLD_GRACE_DAYS}d)`);
}
