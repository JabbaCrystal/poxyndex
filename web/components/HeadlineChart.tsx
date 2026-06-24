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
import type { IndexDaily } from "@/lib/types";

export function HeadlineChart({ history }: { history: IndexDaily[] }) {
  const data = history.map((d) => ({
    day: d.day,
    nominal: d.median_asking_dkk,
    real: d.real_index ? Math.round(d.real_index) : null,
  }));

  if (data.length < 2) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-poxy-line bg-poxy-card text-center text-sm text-poxy-muted">
        <div>
          <div className="font-serif text-lg text-poxy-ink">Collecting history…</div>
          <p className="mx-auto mt-1 max-w-sm">
            The Poxyndex needs at least two daily readings to draw a trend. Come
            back tomorrow — the market moves at the speed of a rare DVD.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-poxy-line bg-poxy-card p-4">
      <h3 className="mb-3 font-serif text-lg font-bold">
        Headline Poxyndex vs. constant kroner
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E3DCCD" />
          <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#6B6B6B" />
          <YAxis tick={{ fontSize: 11 }} stroke="#6B6B6B" unit=" kr" width={60} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderColor: "#E3DCCD" }}
            formatter={(v: number) => [`${v} kr`, ""]}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="nominal"
            name="Asking price (nominal)"
            stroke="#E3120B"
            strokeWidth={2.5}
            dot={false}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="real"
            name="In 2025-kroner (CPI-adjusted)"
            stroke="#121212"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            dot={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
