export interface IndexDaily {
  day: string;
  active_count: number | null;
  median_asking_dkk: number | null;
  mean_asking_dkk: number | null;
  median_sold_dkk: number | null;
  real_index: number | null;
  work_minutes: number | null;
  big_mac_equiv: number | null;
  median_days_to_sell: number | null;
  bid_ask_gap: number | null;
  regional: Record<string, number> | null;
  meta: {
    sold_n?: number;
    cpi_idx?: number | null;
    hourly_wage?: number | null;
    bigmac_dkk?: number | null;
    note?: string | null;
  } | null;
}

export interface PublicListing {
  id: string;
  source: string;
  source_url: string;
  condition: string | null;
  price_dkk: number | null;
  region: string | null;
  status: string;
  first_seen: string;
  is_reference: boolean;
}

export interface Heartbeat {
  last_run: string | null;
  last_status: string | null;
}

export const REGION_NAMES: Record<string, string> = {
  hovedstaden: "Hovedstaden",
  sjaelland: "Sjælland",
  syddanmark: "Syddanmark",
  midtjylland: "Midtjylland",
  nordjylland: "Nordjylland",
};
