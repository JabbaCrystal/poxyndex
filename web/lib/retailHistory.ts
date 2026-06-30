// Verified historical price anchors for the DVD — each a dated, individually
// sourced data point. Two kinds:
//   - "retail":     the price when the disc could still be bought NEW
//                   (Internet Archive / Wayback snapshots of old webshop pages).
//   - "secondhand": a dated second-hand price pulled from a public forum or
//                   marketplace mention — someone reporting what a copy sold for,
//                   or its live asking price, with the post date pinning the time.
//
// Clean machine-readable SOLD history does NOT exist for this title (DBA listings
// are ephemeral and were never archived), so these hand-verified mentions are the
// only trustworthy historical layer. This is a MANUAL, research-seeded list — NOT a
// runtime scrape: lifting "price + date + sold/asking" out of free-text posts needs
// human judgement, and we keep no AI in the update loop. Add anchors only when the
// price and date are both verifiable from the linked source.

export type AnchorKind = "retail" | "secondhand";

export interface PriceAnchor {
  year: number;
  month?: number; // 1–12, when the source pins the month
  price: number; // DKK
  kind: AnchorKind;
  sold?: boolean; // secondhand only: true = a completed sale, false = a live asking price
  source: string; // human label of where it came from
  sourceUrl?: string; // link to the exact page/snapshot
  note?: string; // short context, kept close to the source wording
}

export const PRICE_ANCHORS: PriceAnchor[] = [
  {
    year: 2011,
    price: 99,
    kind: "retail",
    source: "Laserdisken",
    sourceUrl:
      "https://web.archive.org/web/20110714224401/http://www.laserdisken.dk/html/visvare.dna?vare=12163039245611063",
    note: "Pris 99,00 kr · kunne stadig bestilles ny (Wayback)",
  },
  {
    year: 2024,
    month: 11,
    price: 250,
    kind: "secondhand",
    sold: true,
    source: "recordere.dk",
    sourceUrl: "https://forum.recordere.dk/k-mr-poxycat_topic166991.html",
    note: "To eksemplarer solgt på DBA á 250 kr — køber nåede ikke at reagere",
  },
];

/** Anchors sorted oldest → newest. */
export const ANCHORS_BY_DATE: PriceAnchor[] = [...PRICE_ANCHORS].sort(
  (a, b) => a.year - b.year || (a.month ?? 0) - (b.month ?? 0),
);
