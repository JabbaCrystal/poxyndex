"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  fetchCommunityPaid,
  upsertCommunityPaid,
  type CpiPoint,
  type CommunityRow,
} from "@/lib/supabase";
import { REGION_NAMES } from "@/lib/types";
import { useLang } from "@/lib/i18n";
import { CountUp } from "./CountUp";
import { MyCopyChart } from "./MyCopyChart";
import { CommunityHistory } from "./CommunityHistory";

const LS_KEY = "poxyndex_mycopy";
const DEVICE_KEY = "poxyndex_device";

const PRICE_MIN = 10;
const PRICE_MAX = 2000;
const RELEASE_MONTH = "2007-01";

interface Entry {
  paid: number;
  month: string; // 'YYYY-MM'
  region: string;
}

interface Community {
  median: number | null;
  count: number;
}

/** Stable, anonymous, in-browser id (no PII) used to keep one row per device. */
function deviceId(): string {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

function median(xs: number[]): number | null {
  const s = xs.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
}

function cpiFor(cpi: CpiPoint[], month: string): number | null {
  const exact = cpi.find((c) => c.month === month);
  if (exact) return exact.idx;
  const earlier = cpi.filter((c) => c.month <= month);
  return earlier.length ? earlier[earlier.length - 1]!.idx : null;
}

function monthLabel(month: string, locale: string): string {
  const [y, m] = month.split("-").map(Number);
  if (!y || !m) return month;
  return new Date(y, m - 1, 1).toLocaleString(locale, { month: "long", year: "numeric" });
}

function verdictKey(pct: number): string {
  if (pct >= 1) return "copy.verdict_multi";
  if (pct > 0.05) return "copy.verdict_up";
  if (pct >= -0.05) return "copy.verdict_flat";
  return "copy.verdict_down";
}

export function MyCopy({ current, cpi }: { current: number | null; cpi: CpiPoint[] }) {
  const { t } = useLang();
  const [paid, setPaid] = useState("");
  const [month, setMonth] = useState("");
  const [region, setRegion] = useState("");
  const [entry, setEntry] = useState<Entry | null>(null);
  const [community, setCommunity] = useState<Community>({ median: null, count: 0 });
  const [communityRows, setCommunityRows] = useState<CommunityRow[]>([]);
  const maxMonth = typeof window !== "undefined" ? new Date().toISOString().slice(0, 7) : "";

  async function refreshCommunity() {
    const rows = await fetchCommunityPaid();
    setCommunityRows(rows);
    setCommunity({ median: median(rows.map((r) => r.paid_dkk)), count: rows.length });
  }

  useEffect(() => {
    void refreshCommunity();
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const v = JSON.parse(raw) as Entry;
      if (typeof v.paid === "number" && typeof v.month === "string") {
        setEntry(v);
        setPaid(String(v.paid));
        setMonth(v.month);
        setRegion(v.region ?? "");
      }
    } catch {
      /* ignore */
    }
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const p = Math.round(Number(paid));
    if (!Number.isFinite(p) || p <= 0 || !month) return;
    const v: Entry = { paid: p, month, region };
    setEntry(v);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(v));
    } catch {
      /* ignore */
    }

    const inBounds = p >= PRICE_MIN && p <= PRICE_MAX && month >= RELEASE_MONTH && month <= maxMonth;
    if (inBounds) {
      await upsertCommunityPaid({
        device_id: deviceId(),
        paid_dkk: p,
        bought_month: month,
        region: region || null,
      });
      void refreshCommunity();
    }
  }

  function clear() {
    // Resets the tool on this device only — the anonymous community point stays
    // (first-value-wins). Genuine removal is via the email on the methodology page.
    setEntry(null);
    setPaid("");
    setMonth("");
    setRegion("");
    try {
      localStorage.removeItem(LS_KEY);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="font-serif text-lg font-bold text-cloud">
        {t("copy.title")} <span aria-hidden>🎩</span>
      </h3>
      <p className="mb-4 text-xs text-muted">{t("copy.subtitle")}</p>

      <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs text-muted">
          {t("copy.paid")}
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
          {t("copy.when")}
          <input
            type="month"
            value={month}
            max={maxMonth}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-base text-cloud outline-none focus:border-iris-red"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          {t("copy.region")} <span className="opacity-60">{t("copy.optional")}</span>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-base text-cloud outline-none focus:border-iris-red"
          >
            <option value="">—</option>
            {Object.entries(REGION_NAMES).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-lg bg-iris-red px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          {t("copy.reveal")}
        </button>
        {entry && (
          <button type="button" onClick={clear} className="px-2 py-2 text-xs text-muted hover:text-cloud">
            {t("copy.clear")}
          </button>
        )}
      </form>

      <p className="mt-2 text-[11px] text-muted/60">{t("copy.disclosure")}</p>

      {entry && <Result entry={entry} current={current} cpi={cpi} community={community} />}
      {!entry && community.count > 0 && community.median != null && (
        <p className="mt-4 border-t border-white/10 pt-4 text-sm text-muted">
          {t(community.count === 1 ? "copy.teaser_one" : "copy.teaser_other", {
            n: community.count,
            price: Math.round(community.median).toLocaleString("da-DK"),
          })}
        </p>
      )}

      <CommunityHistory
        rows={communityRows}
        userEntry={entry ? { paid: entry.paid, month: entry.month } : null}
      />
    </div>
  );
}

function Result({
  entry,
  current,
  cpi,
  community,
}: {
  entry: Entry;
  current: number | null;
  cpi: CpiPoint[];
  community: Community;
}) {
  const { t } = useLang();
  const { paid, month } = entry;
  const pos = "#7CFFB2";
  const neg = "#FF7A6B";

  const cpiThen = cpiFor(cpi, month);
  const cpiNow = cpi.length ? cpi[cpi.length - 1]!.idx : null;
  const paidToday = cpiThen && cpiNow ? paid * (cpiNow / cpiThen) : null;

  const purchased = new Date(`${month}-15`);
  const years = (Date.now() - purchased.getTime()) / (365.25 * 86_400_000);

  return (
    <div className="mt-5 border-t border-white/10 pt-4">
      {current == null ? (
        <p className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-muted">
          {t("copy.no_market")}
        </p>
      ) : (
        <>
          <MarketResult paid={paid} month={month} current={current} paidToday={paidToday} years={years} pos={pos} neg={neg} />
          <MyCopyChart paid={paid} month={month} current={current} cpi={cpi} />
        </>
      )}

      {community.median != null && community.count > 0 && (
        <p className="mt-3 text-xs text-muted">
          {t("copy.compare_pre", { n: community.count })}{" "}
          <strong className="text-cloud">{Math.round(community.median).toLocaleString("da-DK")} kr</strong>
          {" — "}
          {paid > community.median
            ? t("copy.compare_above")
            : paid < community.median
              ? t("copy.compare_below")
              : t("copy.compare_on")}
        </p>
      )}
    </div>
  );
}

function MarketResult({
  paid,
  month,
  current,
  paidToday,
  years,
  pos,
  neg,
}: {
  paid: number;
  month: string;
  current: number;
  paidToday: number | null;
  years: number;
  pos: string;
  neg: string;
}) {
  const { t, lang } = useLang();
  const locale = lang === "da" ? "da-DK" : "en-DK";
  const deltaPct = (current - paid) / paid;
  const up = current >= paid;
  const accent = up ? pos : neg;
  const realPct = paidToday ? (current - paidToday) / paidToday : null;
  const annual = years > 0.25 && paid > 0 ? Math.pow(current / paid, 1 / years) - 1 : null;

  return (
    <>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">{t("copy.value_today")}</div>
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
          {t("copy.since", { paid: paid.toLocaleString("da-DK"), month: monthLabel(month, locale) })}
        </span>
      </div>

      <ul className="mt-3 space-y-1 text-xs text-muted">
        {realPct != null && paidToday != null && (
          <li>
            {t("copy.real_line_a")}{" "}
            <strong className="text-cloud">{Math.round(paidToday).toLocaleString("da-DK")} kr</strong>{" "}
            {t("copy.real_line_b")}{" "}
            <strong style={{ color: realPct >= 0 ? pos : neg }}>
              {t("copy.real_terms", { pct: `${realPct >= 0 ? "+" : ""}${Math.round(realPct * 100)}` })}
            </strong>{" "}
            ({realPct >= 0 ? t("copy.beat") : t("copy.trailed")}).
          </li>
        )}
        {annual != null && (
          <li>
            {t("copy.annual", {
              pct: `${annual >= 0 ? "+" : ""}${Math.round(annual * 100)}`,
              years: years.toFixed(1),
            })}
          </li>
        )}
        <li className="pt-1 text-muted/70">{t(verdictKey(deltaPct))}</li>
      </ul>

      <p className="mt-3 text-[11px] text-muted/60">{t("copy.disclaimer")}</p>
    </>
  );
}
