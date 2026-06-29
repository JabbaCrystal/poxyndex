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
      <div className="glass flex h-64 items-center justify-center rounded-2xl text-center">
        <div className="px-6">
          <div className="font-serif text-lg text-cloud">Collecting history…</div>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
            The Poxyndex needs at least two daily readings to draw a trend. Come
            back tomorrow — this market moves at the speed of a rare DVD.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-4">
      <h3 className="mb-3 font-serif text-lg font-bold text-cloud">
        The Poxyndex over time <span className="text-muted">· nominal vs constant kroner</span>
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -12 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9A93B4" }} stroke="rgba(255,255,255,0.12)" />
          <YAxis tick={{ fontSize: 11, fill: "#9A93B4" }} stroke="rgba(255,255,255,0.12)" unit=" kr" width={64} />
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
            dataKey="nominal"
            name="Asking price"
            stroke="#FF4D5E"
            strokeWidth={2.5}
            dot={false}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="real"
            name="In 2025-kroner"
            stroke="#57E0FF"
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
