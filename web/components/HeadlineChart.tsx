"use client";

import {
  Scatter,
  ScatterChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import type { IndexDaily } from "@/lib/types";
import { useLang } from "@/lib/i18n";
import { ANCHORS_BY_DATE, type PriceAnchor } from "@/lib/retailHistory";

const GOLD = "#FFC24D";
const RED = "#FF4A33";

type Pt = {
  x: number; // timestamp (ms)
  y: number; // DKK
  label: string; // date label
  kindKey: "retail" | "asking" | "sold";
  source: string;
  sourceUrl?: string;
  live?: boolean;
};

function tsOf(a: PriceAnchor) {
  return Date.UTC(a.year, (a.month ?? 1) - 1, 1);
}

function fmtYear(ts: number) {
  return new Date(ts).getUTCFullYear().toString();
}

export function HeadlineChart({ history }: { history: IndexDaily[] }) {
  const { t } = useLang();

  const retail: Pt[] = [];
  const asking: Pt[] = [];
  const sold: Pt[] = [];

  for (const a of ANCHORS_BY_DATE) {
    const pt: Pt = {
      x: tsOf(a),
      y: a.price,
      label: a.month ? `${String(a.month).padStart(2, "0")}/${a.year}` : `${a.year}`,
      kindKey: a.kind === "retail" ? "retail" : a.sold ? "sold" : "asking",
      source: a.source,
      sourceUrl: a.sourceUrl,
    };
    (pt.kindKey === "retail" ? retail : pt.kindKey === "sold" ? sold : asking).push(pt);
  }

  // The live scraped median asking is the most recent second-hand "asking" point.
  const livePoint = history.at(-1);
  const now = Date.now();
  if (livePoint?.median_asking_dkk != null) {
    asking.push({
      x: now,
      y: livePoint.median_asking_dkk,
      label: t("chart.live"),
      kindKey: "asking",
      source: "DBA (live)",
      live: true,
    });
  }

  const allY = [...retail, ...asking, ...sold].map((p) => p.y);
  const maxY = allY.length ? Math.max(...allY) : 600;

  const startTs = Date.UTC(2011, 0, 1);
  const endTs = now + 1000 * 60 * 60 * 24 * 120; // ~4 months right padding
  const currentYear = new Date(now).getUTCFullYear();
  const tickYears = [2011, 2014, 2017, 2020, 2023, currentYear];
  const ticks = [...new Set(tickYears)].map((y) => Date.UTC(y, 0, 1));

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
      <h3 className="mb-3 font-serif text-lg font-bold text-cloud">
        {t("chart.title")} <span className="text-muted">· {t("chart.subtitle")}</span>
      </h3>
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
                    {kindLabel} · {p.source}
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
      <p className="mt-1 text-[11px] text-muted">
        {t("chart.sources")}:{" "}
        {ANCHORS_BY_DATE.filter((a) => a.sourceUrl).map((a, i, arr) => (
          <span key={a.source + a.year}>
            <a
              href={a.sourceUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="hover:underline"
              style={{ color: "#FF4A33" }}
            >
              {a.source} ({a.year})
            </a>
            {i < arr.length - 1 ? " · " : ""}
          </span>
        ))}
      </p>
    </div>
  );
}
