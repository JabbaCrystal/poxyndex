// Shared types for the ingest pipeline.

export type SourceName = "dba" | "guloggratis" | "laserdisken";

export type RegionCode =
  | "hovedstaden"
  | "sjaelland"
  | "syddanmark"
  | "midtjylland"
  | "nordjylland";

/**
 * A normalised observation of a listing from a single scrape.
 * This is the common shape every source scraper must return.
 */
export interface RawListing {
  source: SourceName;
  sourceListingId: string;
  sourceUrl: string;
  title: string;
  priceDkk: number | null;
  condition?: string | null;
  /** raw postal code, used only to derive a coarse region — never stored. */
  postalCode?: string | null;
  /** raw seller id at the source, used only to build an anonymised hash. */
  sellerId?: string | null;
  /** source's own "last edited" timestamp, if exposed. */
  editedAt?: string | null;
  isDealer?: boolean;
  /** true for the Laserdisken "official retail" anchor (not live C2C supply). */
  isReference?: boolean;
  /** for reference rows: out_of_stock; otherwise active. */
  status?: ListingStatus;
}

export type ListingStatus =
  | "active"
  | "gone"
  | "likely_sold"
  | "expired"
  | "out_of_stock";

export interface DbListingRow {
  id: string;
  source: SourceName;
  source_listing_id: string;
  price_dkk: number | null;
  region: RegionCode | null;
  condition_rank: number | null;
  status: ListingStatus;
  first_seen: string;
  last_seen: string;
  disappeared_at: string | null;
  dupe_of: string | null;
  is_reference: boolean;
}
