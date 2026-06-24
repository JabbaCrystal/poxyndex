import * as cheerio from "cheerio";
import { GULOGGRATIS, SEARCH_QUERIES, MATCH_SUBSTRING } from "../config.js";
import { politeFetch } from "../util.js";
import type { RawListing, ScrapeResult } from "../types.js";

/**
 * Gul og Gratis (guloggratis.dk).
 *
 * Recon: fully permissive robots.txt, server-rendered HTML, no JSON-LD.
 * Search /s/q-<query>/ 301-redirects to /kategori/q-<query>. Listing cards
 * expose price ("NNN kr."), postal+city, relative date, title, badges.
 * Item URL: /annonce/<uuid>/<slug>.
 *
 * NOTE: CSS selectors below are best-effort from recon and are the most
 * likely thing to need a tweak if GoG changes its markup — they are isolated
 * here on purpose.
 */
export async function scrapeGulOgGratis(): Promise<ScrapeResult> {
  const seen = new Set<string>();
  const out: RawListing[] = [];
  let ok = false;

  for (const q of SEARCH_QUERIES) {
    const html = await politeFetch(GULOGGRATIS.search(q));
    if (!html) continue;
    ok = true;
    const $ = cheerio.load(html);

    // Each result links to /annonce/<uuid>/<slug>
    $('a[href*="/annonce/"]').each((_, el) => {
      const href = $(el).attr("href") ?? "";
      const uuid = href.match(/\/annonce\/([0-9a-f-]{16,})/i)?.[1];
      if (!uuid || seen.has(uuid)) return;

      // Walk up to the card container to read sibling fields.
      const card = $(el).closest("article, li, div");
      const cardText = card.text();
      const title = $(el).text().trim() || card.find("h2,h3").first().text().trim();

      if (!title.toLowerCase().includes(MATCH_SUBSTRING)) return;
      seen.add(uuid);

      const priceMatch = cardText.match(/(\d[\d.]*)\s*kr\.?/i);
      const priceDkk = priceMatch
        ? Math.round(Number(priceMatch[1]!.replace(/\./g, "")))
        : null;
      const postal = cardText.match(/\b(\d{4})\b/)?.[1] ?? null;

      out.push({
        source: "guloggratis",
        sourceListingId: uuid,
        sourceUrl: href.startsWith("http")
          ? href
          : `https://www.guloggratis.dk${href}`,
        title,
        priceDkk,
        postalCode: postal,
        status: "active",
      });
    });
  }
  if (!ok) {
    console.warn("  guloggratis: search unreachable this run — skipping");
    return { ok: false, listings: [] };
  }
  console.log(`  guloggratis: ${out.length} listing(s)`);
  return { ok: true, listings: out };
}
