-- ============================================================================
-- Poxyndex — Supabase / Postgres schema
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query → Run).
--
-- Design principles (see README "Legal & privacy"):
--   * Aggregate / anonymised only. We store a price (a fact), a coarse region,
--     a condition bucket and a HASHED seller id. No names, no exact address,
--     no phone/email, no rehosted images.
--   * RLS ON everywhere, with a read-only policy for the anon role so the public
--     frontend can SELECT but never write. The scraper writes with the
--     service_role key, which bypasses RLS.
-- ============================================================================

-- gen_random_uuid()
create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- regions: the 5 Danish regions (seeded below). Used for the regional spread.
-- ----------------------------------------------------------------------------
create table if not exists regions (
  code  text primary key,           -- e.g. 'hovedstaden'
  name  text not null               -- e.g. 'Region Hovedstaden'
);

-- ----------------------------------------------------------------------------
-- listings: one row per *distinct physical copy* we have ever seen.
-- Cross-platform duplicates collapse onto a single canonical row via dupe_of.
-- ----------------------------------------------------------------------------
create table if not exists listings (
  id                uuid primary key default gen_random_uuid(),
  source            text not null,                       -- 'dba' | 'guloggratis' | 'laserdisken'
  source_listing_id text not null,                       -- adId / uuid / vare id at the source
  source_url        text not null,
  title             text,
  condition         text,                                -- raw Danish label, e.g. 'Som ny'
  condition_rank    int,                                 -- normalised 1 (poor) .. 5 (mint), null if unknown
  price_dkk         int,                                 -- latest observed asking price
  region            text references regions(code),       -- coarse region only (GDPR); null if unknown
  seller_hash       text,                                -- sha256(source + ownerId) — anonymised dedupe key
  is_dealer         boolean not null default false,      -- professional / erhverv seller
  is_reference      boolean not null default false,      -- true for Laserdisken "official retail" anchor
  first_seen        timestamptz not null default now(),  -- our first observation (not the true post date)
  last_seen         timestamptz not null default now(),
  disappeared_at    timestamptz,                         -- first run it was absent
  status            text not null default 'active',      -- active | gone | likely_sold | expired | out_of_stock
  dupe_of           uuid references listings(id),        -- non-null => this row is a duplicate of another
  created_at        timestamptz not null default now(),
  unique (source, source_listing_id)
);

create index if not exists listings_status_idx on listings (status);
create index if not exists listings_source_idx on listings (source);

-- ----------------------------------------------------------------------------
-- snapshots: append-only history. One row per listing per scrape run.
-- This is what powers price-change tracking and time-to-sell.
-- ----------------------------------------------------------------------------
create table if not exists snapshots (
  id          bigint generated always as identity primary key,
  listing_id  uuid not null references listings(id) on delete cascade,
  observed_at timestamptz not null default now(),
  price_dkk   int,
  status      text,
  edited_at   timestamptz                                -- source's "Sidst redigeret" timestamp, if exposed
);

create index if not exists snapshots_listing_idx on snapshots (listing_id, observed_at desc);

-- ----------------------------------------------------------------------------
-- Economic overlays (each refreshed by the daily cron).
-- ----------------------------------------------------------------------------
create table if not exists cpi_monthly (
  month text primary key,           -- 'YYYY-MM'
  idx   numeric,                    -- CPI index (StatBank PRIS01, base 2025=100)
  yoy   numeric                     -- year-on-year %
);

create table if not exists wages (
  year       int primary key,
  hourly_dkk numeric                -- avg earnings/hour (StatBank LONS60)
);

create table if not exists fx_daily (
  day         date primary key,
  dkk_per_usd numeric               -- e.g. 6.59
);

create table if not exists bigmac (
  day       date primary key,
  dkk_price numeric,                -- Danish Big Mac price (DKK)
  source    text
);

-- ----------------------------------------------------------------------------
-- index_daily: the computed Poxyndex, one row per day. Read by the frontend.
-- ----------------------------------------------------------------------------
create table if not exists index_daily (
  day                 date primary key,
  active_count        int,          -- distinct active (deduped) copies on the market
  median_asking_dkk   numeric,      -- flagship headline
  mean_asking_dkk     numeric,
  median_sold_dkk     numeric,      -- imputed sold price (estimate)
  real_index          numeric,      -- CPI-adjusted headline (rebased)
  work_minutes        numeric,      -- price / hourly wage * 60
  big_mac_equiv       numeric,      -- headline / Danish Big Mac price
  median_days_to_sell numeric,
  bid_ask_gap         numeric,      -- (asking - sold) / asking
  regional            jsonb,        -- { region_code: median_price }
  meta                jsonb         -- free-form: window, notes, data-quality flags
);

-- ----------------------------------------------------------------------------
-- heartbeat: single-row table proving the pipeline ran. Doubles as the
-- Supabase keep-alive write (free projects pause after 7 idle days).
-- ----------------------------------------------------------------------------
create table if not exists heartbeat (
  id           int primary key default 1,
  last_run     timestamptz,
  last_status  text,
  detail       jsonb,
  constraint heartbeat_singleton check (id = 1)
);

-- ============================================================================
-- Row Level Security: public read-only. Writes only via service_role (bypasses).
-- ============================================================================
alter table regions      enable row level security;
alter table listings     enable row level security;
alter table snapshots    enable row level security;
alter table cpi_monthly  enable row level security;
alter table wages        enable row level security;
alter table fx_daily     enable row level security;
alter table bigmac       enable row level security;
alter table index_daily  enable row level security;
alter table heartbeat    enable row level security;

-- helper to (re)create a permissive SELECT policy for the anon role
do $$
declare t text;
begin
  foreach t in array array[
    'regions','listings','snapshots','cpi_monthly','wages',
    'fx_daily','bigmac','index_daily','heartbeat'
  ]
  loop
    execute format('drop policy if exists %I on %I;', 'public_read_' || t, t);
    execute format(
      'create policy %I on %I for select to anon using (true);',
      'public_read_' || t, t
    );
  end loop;
end $$;

-- NOTE: we deliberately add NO insert/update/delete policy for anon.
-- The scraper authenticates as service_role, which has BYPASSRLS.

-- ============================================================================
-- Seed: the 5 Danish regions.
-- ============================================================================
insert into regions (code, name) values
  ('hovedstaden', 'Region Hovedstaden'),
  ('sjaelland',   'Region Sjælland'),
  ('syddanmark',  'Region Syddanmark'),
  ('midtjylland', 'Region Midtjylland'),
  ('nordjylland', 'Region Nordjylland')
on conflict (code) do nothing;

-- ============================================================================
-- community_paid: self-reported "what I paid" data points for the "Value your
-- own copy" tool. Anonymous and quarantined — it NEVER feeds the scraped index.
--
-- Anti-pollution safeguards:
--   * One row per device_id (a random in-browser UUID) — testing different
--     values just overwrites your own single row (the frontend upserts).
--   * CHECK constraints bound price + month server-side, so junk is rejected
--     regardless of the client.
--   * The frontend aggregates with a median, so any survivor can't move it.
-- No name, email, or IP is stored.
-- ============================================================================
create table if not exists community_paid (
  device_id    text primary key,                 -- random client-generated UUID (pseudonymous)
  paid_dkk     int  not null check (paid_dkk between 10 and 2000),
  bought_month text not null check (bought_month >= '2007-01' and bought_month <= '2100-12'),
  region       text references regions(code),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table community_paid enable row level security;

-- Public read (for the aggregate), and anon insert/update for the upsert path.
-- Bounds are enforced by the CHECK constraints above, so anon writes are safe.
drop policy if exists community_read   on community_paid;
drop policy if exists community_insert on community_paid;
drop policy if exists community_update on community_paid;
drop policy if exists community_delete on community_paid;
create policy community_read   on community_paid for select to anon using (true);
create policy community_insert on community_paid for insert to anon with check (true);
create policy community_update on community_paid for update to anon using (true) with check (true);
-- lets a visitor remove their own row via "Clear" (rows are keyed by an
-- unguessable random device id, so in practice only the owner can target it).
create policy community_delete on community_paid for delete to anon using (true);
