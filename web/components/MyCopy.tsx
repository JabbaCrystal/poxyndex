"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { CpiPoint } from "@/lib/supabase";
import { CountUp } from "./CountUp";

const LS_KEY = "poxyndex_mycopy";

interface Entry {
  paid: number;
  month: string; // 'YYYY-MM'
}

/** CPI index for a month — exact, else the most recent earlier month. */
function cpiFor(cpi: CpiPoint[], month: string): number | null {
  const exact = cpi.find((c) => c.month === month);
  if (exact) return exact.idx;
  const earlier = cpi.filter((c) => c.month <= month);
  return earlier.length ? earlier[earlier.length - 1]!.idx : null;
}

function monthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  if (!y || !m) return month;
  return new Date(y, m - 1, 1).toLocaleString("en-DK", { month: "long", year: "numeric" });
}

export function MyCopy({ current, cpi }: { current: number | null; cpi: CpiPoint[] }) {
  const [paid, setPaid] = useState("");
  const [month, setMonth] = useState("");
  const [entry, setEntry] = useState<Entry | null>(null);
  const maxMonth = typeof window !== "undefined" ? new Date().toISOString().slice(0, 7) : "";

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const v = JSON.parse(raw) as Entry;
      if (typeof v.paid === "number" && typeof v.month === "string") {
        setEntry(v);
        setPaid(String(v.paid));
        setMonth(v.month);
      }
    } catch {
      /* ignore */
    }
  }, []);

  function submit(e: FormEvent) {
    e.preventDefault();
    const p = Math.round(Number(paid));
    if (!Number.isFinite(p) || p <= 0 || !month) return;
    const v: Entry = { paid: p, month };
    setEntry(v);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(v));
    } catch {
      /* ignore */
    }
  }

  function clear() {
    setEntry(null);
    setPaid("");
    setMonth("");
    try {
      localStorage.removeItem(LS_KEY);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="font-serif text-lg font-bold text-cloud">
        Value your own copy <span aria-hidden>🎩</span>
      </h3>
      <p className="mb-4 text-xs text-muted">
        Bought one once? See how it&apos;s aged — against the market and against inflation.
      </p>

      <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs text-muted">
          What you paid (kr)
          <input
            type="number"
            inputMode="numeric"
            min={1}
            value={paid}
            onChange={(e) => setPaid(e.target.value)}
            placeholder="129"
            className="w-28 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-base text-cloud outline-none focus:border-iris-red"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          When you bought it
          <input
            type="month"
            value={month}
            max={maxMonth}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-base text-cloud outline-none focus:border-iris-red"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-iris-red px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Reveal
        </button>
        {entry && (
          <button type="button" onClick={clear} className="px-2 py-2 text-xs text-muted hover:text-cloud">
            Clear
          </button>
        )}
      </form>

      {entry && <Result entry={entry} current={current} cpi={cpi} />}
    </div>
  );
}

function Result({ entry, current, cpi }: { entry: Entry; current: number | null; cpi: CpiPoint[] }) {
  if (current == null) {
    return (
      <p className="mt-5 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-muted">
        No copies are on the market right now, so there&apos;s nothing to value yours against. Check back when one&apos;s listed.
      </p>
    );
  }

  const { paid, month } = entry;
  const deltaPct = (current - paid) / paid;
  const up = current >= paid;

  // Real terms: inflate what they paid to today's kroner via CPI.
  const cpiThen = cpiFor(cpi, month);
  const cpiNow = cpi.length ? cpi[cpi.length - 1]!.idx : null;
  const paidToday = cpiThen && cpiNow ? paid * (cpiNow / cpiThen) : null;
  const realPct = paidToday ? (current - paidToday) / paidToday : null;

  // Annualised (only meaningful past ~3 months held).
  const purchased = new Date(`${month}-15`);
  const years = (Date.now() - purchased.getTime()) / (365.25 * 86_400_000);
  const annual = years > 0.25 && paid > 0 ? Math.pow(current / paid, 1 / years) - 1 : null;

  const pos = "#7CFFB2";
  const neg = "#FF7A6B";
  const accent = up ? pos : neg;

  return (
    <div className="mt-5 border-t border-white/10 pt-4">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">
        Estimated value today
      </div>
      <div className="tabular mt-1 font-serif text-4xl font-bold leading-none">
        <CountUp value={current} className="iri-text" />
        <span className="ml-2 align-top text-lg text-muted">kr</span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span className="tabular font-semibold" style={{ color: accent }}>
          {up ? "▲" : "▼"} {up ? "+" : "−"}
          {Math.abs(current - paid).toLocaleString("da-DK")} kr
        </span>
        <span className="tabular font-semibold" style={{ color: accent }}>
          {deltaPct >= 0 ? "+" : ""}
          {Math.round(deltaPct * 100)}%
        </span>
        <span className="text-muted">
          since you paid {paid.toLocaleString("da-DK")} kr in {monthLabel(month)}
        </span>
      </div>

      <ul className="mt-3 space-y-1 text-xs text-muted">
        {realPct != null && paidToday != null && (
          <li>
            After inflation, that&apos;s{" "}
            <strong className="text-cloud">{Math.round(paidToday).toLocaleString("da-DK")} kr</strong>{" "}
            in today&apos;s money — so{" "}
            <strong style={{ color: realPct >= 0 ? pos : neg }}>
              {realPct >= 0 ? "+" : ""}
              {Math.round(realPct * 100)}% in real terms
            </strong>{" "}
            ({realPct >= 0 ? "it beat inflation" : "it trailed inflation"}).
          </li>
        )}
        {annual != null && (
          <li>
            That&apos;s roughly{" "}
            <strong className="text-cloud">
              {annual >= 0 ? "+" : ""}
              {Math.round(annual * 100)}%/year
            </strong>{" "}
            over {years.toFixed(1)} years.
          </li>
        )}
        <li className="pt-1 text-muted/70">{verdict(deltaPct)}</li>
      </ul>

      <p className="mt-3 text-[11px] text-muted/60">
        Based on the current median asking price — an estimate, not a guaranteed sale.
      </p>
    </div>
  );
}

function verdict(pct: number): string {
  if (pct >= 1) return "🪄 A vanishing act in reverse — your copy multiplied.";
  if (pct > 0.05) return "📈 Nicely done — it appreciated.";
  if (pct >= -0.05) return "≈ Roughly a wash — a steady hold.";
  return "📉 Down on paper — but you own a piece of Danish comedy history.";
}
