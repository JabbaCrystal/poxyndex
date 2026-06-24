"use client";

import { useEffect, useState } from "react";
import { Header, type Market } from "@/components/Header";
import { MetricCard } from "@/components/MetricCard";
import { HeadlineChart } from "@/components/HeadlineChart";
import { RegionSpread } from "@/components/RegionSpread";
import { SupplyList } from "@/components/SupplyList";
import {
  fetchActiveListings,
  fetchHeartbeat,
  fetchIndexHistory,
  isConfigured,
} from "@/lib/supabase";
import type { IndexDaily, PublicListing, Heartbeat } from "@/lib/types";

export default function Page() {
  const [market, setMarket] = useState<Market>("dk");
  const [history, setHistory] = useState<IndexDaily[]>([]);
  const [listings, setListings] = useState<PublicListing[]>([]);
  const [heartbeat, setHeartbeat] = useState<Heartbeat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConfigured) {
      setError("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY.");
      setLoading(false);
      return;
    }
    Promise.all([fetchIndexHistory(), fetchActiveListings(), fetchHeartbeat()])
      .then(([h, l, hb]) => {
        setHistory(h);
        setListings(l);
        setHeartbeat(hb);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const latest = history.at(-1) ?? null;

  return (
    <main className="min-h-screen">
      <Header market={market} setMarket={setMarket} />

      <div className="mx-auto max-w-5xl px-5 py-8">
        {market === "world" ? (
          <RestOfWorld />
        ) : loading ? (
          <p className="py-20 text-center text-poxy-muted">Loading the index…</p>
        ) : error ? (
          <p className="py-20 text-center text-poxy-red">{error}</p>
        ) : (
          <Dashboard latest={latest} history={history} listings={listings} />
        )}
      </div>

      <Footer heartbeat={heartbeat} />
    </main>
  );
}

function Dashboard({
  latest,
  history,
  listings,
}: {
  latest: IndexDaily | null;
  history: IndexDaily[];
  listings: PublicListing[];
}) {
  const median = latest?.median_asking_dkk ?? null;
  const bigMac = latest?.big_mac_equiv ?? null;
  const workMin = latest?.work_minutes ?? null;
  const count = latest?.active_count ?? 0;
  const velocity = latest?.median_days_to_sell ?? null;
  const gap = latest?.bid_ask_gap ?? null;

  return (
    <>
      {latest?.meta?.note && (
        <div className="mb-5 rounded-md border border-poxy-red/30 bg-poxy-red/5 px-4 py-2 text-sm text-poxy-ink">
          ⚠️ {latest.meta.note}
        </div>
      )}

      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard
          label="Headline Poxyndex"
          value={median != null ? `${Math.round(median)}` : "—"}
          unit="kr"
          sub={`${count} ${count === 1 ? "copy" : "copies"} on the market`}
          accent
        />
        <MetricCard
          label="In Big Macs"
          value={bigMac != null ? bigMac.toFixed(1) : "—"}
          unit="🍔"
          sub="vs. a Danish Big Mac"
        />
        <MetricCard
          label="Work to afford one"
          value={workMin != null ? formatWorkTime(workMin) : "—"}
          sub="at the average Danish wage"
        />
        <MetricCard
          label="Median time to sell"
          value={velocity != null ? `${Math.round(velocity)}` : "—"}
          unit="days"
          sub={gap != null ? `${Math.round(gap * 100)}% bid–ask gap` : "awaiting sales"}
        />
      </section>

      <section className="mb-6">
        <HeadlineChart history={history} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <RegionSpread regional={latest?.regional ?? null} national={median} />
        <SupplyList listings={listings} />
      </section>
    </>
  );
}

function RestOfWorld() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <div className="font-serif text-7xl font-bold text-poxy-line">0</div>
      <h2 className="mt-4 font-serif text-2xl font-bold">No listings found</h2>
      <p className="mt-2 max-w-md text-poxy-muted">
        The Poxycat economy has not yet gone global. Outside Denmark,{" "}
        <em>Mr. Poxycat &amp; Co.</em> trades at an implied price of{" "}
        <strong>∞</strong> — there is simply none to be had.
      </p>
      <p className="mt-4 text-sm text-poxy-muted">
        Switch back to 🇩🇰 Denmark for actual data.
      </p>
    </div>
  );
}

function Footer({ heartbeat }: { heartbeat: Heartbeat | null }) {
  return (
    <footer className="border-t border-poxy-line bg-poxy-paper">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-5 py-6 text-xs text-poxy-muted sm:flex-row sm:justify-between">
        <p>
          The Poxyndex is a non-commercial curiosity. Data is aggregated and
          anonymised. <a href="/methodology" className="text-poxy-red hover:underline">Methodology &amp; privacy →</a>
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
  const hours = minutes / 60;
  return `${hours.toFixed(1)} hr`;
}
