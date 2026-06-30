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
import type { CpiPoint } from "@/lib/supabase";
import { useLang } from "@/lib/i18n";

function cpiFor(cpi: CpiPoint[], month: string): number | null {
  const exact = cpi.find((c) => c.month === month);
  if (exact) return exact.idx;
  const earlier = cpi.filter((c) => c.month <= month);
  return earlier.length ? earlier[earlier.length - 1]!.idx : null;
}

/** Inclusive list of 'YYYY-MM' from start to end. */
function monthsBetween(start: string, end: string): string[] {
  const out: string[] = [];
  let [y, m] = start.split("-").map(Number) as [number, number];
  const [ey, em] = end.split("-").map(Number) as [number, number];
  let guard = 0;
  while ((y < ey || (y === ey && m <= em)) && guard++ < 1200) {
    out.push(`${y}-${String(m).padStart(2, "0")}`);
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }
  return out;
}

/**
 * Personal trajectory: what the user's purchase would be worth if it had only
 * kept pace with inflation (gold line), vs what the Poxyndex says it's worth
 * today (red dot at the end). The distance between them is the collector premium.
 */
export function MyCopyChart({
  paid,
  month,
  current,
  cpi,
}: {
  paid: number;
  month: string;
  current: number;
  cpi: CpiPoint[];
}) {
  const { t } = useLang();
  const cpiStart = cpiFor(cpi, month);
  const now = new Date().toISOString().slice(0, 7);
  if (!cpiStart || month >= now) return null;

  const months = monthsBetween(month, now);
  if (months.length < 2) return null;

  const data = months.map((m, i) => {
    const c = cpiFor(cpi, m) ?? cpiStart;
    return {
      m,
      inflation: Math.round(paid * (c / cpiStart)),
      actual: i === months.length - 1 ? current : null,
    };
  });

  return (
    <div className="mt-4">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
        {t("mycopychart.title", { month })}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 12, bottom: 5, left: -14 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
          <XAxis
            dataKey="m"
            tick={{ fontSize: 11, fill: "#9A93B4" }}
            stroke="rgba(255,255,255,0.12)"
            tickFormatter={(m: string) => m.slice(0, 4)}
            minTickGap={36}
          />
          <YAxis tick={{ fontSize: 11, fill: "#9A93B4" }} stroke="rgba(255,255,255,0.12)" unit=" kr" width={62} />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              background: "#15131F",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              color: "#ECEAF6",
            }}
            formatter={(v: number) => [`${v} kr`, ""]}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: "#9A93B4" }} />
          <Line
            type="monotone"
            dataKey="inflation"
            name={t("mycopychart.inflation")}
            stroke="#FFC24D"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            dot={false}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="actual"
            name={t("mycopychart.today")}
            stroke="#FF4A33"
            strokeWidth={0}
            dot={{ r: 5, fill: "#FF4A33", stroke: "#FF4A33" }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="mt-1 text-[11px] text-muted/70">{t("mycopychart.caption")}</p>
    </div>
  );
}
