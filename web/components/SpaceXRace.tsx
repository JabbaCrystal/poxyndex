"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { useLang } from "@/lib/i18n";

// Approximate SpaceX valuation by year ($B), from reported funding/tender rounds.
// Illustrative only — clearly labelled as such in the caption.
const SPACEX_VALUATION: Record<number, number> = {
  2012: 2.4,
  2013: 4,
  2014: 10,
  2015: 12,
  2016: 15,
  2017: 21,
  2018: 28,
  2019: 33,
  2020: 46,
  2021: 74,
  2022: 127,
  2023: 150,
  2024: 350,
  2025: 400,
};
const SX_MIN = 2012;
const SX_MAX = 2025;

function sxVal(year: number): number {
  const y = Math.min(SX_MAX, Math.max(SX_MIN, year));
  return SPACEX_VALUATION[y] ?? SPACEX_VALUATION[SX_MAX]!;
}

/**
 * Indexed "growth race": the user's copy (purchase → today, two known points)
 * vs SpaceX's valuation trajectory over the same span, both rebased to 100 at
 * the purchase year. Uses no FX (pure ratios). SpaceX figures are approximate.
 */
export function SpaceXRace({
  paid,
  month,
  current,
}: {
  paid: number;
  month: string;
  current: number;
}) {
  const { t } = useLang();
  const startYear = Math.max(SX_MIN, parseInt(month.slice(0, 4), 10) || SX_MIN);
  const nowYear = new Date().getFullYear();
  if (nowYear <= startYear) return null;

  const sxBase = sxVal(startYear);
  const poxyEnd = Math.round((current / paid) * 100);

  const data = [];
  for (let y = startYear; y <= nowYear; y++) {
    data.push({
      year: String(y),
      spacex: Math.round((sxVal(y) / sxBase) * 100),
      poxy: y === startYear ? 100 : y === nowYear ? poxyEnd : null,
    });
  }

  return (
    <div className="mt-5">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
        {t("sxrace.title", { year: startYear })}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 12, bottom: 5, left: -8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
          <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#9A93B4" }} stroke="rgba(255,255,255,0.12)" />
          <YAxis tick={{ fontSize: 11, fill: "#9A93B4" }} stroke="rgba(255,255,255,0.12)" width={48} />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              background: "#15131F",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              color: "#ECEAF6",
            }}
            formatter={(v: number) => [`${v}`, ""]}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: "#9A93B4" }} />
          <Line
            type="monotone"
            dataKey="poxy"
            name={t("sxrace.poxy")}
            stroke="#FF4A33"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#FF4A33" }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="spacex"
            name={t("sxrace.spacex")}
            stroke="#FFC24D"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            dot={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="mt-1 text-[11px] text-muted/70">{t("sxrace.caption", { year: startYear })}</p>
    </div>
  );
}
