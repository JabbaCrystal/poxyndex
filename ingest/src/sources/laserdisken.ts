import * as cheerio from "cheerio";
import { LASERDISKEN } from "../config.js";
import { politeFetch } from "../util.js";
import type { ScrapeResult } from "../types.js";

/**
 * Laserdisken.dk — the "official retail" anchor.
 *
 * This is NOT live second-hand supply. It's a single reference row so the
 * frontend can deadpan "official retail price: unobtainable" — the title is
 * out of print and shows as "Udgået" (discontinued). If a price is present we
 * record it as the historical retail reference; otherwise null.
 */
const OUT_OF_STOCK_SIGNALS = [
  "udgået",
  "udsolgt",
  "ikke på lager",
  "kan ikke længere leveres",
  "påmind mig",
];

export async function scrapeLaserdisken(): Promise<ScrapeResult> {
  const html = await politeFetch(LASERDISKEN.product);
  if (!html) return { ok: false, listings: [] };

  const $ = cheerio.load(html);
  const text = $("body").text().toLowerCase();
  const outOfStock = OUT_OF_STOCK_SIGNALS.some((s) => text.includes(s));

  // Out of print => no meaningful retail price. Only record a price if it is
  // genuinely in stock (otherwise "unobtainable new" is the whole point).
  const priceMatch = $("body").text().match(/(\d[\d.]*)\s*(?:,-|kr)/i);
  const priceDkk =
    !outOfStock && priceMatch
      ? Math.round(Number(priceMatch[1]!.replace(/\./g, ""))) || null
      : null;

  return {
    ok: true,
    listings: [
      {
        source: "laserdisken",
        sourceListingId: "ref-laserdisken",
        sourceUrl: LASERDISKEN.product,
        title: "Mr. Poxycat & Co. (Laserdisken)",
        priceDkk,
        isReference: true,
        status: outOfStock ? "out_of_stock" : "active",
      },
    ],
  };
}
