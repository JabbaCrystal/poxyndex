// Central configuration. Keep all source URLs and tunables here so a site
// changing its markup is a one-file fix (low maintenance).

export const DRY_RUN = process.env.DRY_RUN === "1";

// Polite identification — honest UA with a real contact, per our legal posture.
export const USER_AGENT =
  "PoxyndexBot/0.1 (+https://github.com/JabbaCrystal/poxyndex; non-commercial price index; contact: jabbacrystal@gmail.com)";

export const REQUEST_HEADERS: Record<string, string> = {
  "User-Agent": USER_AGENT,
  "Accept-Language": "da-DK,da;q=0.9,en;q=0.8",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

// Be gentle: one request every few seconds. Rare DVD => tiny crawl.
export const POLITE_DELAY_MS = 3000;

// The thing we are tracking. "poxycat" is a clean, near-unique substring:
// "epoxy" and "pussycat" do NOT contain it, so it filters keyword noise well.
export const MATCH_SUBSTRING = "poxycat";
export const SEARCH_QUERIES = ["poxycat", "mr poxycat", "poxycat dvd"];

export const DBA = {
  search: (q: string, page = 1) =>
    `https://www.dba.dk/recommerce/forsale/search?q=${encodeURIComponent(q)}&page=${page}`,
  item: (adId: string) => `https://www.dba.dk/recommerce/forsale/item/${adId}`,
};

export const GULOGGRATIS = {
  search: (q: string) =>
    `https://www.guloggratis.dk/s/q-${encodeURIComponent(q)}/`,
};

// Laserdisken catalogue page for the title (the "official retail" anchor).
export const LASERDISKEN = {
  product: "https://www.laserdisken.dk/html/visvare.dna?vare=12163039245611063",
};

// Day-count after which an absent listing is treated as sold rather than
// "temporarily missing". Calibrate against real disappearances over time.
export const SOLD_GRACE_DAYS = 14;

// Source auto-expiry windows (used to distinguish sold vs auto-expired).
export const EXPIRY_DAYS: Record<string, number> = {
  dba: 60, // inactive ads auto-deleted after ~2 months
  guloggratis: 56, // ~8 weeks
};

// Rebase date for the real (CPI-adjusted) index line. First day with data.
export const REAL_INDEX_BASE_LABEL = "launch";
