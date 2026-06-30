"use client";

import {
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import type { CommunityRow } from "@/lib/supabase";

const MIN_POINTS = 5; // below this, a price "history" isn't meaningful yet

function median(xs: number[]): number | null {
  const s = xs.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
}

/**
 * Crowd-sourced "what people paid over the years": median self-reported price
 * per purchase-year, with the current user's own purchase highlighted. Distinct
 * from the scraped market index — this is backward-looking and self-reported.
 */
export function CommunityHistory({
  rows,
  userEntry,
}: {
  rows: CommunityRow[];
  userEntry: { paid: number; month: string } | null;
}) {
  // Below the threshold a "history" isn't meaningful; the count/median is still
  // surfaced by MyCopy's teaser + comparison line, so render nothing here.
  if (rows.length < MIN_POINTS) return null;

  const byYear = new Map<string, number[]>();
  for (const r of rows) {
    const y = r.bought_month.slice(0, 4);
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y)!.push(r.paid_dkk);
  }
  const data = [...byYear.entries()]
    .map(([year, ps]) => ({ year, median: median(ps), n: ps.length }))
    .sort((a, b) => a.year.localeCompare(b.year));

  const userYear = userEntry?.month.slice(0, 4) ?? null;

  return (
    <div className="mt-5 border-t border-white/10 pt-4">
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
        What people paid over the years
      </div>
      <p className="mb-2 text-xs text-muted">
        Self-reported median paid, by purchase year ({rows.length} copies). Your own purchase is the red dot.
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 12, bottom: 5, left: -14 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
          <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#9A93B4" }} stroke="rgba(255,255,255,0.12)" />
          <YAxis tick={{ fontSize: 11, fill: "#9A93B4" }} stroke="rgba(255,255,255,0.12)" unit=" kr" width={62} />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              background: "#15131F",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              color: "#ECEAF6",
            }}
            formatter={(v: number, _n, p) => [`${v} kr (n=${p?.payload?.n ?? "?"})`, "median paid"]}
          />
          <Line
            type="monotone"
            dataKey="median"
            name="Median paid"
            stroke="#FFC24D"
            strokeWidth={2}
            dot={{ r: 3, fill: "#FFC24D" }}
            connectNulls
          />
          {userEntry && userYear && (
            <ReferenceDot
              x={userYear}
              y={userEntry.paid}
              r={5}
              fill="#FF4A33"
              stroke="#0B0A12"
              strokeWidth={1.5}
              isFront
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
