import * as cheerio from "cheerio";
import { DBA, SEARCH_QUERIES, MATCH_SUBSTRING } from "../config.js";
import { politeFetch } from "../util.js";
import type { RawListing } from "../types.js";

/**
 * DBA.dk (Adevinta "recommerce" platform).
 *
 * Recon (2026-06): pages are fully server-rendered HTML, no DataDome/captcha,
 * plain GET returns 200. Each listing page carries a schema.org/Product JSON-LD
 * block (stable, primary parse target) plus an embedded SSR-state JSON with
 * meta.ownerId / meta.edited / meta.isInactive (best-effort, via regex).
 *
 * Search: https://www.dba.dk/recommerce/forsale/search?q=<q>&page=<n>
 * Item:   https://www.dba.dk/recommerce/forsale/item/<adId>
 */

/** Collect candidate adIds from the search pages for all query variants. */
async function discoverAdIds(): Promise<Set<string>> {
  const ids = new Set<string>();
  for (const q of SEARCH_QUERIES) {
    const html = await politeFetch(DBA.search(q));
    if (!html) continue;
    // Cards link to /recommerce/forsale/item/<digits>
    for (const m of html.matchAll(/forsale\/item\/(\d+)/g)) {
      ids.add(m[1]!);
    }
  }
  return ids;
}

interface JsonLdProduct {
  "@type"?: string;
  sku?: string;
  name?: string;
  offers?: { price?: string | number; priceCurrency?: string };
}

function extractJsonLdProduct(html: string): JsonLdProduct | null {
  const $ = cheerio.load(html);
  const blocks = $('script[type="application/ld+json"]')
    .map((_, el) => $(el).contents().text())
    .get();
  for (const raw of blocks) {
    try {
      const parsed = JSON.parse(raw);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      for (const node of arr) {
        if (node && node["@type"] === "Product") return node as JsonLdProduct;
      }
    } catch {
      /* ignore malformed block */
    }
  }
  return null;
}

/** Best-effort scrape of fields the JSON-LD omits, from the SSR-state blob. */
function extractStateFields(html: string) {
  const ownerId = html.match(/"ownerId":\s*(\d+)/)?.[1] ?? null;
  const edited = html.match(/"edited":\s*"([^"]+)"/)?.[1] ?? null;
  const isInactive = /"isInactive":\s*true/.test(html);
  // Danish condition label, e.g. "Som ny - ingen synlige brugsspor"
  const condition =
    html.match(/"name":"condition"[^}]*?"value":"([^"]+)"/)?.[1] ??
    cheerioCondition(html);
  return { ownerId, edited, isInactive, condition };
}

function cheerioCondition(html: string): string | null {
  const $ = cheerio.load(html);
  // The "Stand" attribute row, when present.
  let found: string | null = null;
  $("dt,span,div").each((_, el) => {
    const t = $(el).text().trim();
    if (/^Stand$/i.test(t)) {
      found = $(el).next().text().trim() || null;
    }
  });
  return found;
}

function extractPostalCity(html: string): string | null {
  const $ = cheerio.load(html);
  const addr = $('[data-testid="object-address"]').first().text().trim();
  return addr || html.match(/postalCode=(\d{4})/)?.[1] || null;
}

export async function scrapeDba(): Promise<RawListing[]> {
  const ids = await discoverAdIds();
  console.log(`  dba: ${ids.size} candidate ad(s)`);
  const out: RawListing[] = [];

  for (const adId of ids) {
    const url = DBA.item(adId);
    const html = await politeFetch(url);
    if (!html) continue;

    const ld = extractJsonLdProduct(html);
    const title = ld?.name ?? cheerio.load(html)("title").text().split("|")[0]?.trim() ?? "";

    // Strict relevance filter to drop epoxy / pussycat / cats noise.
    if (!title.toLowerCase().includes(MATCH_SUBSTRING)) continue;

    const state = extractStateFields(html);
    const priceRaw = ld?.offers?.price;
    const priceDkk =
      priceRaw != null ? Math.round(Number(String(priceRaw).replace(/[^\d]/g, ""))) : null;

    out.push({
      source: "dba",
      sourceListingId: adId,
      sourceUrl: url,
      title,
      priceDkk: Number.isFinite(priceDkk!) ? priceDkk : null,
      condition: state.condition,
      postalCode: extractPostalCity(html),
      sellerId: state.ownerId,
      editedAt: state.edited,
      status: state.isInactive ? "gone" : "active",
    });
  }
  console.log(`  dba: ${out.length} genuine Poxycat listing(s)`);
  return out;
}
