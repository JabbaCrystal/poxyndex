# The Poxyndex 🐱📀

A Big Mac Index for **_Mr. Poxycat & Co._** — the out-of-print Danish DVD
(IMDB [tt1042458](https://www.imdb.com/title/tt1042458/), 2007, Nordisk Film).
It tracks the second-hand price of arguably Denmark's least liquid asset across
Danish marketplaces and tells a small, deadpan story about prices, wages and
regional differences.

It is **fully automated and free to run**: a daily GitHub Action scrapes the
data into Supabase, and a static Next.js site reads it. No server, and **no AI
tokens are spent to run or update it** — you only spent them building it.

```
 GitHub Actions (cron, daily)              Supabase (Postgres)        Vercel (static)
 ┌───────────────────────────┐   write    ┌──────────────────┐  read  ┌──────────────┐
 │ ingest/  (TypeScript)      │ ─────────▶ │ listings/snaps   │ ◀───── │ web/ (Next)  │
 │  DBA · GoG · Laserdisken   │  service   │ index_daily      │  anon  │  dashboard   │
 │  + CPI/wage/FX/Big Mac     │  key       │ cpi/wages/fx/... │  key   │  charts      │
 │  + dedupe + index calc     │            │ (RLS: read-only) │        │  DK/world    │
 └───────────────────────────┘            └──────────────────┘        └──────────────┘
```

---

## Repo layout

| Path | What |
|------|------|
| `db/schema.sql` | Postgres schema + RLS policies + region seed. Run once in Supabase. |
| `ingest/` | TypeScript daily job: scrapers, economic-data fetchers, dedupe, index calc. |
| `web/` | Next.js (static export) public dashboard. |
| `.github/workflows/daily.yml` | The daily cron that runs `ingest/`. |

---

## What you need to do (one-time setup, ~30 min)

Everything below is clicking through free dashboards + pasting keys. No coding.

### 1. Put this on GitHub (public repo = unlimited free Actions)

```bash
cd poxyndex
git init && git add . && git commit -m "Initial Poxyndex"
gh repo create poxyndex --public --source=. --push   # or create it in the UI
```

> Keep it **public** for free unlimited Actions minutes, and make a commit every
> ~6–8 weeks — GitHub auto-disables scheduled workflows after 60 days of repo
> inactivity.

### 2. Create the Supabase project

1. [supabase.com](https://supabase.com) → **New project** (free tier). Pick the
   EU (Frankfurt) region.
2. **SQL Editor → New query** → paste all of [`db/schema.sql`](db/schema.sql) → **Run**.
3. **Project Settings → API**, copy three values:
   - Project URL → `SUPABASE_URL` **and** `NEXT_PUBLIC_SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_KEY` *(secret! server only)*
   - `anon` / publishable key → `NEXT_PUBLIC_SUPABASE_ANON_KEY` *(safe for browser)*

### 3. Wire up the daily scraper (GitHub Actions)

In the repo: **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Value |
|--------|-------|
| `SUPABASE_URL` | your project URL |
| `SUPABASE_SERVICE_KEY` | the `service_role` key |

Then **Actions tab → poxyndex-daily → Run workflow** to do the first run now
(don't wait for 05:23 UTC). Check Supabase → Table editor → `heartbeat` to
confirm it wrote.

### 4. Deploy the website (Vercel)

1. [vercel.com](https://vercel.com) → **Add New → Project** → import the repo.
2. Set **Root Directory** to `web`.
3. Add env vars `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. **Deploy.** Done — that's your public Poxyndex.

> Vercel's free Hobby plan is non-commercial only (which matches this project).
> If you ever add ads/affiliate links, move `web/` to Cloudflare Pages or Netlify.

---

## Running locally (optional)

```bash
# scraper — dry run prints what it would write, touches nothing
cd ingest && npm install
cp ../.env.example .env        # fill in SUPABASE_URL + SUPABASE_SERVICE_KEY
npm run ingest:dry             # safe preview
npm run ingest                 # real run (writes to Supabase)

# website
cd ../web && npm install
cp .env.local.example .env.local   # fill in the two NEXT_PUBLIC_ vars
npm run dev                    # http://localhost:3000
```

---

## How it works

**Sources** (each isolated in `ingest/src/sources/` — a site changing its markup
is a one-file fix):
- **DBA.dk** — primary. Plain HTTP, server-rendered, parses `schema.org` JSON-LD.
- **Gul og Gratis** — secondary C2C source.
- **Laserdisken** — the "official retail = unobtainable" anchor (out of print).

**Sold / velocity** — there is no public "solgt" badge, so we infer it: a listing
that disappears and stays gone past a grace window (`SOLD_GRACE_DAYS`, default 14)
is treated as sold at its last asking price. Disappearances near a site's
auto-expiry window are flagged as expired instead. All sold figures are estimates.

**Dedupe** — the same copy cross-posted on DBA + Gul og Gratis is collapsed to one
row using region + price band + title similarity + hashed seller id.

**The metrics** (`index_daily`, recomputed daily):
Headline median asking price · CPI-adjusted "real" price · Poxycat work-minutes ·
price in Big Macs · regional spread · scarcity (active count) · velocity (days to
sell) · bid–ask gap.

**Economic overlays** — Statistics Denmark StatBank (CPI `PRIS01`, wages `LONS60`),
Nationalbanken FX, and The Economist's open Big Mac data. Each falls back
gracefully so a flaky API never breaks the run.

---

## Legal & privacy (read me)

A 2025 Danish ruling (*BoligPortal v. ReData*) makes marketplace scraping a real
risk area. This project is built to stay defensible:

- **Aggregate/anonymised only** — store a price, a coarse region, a condition
  bucket, a hashed listing id. **Never** seller names, exact addresses, contact
  info, or rehosted images.
- **Non-commercial**, low request rate, honest `User-Agent` with a contact email
  (set it in `ingest/src/config.ts`), and each source is individually
  switch-off-able.
- A public **methodology/privacy page** is included at `/methodology` with an
  erasure contact. Update the email there and in `config.ts` before going live.

This is not legal advice; if DBA objects, drop the source.

---

## Roadmap / nice-to-haves

- Perceptual image hashing (pHash) for stronger cross-platform dedupe.
- DAWA (`api.dataforsyningen.dk`) for exact postcode→region accuracy.
- A Vinted source (needs a managed scraping API — DataDome blocks GitHub IPs).
- Condition-adjusted "hedonic" index once enough copies have sold.
- A failure alert (the cron emails you on failure by default; add a webhook if you want).
```

> ⚠️ Reality check: as of build time there was exactly **one** genuine copy for
> sale in all of Denmark. The dashboard is designed to look right with sparse
> data and grow more interesting as history accumulates. Patience — it's a rare DVD.
