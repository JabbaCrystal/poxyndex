// Verified historical RETAIL prices — when the DVD could still be bought new.
// Sourced from the Internet Archive (Wayback Machine). Sparse by nature: clean
// historical SECOND-HAND / sold data does not exist for this title (marketplace
// listings are ephemeral and were never web-archived), so this is the only
// trustworthy historical price layer. Add anchors here if more are verified.

export interface RetailAnchor {
  year: number;
  price: number; // DKK
  source: string;
  sourceUrl?: string; // Wayback snapshot
}

export const RETAIL_ANCHORS: RetailAnchor[] = [
  {
    year: 2011,
    price: 99,
    source: "Laserdisken",
    sourceUrl:
      "https://web.archive.org/web/20110714224401/http://www.laserdisken.dk/html/visvare.dna?vare=12163039245611063",
  },
];

/** Most recent verified retail anchor, or null. */
export const LATEST_RETAIL: RetailAnchor | null =
  RETAIL_ANCHORS.length > 0 ? RETAIL_ANCHORS[RETAIL_ANCHORS.length - 1]! : null;
