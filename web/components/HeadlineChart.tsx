"use client";

import { useState } from "react";
import {
  Scatter,
  ScatterChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import type { IndexDaily } from "@/lib/types";
import type { CpiPoint } from "@/lib/supabase";
import { useLang } from "@/lib/i18n";
import { ANCHORS_BY_DATE, type PriceAnchor } from "@/lib/retailHistory";

const GOLD = "#FFC24D";
const RED = "#FF4A33";

type View = "long" | "live";
type Unit = "nominal" | "real";

type Pt = {
  x: number; // timestamp (ms)
  y: number; // DKK
  label: string;
  kindKey: "retail" | "asking" | "sold";
  channel?: string; // actual sales venue (Laserdisken, DBA) — never a forum name
  live?: boolean;
};

function tsOf(a: PriceAnchor) {
  return Date.UTC(a.year, (a.month ?? 1) - 1, 1);
}
function fmtYear(ts: number) {
  return new Date(ts).getUTCFullYear().toString();
}
function cpiFor(cpi: CpiPoint[], month: string): number | null {
  const exact = cpi.find((c) => c.month === month);
  if (exact) return exact.idx;
  const earlier = cpi.filter((c) => c.month <= month);
  return earlier.length ? earlier[earlier.length - 1]!.idx : null;
}

function Seg<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { v: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-0.5 text-[11px]">
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={`rounded-full px-2.5 py-1 font-medium transition-colors ${
            value === o.v ? "text-ink" : "text-muted hover:text-cloud"
          }`}
          style={value === o.v ? { background: RED } : undefined}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function HeadlineChart({ history, cpi }: { history: IndexDaily[]; cpi: CpiPoint[] }) {
  const { t } = useLang();
  const [view, setView] = useState<View>("long");
  const [unit, setUnit] = useState<Unit>("nominal");

  const hasCpi = cpi.length > 0;
  const cpiNow = hasCpi ? cpi[cpi.length - 1]!.idx : null;
  const real = unit === "real" && hasCpi;

  function realOf(nominal: number, monthStr: string): number {
    if (!real || cpiNow == null) return nominal;
    const then = cpiFor(cpi, monthStr);
    return then ? Math.round((nominal * cpiNow) / then) : nominal;
  }

  const header = (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h3 className="font-serif text-lg font-bold text-cloud">
        {t("chart.title")}{" "}
        <span className="hidden text-muted sm:inline">· {t("chart.subtitle")}</span>
      </h3>
      <div className="flex items-center gap-1.5">
        <Seg<View>
          value={view}
          onChange={setView}
          options={[
            { v: "long", label: t("chart.v_long") },
            { v: "live", label: t("chart.v_live") },
          ]}
        />
        {hasCpi && (
          <Seg<Unit>
            value={unit}
            onChange={setUnit}
            options={[
              { v: "nominal", label: t("chart.u_nominal") },
              { v: "real", label: t("chart.u_real") },
            ]}
          />
        )}
      </div>
    </div>
  );

  // ---------- LIVE view: the daily scrape as a real trend line ----------
  if (view === "live") {
    const daily = history
      .slice(-90)
      .map((d) => ({
        day: d.day,
        y: real ? (d.real_index != null ? Math.round(d.real_index) : null) : d.median_asking_dkk,
      }))
      .filter((d) => d.y != null);

    return (
      <div className="glass rounded-2xl p-4">
        {header}
        {daily.length < 2 ? (
          <div className="flex h-[260px] items-center justify-center text-center">
            <div className="px-6">
              <div className="font-serif text-lg text-cloud">{t("chart.collecting")}</div>
              <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
                {t("chart.collecting_body")}
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={daily} margin={{ top: 8, right: 12, bottom: 5, left: -12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "#9A93B4" }}
                stroke="rgba(255,255,255,0.12)"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9A93B4" }}
                stroke="rgba(255,255,255,0.12)"
                unit=" kr"
                width={64}
                domain={["auto", "auto"]}
              />
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
              <Line
                type="monotone"
                dataKey="y"
                name={real ? t("chart.u_real") : t("chart.asking")}
                stroke={RED}
                strokeWidth={2.5}
                dot={{ r: 3, fill: RED }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
        <p className="mt-2 text-[11px] italic text-muted/60">{t("chart.live_caption")}</p>
      </div>
    );
  }

  // ---------- LONG-RUN view: sourced anchors + live value as a scatter ----------
  const retail: Pt[] = [];
  const asking: Pt[] = [];
  const sold: Pt[] = [];

  for (const a of ANCHORS_BY_DATE) {
    const mm = `${a.year}-${String(a.month ?? 1).padStart(2, "0")}`;
    const pt: Pt = {
      x: tsOf(a),
      y: realOf(a.price, mm),
      label: a.month ? `${String(a.month).padStart(2, "0")}/${a.year}` : `${a.year}`,
      kindKey: a.kind === "retail" ? "retail" : a.sold ? "sold" : "asking",
      channel: a.channel,
    };
    (pt.kindKey === "retail" ? retail : pt.kindKey === "sold" ? sold : asking).push(pt);
  }

  const livePoint = history.at(-1);
  const now = Date.now();
  if (livePoint?.median_asking_dkk != null) {
    const nowMonth = (livePoint.day ?? new Date(now).toISOString()).slice(0, 7);
    asking.push({
      x: now,
      y:
        real && livePoint.real_index != null
          ? Math.round(livePoint.real_index)
          : realOf(livePoint.median_asking_dkk, nowMonth),
      label: t("chart.live"),
      kindKey: "asking",
      channel: "DBA",
      live: true,
    });
  }

  const allY = [...retail, ...asking, ...sold].map((p) => p.y);
  const maxY = allY.length ? Math.max(...allY) : 600;
  const startTs = Date.UTC(2011, 0, 1);
  const endTs = now + 1000 * 60 * 60 * 24 * 120;
  const currentYear = new Date(now).getUTCFullYear();
  const ticks = [...new Set([2011, 2014, 2017, 2020, 2023, currentYear])].map((y) =>
    Date.UTC(y, 0, 1),
  );
  const channels = [...new Set(ANCHORS_BY_DATE.map((a) => a.channel).filter(Boolean))];

  const ringDot = (fill: string, hollow: boolean) =>
    function Dot(props: { cx?: number; cy?: number; payload?: Pt }) {
      const { cx, cy, payload } = props;
      if (cx == null || cy == null) return <g />;
      const r = payload?.live ? 6.5 : 5;
      return (
        <g>
          {payload?.live && <circle cx={cx} cy={cy} r={11} fill={fill} opacity={0.18} />}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill={hollow ? "#15131F" : fill}
            stroke={fill}
            strokeWidth={2}
          />
        </g>
      );
    };

  return (
    <div className="glass rounded-2xl p-4">
      {header}
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 8, right: 12, bottom: 5, left: -12 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
          <XAxis
            type="number"
            dataKey="x"
            domain={[startTs, endTs]}
            ticks={ticks}
            tickFormatter={fmtYear}
            tick={{ fontSize: 11, fill: "#9A93B4" }}
            stroke="rgba(255,255,255,0.12)"
          />
          <YAxis
            type="number"
            dataKey="y"
            domain={[0, Math.ceil((maxY * 1.15) / 50) * 50]}
            tick={{ fontSize: 11, fill: "#9A93B4" }}
            stroke="rgba(255,255,255,0.12)"
            unit=" kr"
            width={64}
          />
          <ZAxis range={[60, 60]} />
          <Tooltip
            cursor={{ strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.2)" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0]!.payload as Pt;
              const kindLabel =
                p.kindKey === "retail"
                  ? t("hist.tag_retail")
                  : p.kindKey === "sold"
                    ? t("hist.tag_sold")
                    : t("hist.tag_asking");
              return (
                <div className="rounded-xl border border-white/12 bg-[#15131F] px-3 py-2 text-xs text-cloud">
                  <div className="font-semibold">
                    {p.label} · {p.y} kr
                  </div>
                  <div className="text-muted">
                    {kindLabel}
                    {p.channel ? ` · ${p.channel}` : ""}
                  </div>
                </div>
              );
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: "#9A93B4" }} />
          <Scatter
            name={t("chart.k_retail")}
            data={retail}
            fill={GOLD}
            shape={ringDot(GOLD, false)}
            legendType="circle"
          />
          <Scatter
            name={t("chart.k_asking")}
            data={asking}
            fill={RED}
            shape={ringDot(RED, true)}
            legendType="circle"
          />
          <Scatter
            name={t("chart.k_sold")}
            data={sold}
            fill={RED}
            shape={ringDot(RED, false)}
            legendType="circle"
          />
        </ScatterChart>
      </ResponsiveContainer>

      <p className="mt-2 text-[11px] italic text-muted/60">{t("hist.caption")}</p>
      {channels.length > 0 && (
        <p className="mt-1 text-[11px] text-muted/80">
          {t("chart.sources")}: {channels.join(" · ")}
        </p>
      )}
    </div>
  );
}
