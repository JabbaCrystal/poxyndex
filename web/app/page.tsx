"use client";

import { useEffect, useState } from "react";
import { Header, type Market } from "@/components/Header";
import { MetricCard } from "@/components/MetricCard";
import { HeadlineChart } from "@/components/HeadlineChart";
import { RegionSpread } from "@/components/RegionSpread";
import { SupplyList } from "@/components/SupplyList";
import { DiscHero } from "@/components/DiscHero";
import { Sparkles } from "@/components/Sparkles";
import { CountUp } from "@/components/CountUp";
import { MyCopy } from "@/components/MyCopy";
import { HistoryAnchors } from "@/components/HistoryAnchors";
import {
  fetchActiveListings,
  fetchCpiMonthly,
  fetchHeartbeat,
  fetchIndexHistory,
  fetchLatestFx,
  isConfigured,
  type CpiPoint,
} from "@/lib/supabase";
import type { IndexDaily, PublicListing, Heartbeat } from "@/lib/types";
import { useLang } from "@/lib/i18n";
import { FOOTER_QUOTES } from "@/lib/quotes";

const SPACEX_USD_PER_SHARE = 220;
const FX_FALLBACK = 6.9;

export default function Page() {
  const { t, lang } = useLang();
  const [market, setMarket] = useState<Market>("dk");
  const [history, setHistory] = useState<IndexDaily[]>([]);
  const [listings, setListings] = useState<PublicListing[]>([]);
  const [heartbeat, setHeartbeat] = useState<Heartbeat | null>(null);
  const [fx, setFx] = useState<number | null>(null);
  const [cpi, setCpi] = useState<CpiPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConfigured) {
      setError("err.notconnected");
      return;
    }
    Promise.all([
      fetchIndexHistory(),
      fetchActiveListings(),
      fetchHeartbeat(),
      fetchLatestFx(),
      fetchCpiMonthly(),
    ])
      .then(([h, l, hb, f, c]) => {
        setHistory(h);
        setListings(l);
        setHeartbeat(hb);
        setFx(f);
        setCpi(c);
      })
      .catch((e) => setError(e.message));
  }, []);

  const latest = history.at(-1) ?? null;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Header market={market} setMarket={setMarket} />

      {market === "dk" && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[680px]">
          <Sparkles count={30} />
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-5xl px-5 pb-16">
        {market === "world" ? (
          <RestOfWorld />
        ) : (
          <>
            <Hero latest={latest} />
            {error && (
              <div className="mx-auto mb-6 max-w-md rounded-full border border-white/10 bg-white/5 px-4 py-2 text-center text-xs text-muted">
                {t(error)}
              </div>
            )}
            <Metrics latest={latest} fx={fx} />
            <section className="mt-6">
              <HeadlineChart history={history} />
            </section>
            <section className="mt-6">
              <HistoryAnchors />
            </section>
            <section className="mt-6">
              <MyCopy current={latest?.median_asking_dkk ?? null} cpi={cpi} />
            </section>
            <section className="mt-6 grid gap-6 lg:grid-cols-2">
              <RegionSpread regional={latest?.regional ?? null} national={latest?.median_asking_dkk ?? null} />
              <SupplyList listings={listings} />
            </section>
          </>
        )}
      </div>

      <Footer heartbeat={heartbeat} locale={lang === "da" ? "da-DK" : "en-DK"} />
    </main>
  );
}

function Hero({ latest }: { latest: IndexDaily | null }) {
  const { t } = useLang();
  const median = latest?.median_asking_dkk ?? null;
  const count = latest?.active_count ?? 0;

  return (
    <section className="relative pt-8 text-center">
      <DiscHero />
      <h1 className="mt-4 font-serif text-5xl font-bold tracking-tight sm:text-6xl">
        The <span className="iri-text">Poxyndex</span>
      </h1>
      <p className="mt-2 font-serif text-base italic text-cloud/90 sm:text-lg">
        ✨ Lidt magi har aldrig skadet ✨
      </p>
      <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
        {t("hero.tagline_pre")} <em>Mr. Poxycat &amp; Co.</em> {t("hero.tagline_post")}
      </p>

      <div className="mt-7">
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
          {t("hero.headline")}
        </div>
        <div className="tabular mt-1 font-serif text-7xl font-bold leading-none">
          <CountUp value={median} className="iri-text" />
          <span className="ml-2 align-top text-2xl text-muted">kr</span>
        </div>
        <div className="mt-2 text-sm text-muted">
          {t(count === 1 ? "hero.copies_one" : "hero.copies_other", { n: count })}
        </div>
        <p className="mt-1 text-[11px] italic text-muted/50">
          🏦 Ikke råd? Prøv at spørge banken.
        </p>
      </div>

      {latest?.meta?.note && (
        <div className="mx-auto mt-5 inline-block rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-muted">
          ⚠️ {t("hero.thin_note")}
        </div>
      )}

      <hr className="iri-hr mx-auto mt-8 max-w-xs opacity-60" />
    </section>
  );
}

function Metrics({ latest, fx }: { latest: IndexDaily | null; fx: number | null }) {
  const { t } = useLang();
  const median = latest?.median_asking_dkk ?? null;
  const workMin = latest?.work_minutes ?? null;
  const velocity = latest?.median_days_to_sell ?? null;
  const gap = latest?.bid_ask_gap ?? null;
  const real = latest?.real_index ?? null;
  const spacexShares = median != null ? median / (SPACEX_USD_PER_SHARE * (fx ?? FX_FALLBACK)) : null;

  const work =
    workMin == null
      ? "—"
      : workMin < 90
        ? `${Math.round(workMin)} ${t("metric.min")}`
        : `${(workMin / 60).toFixed(1)} ${t("metric.hr")}`;

  return (
    <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <MetricCard
        label={t("metric.spacex")}
        value={spacexShares != null ? spacexShares.toFixed(2) : "—"}
        sub={t("metric.spacex_sub")}
        icon="🚀"
      />
      <MetricCard label={t("metric.work")} value={work} sub={t("metric.work_sub")} icon="⏱️" />
      <MetricCard
        label={t("metric.real")}
        value={real != null ? Math.round(real).toString() : "—"}
        unit="kr"
        sub={t("metric.real_sub")}
        icon="📉"
        note="» Keep it Real «"
      />
      <MetricCard
        label={t("metric.velocity")}
        value={velocity != null ? `${Math.round(velocity)}` : "—"}
        unit={t("metric.days")}
        sub={gap != null ? t("metric.gap", { n: Math.round(gap * 100) }) : t("metric.awaiting")}
        icon="⏳"
      />
    </section>
  );
}

function RestOfWorld() {
  const { t } = useLang();
  return (
    <div className="relative flex min-h-[60vh] flex-col items-center justify-center text-center">
      <Sparkles count={14} />
      <div className="font-serif text-8xl font-bold text-white/10">0</div>
      <h2 className="mt-4 font-serif text-2xl font-bold">{t("world.zero")}</h2>
      <p className="mt-2 max-w-md text-muted">
        {t("world.body_pre")} <em>Mr. Poxycat &amp; Co.</em> {t("world.body_post")}{" "}
        <span className="iri-text font-bold">∞</span> {t("world.infinity")}
      </p>
      <p className="mt-4 text-sm text-muted">{t("world.switch")}</p>
    </div>
  );
}

function Footer({ heartbeat, locale }: { heartbeat: Heartbeat | null; locale: string }) {
  const { t } = useLang();
  const [qi, setQi] = useState(0);
  useEffect(() => {
    setQi(Math.floor(Math.random() * FOOTER_QUOTES.length));
  }, []);
  const q = FOOTER_QUOTES[qi]!;

  return (
    <footer className="relative z-10 border-t border-white/5">
      <figure className="mx-auto max-w-5xl px-5 pt-6 text-center">
        <blockquote className="font-serif text-sm italic text-cloud/70">«{q.da}»</blockquote>
        <figcaption className="mt-0.5 text-[11px] text-muted/70">
          — {q.who} · <span className="italic">{q.clip}</span>
        </figcaption>
      </figure>
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-5 py-6 text-xs text-muted sm:flex-row sm:justify-between">
        <p>
          {t("foot.tagline")}{" "}
          <a href="/methodology" className="hover:underline" style={{ color: "#FF4A33" }}>
            {t("foot.method")}
          </a>
        </p>
        <p>
          {heartbeat?.last_run
            ? t("foot.updated", { time: new Date(heartbeat.last_run).toLocaleString(locale) })
            : t("foot.awaiting")}
        </p>
      </div>
    </footer>
  );
}
