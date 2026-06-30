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
import { useLang } from "@/lib/i18n";

export function HeadlineChart({ history }: { history: IndexDaily[] }) {
  const { t } = useLang();
  const data = history.map((d) => ({
    day: d.day,
    nominal: d.median_asking_dkk,
    real: d.real_index ? Math.round(d.real_index) : null,
  }));

  if (data.length < 2) {
    return (
      <div className="glass flex h-64 items-center justify-center rounded-2xl text-center">
        <div className="px-6">
          <div className="font-serif text-lg text-cloud">{t("chart.collecting")}</div>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{t("chart.collecting_body")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-4">
      <h3 className="mb-3 font-serif text-lg font-bold text-cloud">
        {t("chart.title")} <span className="text-muted">· {t("chart.subtitle")}</span>
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
            name={t("chart.asking")}
            stroke="#FF4A33"
            strokeWidth={2.5}
            dot={false}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="real"
            name={t("chart.real")}
            stroke="#FFC24D"
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
