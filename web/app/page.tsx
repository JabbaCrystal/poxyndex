"use client";

import { useEffect, useState } from "react";
import { Header, type Market } from "@/components/Header";
import { MetricCard } from "@/components/MetricCard";
import { HeadlineChart } from "@/components/HeadlineChart";
import { RegionSpread } from "@/components/RegionSpread";
import { SupplyList } from "@/components/SupplyList";
import { DiscHero } from "@/components/DiscHero";
import { Sparkles } from "@/components/Sparkles";
import {
  fetchActiveListings,
  fetchHeartbeat,
  fetchIndexHistory,
  fetchLatestFx,
  isConfigured,
} from "@/lib/supabase";
import type { IndexDaily, PublicListing, Heartbeat } from "@/lib/types";

// SpaceX is private; this is its implied secondary-market price per share
// (~$220, late-2025 tender chatter). Clearly labelled as implied on the card.
const SPACEX_USD_PER_SHARE = 220;
const FX_FALLBACK = 6.9; // DKK per USD if the FX row isn't loaded yet

export default function Page() {
  const [market, setMarket] = useState<Market>("dk");
  const [history, setHistory] = useState<IndexDaily[]>([]);
  const [listings, setListings] = useState<PublicListing[]>([]);
  const [heartbeat, setHeartbeat] = useState<Heartbeat | null>(null);
  const [fx, setFx] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConfigured) {
      setError("Live data isn’t connected in this environment.");
      return;
    }
    Promise.all([fetchIndexHistory(), fetchActiveListings(), fetchHeartbeat(), fetchLatestFx()])
      .then(([h, l, hb, f]) => {
        setHistory(h);
        setListings(l);
        setHeartbeat(hb);
        setFx(f);
      })
      .catch((e) => setError(e.message));
  }, []);

  const latest = history.at(-1) ?? null;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Header market={market} setMarket={setMarket} />

      <div className="relative z-10 mx-auto max-w-5xl px-5 pb-16">
        {market === "world" ? (
          <RestOfWorld />
        ) : (
          <>
            <Hero latest={latest} />
            {error && (
              <div className="mx-auto mb-6 max-w-md rounded-full border border-white/10 bg-white/5 px-4 py-2 text-center text-xs text-muted">
                {error}
              </div>
            )}
            <Metrics latest={latest} fx={fx} />
            <section className="mt-6">
              <HeadlineChart history={history} />
            </section>
            <section className="mt-6 grid gap-6 lg:grid-cols-2">
              <RegionSpread regional={latest?.regional ?? null} national={latest?.median_asking_dkk ?? null} />
              <SupplyList listings={listings} />
            </section>
          </>
        )}
      </div>

      <Footer heartbeat={heartbeat} />
    </main>
  );
}

function Hero({ latest }: { latest: IndexDaily | null }) {
  const median = latest?.median_asking_dkk ?? null;
  const count = latest?.active_count ?? 0;

  return (
    <section className="relative pt-8 text-center">
      <DiscHero />
      <h1 className="mt-4 font-serif text-5xl font-bold tracking-tight sm:text-6xl">
        The <span className="iri-text">Poxyndex</span>
      </h1>
      <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
        A price index for <em>Mr. Poxycat &amp; Co.</em> — the out-of-print Danish
        DVD. Tracking the second-hand value of the nation&apos;s least liquid asset.
      </p>

      <div className="mt-7">
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
          Headline price
        </div>
        <div className="tabular mt-1 font-serif text-7xl font-bold leading-none">
          <span className="iri-text">{median != null ? Math.round(median) : "—"}</span>
          <span className="ml-2 align-top text-2xl text-muted">kr</span>
        </div>
        <div className="mt-2 text-sm text-muted">
          {count} {count === 1 ? "copy" : "copies"} on the market in Denmark
        </div>
      </div>

      {latest?.meta?.note && (
        <div className="mx-auto mt-5 inline-block rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-muted">
          ⚠️ {latest.meta.note}
        </div>
      )}
      <hr className="iri-hr mx-auto mt-8 max-w-xs opacity-60" />
    </section>
  );
}

function Metrics({ latest, fx }: { latest: IndexDaily | null; fx: number | null }) {
  const median = latest?.median_asking_dkk ?? null;
  const workMin = latest?.work_minutes ?? null;
  const velocity = latest?.median_days_to_sell ?? null;
  const gap = latest?.bid_ask_gap ?? null;
  const real = latest?.real_index ?? null;
  const spacexShares =
    median != null ? median / (SPACEX_USD_PER_SHARE * (fx ?? FX_FALLBACK)) : null;

  return (
    <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <MetricCard
        label="In SpaceX shares"
        value={spacexShares != null ? spacexShares.toFixed(2) : "—"}
        sub="at implied private valuation"
        icon="🚀"
      />
      <MetricCard
        label="Work to afford one"
        value={workMin != null ? formatWorkTime(workMin) : "—"}
        sub="at the average Danish wage"
        icon="⏱️"
      />
      <MetricCard
        label="In 2025-kroner"
        value={real != null ? Math.round(real).toString() : "—"}
        unit="kr"
        sub="CPI-adjusted (real)"
        icon="📉"
      />
      <MetricCard
        label="Median time to sell"
        value={velocity != null ? `${Math.round(velocity)}` : "—"}
        unit="days"
        sub={gap != null ? `${Math.round(gap * 100)}% bid–ask gap` : "awaiting sales"}
        icon="⏳"
      />
    </section>
  );
}

function RestOfWorld() {
  return (
    <div className="relative flex min-h-[60vh] flex-col items-center justify-center text-center">
      <Sparkles count={14} />
      <div className="font-serif text-8xl font-bold text-white/10">0</div>
      <h2 className="mt-4 font-serif text-2xl font-bold">No listings found</h2>
      <p className="mt-2 max-w-md text-muted">
        The Poxycat economy has not yet gone global. Outside Denmark,{" "}
        <em>Mr. Poxycat &amp; Co.</em> trades at an implied price of{" "}
        <span className="iri-text font-bold">∞</span> — there is simply none to be had.
      </p>
      <p className="mt-4 text-sm text-muted">Switch back to 🇩🇰 Denmark for actual data.</p>
    </div>
  );
}

function Footer({ heartbeat }: { heartbeat: Heartbeat | null }) {
  return (
    <footer className="relative z-10 border-t border-white/5">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-5 py-6 text-xs text-muted sm:flex-row sm:justify-between">
        <p>
          A non-commercial curiosity. Aggregated, anonymised data.{" "}
          <a href="/methodology" className="hover:underline" style={{ color: "#57E0FF" }}>
            Methodology &amp; privacy →
          </a>
        </p>
        <p>
          {heartbeat?.last_run
            ? `Last updated ${new Date(heartbeat.last_run).toLocaleString("en-DK")}`
            : "Awaiting first update"}
        </p>
      </div>
    </footer>
  );
}

function formatWorkTime(minutes: number): string {
  if (minutes < 90) return `${Math.round(minutes)} min`;
  return `${(minutes / 60).toFixed(1)} hr`;
}
