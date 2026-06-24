import { createHash } from "node:crypto";
import { REQUEST_HEADERS, POLITE_DELAY_MS } from "./config.js";
import type { RegionCode } from "./types.js";

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Fetch a URL with polite headers + a small delay. Returns text, or null on error/404. */
export async function politeFetch(url: string): Promise<string | null> {
  await sleep(POLITE_DELAY_MS);
  try {
    const res = await fetch(url, { headers: REQUEST_HEADERS, redirect: "follow" });
    if (!res.ok) {
      console.warn(`  fetch ${res.status} ${url}`);
      return null;
    }
    return await res.text();
  } catch (err) {
    console.warn(`  fetch error ${url}: ${(err as Error).message}`);
    return null;
  }
}

/** Returns the HTTP status only (used for sold/disappearance detection). */
export async function fetchStatus(url: string): Promise<number> {
  await sleep(POLITE_DELAY_MS);
  try {
    const res = await fetch(url, { headers: REQUEST_HEADERS, redirect: "manual" });
    return res.status;
  } catch {
    return 0;
  }
}

/** Anonymise a seller id: stable hash, never reversible to a person. */
export function sellerHash(source: string, sellerId: string | null | undefined): string | null {
  if (!sellerId) return null;
  return createHash("sha256").update(`${source}:${sellerId}`).digest("hex").slice(0, 32);
}

/**
 * Map a Danish postal code to one of the 5 regions.
 * NOTE: this is an APPROXIMATE range mapping (7xxx/6xxx straddle borders).
 * Good enough for the regional gag; upgrade to DAWA (api.dataforsyningen.dk)
 * if you need exact kommune→region accuracy.
 */
export function postalToRegion(postal: string | null | undefined): RegionCode | null {
  if (!postal) return null;
  const n = parseInt(postal.replace(/\D/g, "").slice(0, 4), 10);
  if (!Number.isFinite(n)) return null;
  if (n >= 1000 && n <= 3699) return "hovedstaden";
  if (n >= 3700 && n <= 3799) return "hovedstaden"; // Bornholm
  if (n >= 4000 && n <= 4999) return "sjaelland";
  if (n >= 5000 && n <= 5999) return "syddanmark"; // Funen + islands
  if (n >= 6000 && n <= 6999) return "syddanmark";
  if (n >= 7000 && n <= 7999) return "midtjylland";
  if (n >= 8000 && n <= 8999) return "midtjylland";
  if (n >= 9000 && n <= 9999) return "nordjylland";
  return null;
}

/** Normalise a Danish condition label to a 1..5 rank (5 = mint). */
export function conditionRank(label: string | null | undefined): number | null {
  if (!label) return null;
  const s = label.toLowerCase();
  if (s.includes("som ny") || s.includes("helt ny") || s.includes("ny ")) return 5;
  if (s.includes("god men brugt") || s.includes("rimelig")) return 3;
  if (s.includes("brugt")) return 3;
  if (s.includes("defekt") || s.includes("slidt")) return 1;
  if (s.includes("god")) return 4;
  return null;
}

export function median(values: number[]): number | null {
  const xs = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (xs.length === 0) return null;
  const mid = Math.floor(xs.length / 2);
  return xs.length % 2 ? xs[mid]! : (xs[mid - 1]! + xs[mid]!) / 2;
}

export function mean(values: number[]): number | null {
  const xs = values.filter((v) => Number.isFinite(v));
  if (xs.length === 0) return null;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

/** Token-set Jaccard similarity, for lightweight title matching in dedupe. */
export function titleSimilarity(a: string, b: string): number {
  const norm = (s: string) =>
    new Set(
      s
        .toLowerCase()
        .replace(/[^a-z0-9æøå ]/gi, " ")
        .split(/\s+/)
        .filter((t) => t.length > 1)
    );
  const sa = norm(a);
  const sb = norm(b);
  if (sa.size === 0 || sb.size === 0) return 0;
  let inter = 0;
  for (const t of sa) if (sb.has(t)) inter++;
  return inter / (sa.size + sb.size - inter);
}
