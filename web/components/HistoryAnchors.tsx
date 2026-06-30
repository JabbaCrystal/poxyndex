import { useLang } from "@/lib/i18n";
import { ANCHORS_BY_DATE, type PriceAnchor } from "@/lib/retailHistory";

const RETAIL_COLOR = "#FFC24D"; // gold — when it was sold new
const SECONDHAND_COLOR = "#FF4A33"; // red — second-hand mentions

function color(a: PriceAnchor) {
  return a.kind === "retail" ? RETAIL_COLOR : SECONDHAND_COLOR;
}

function tag(a: PriceAnchor, t: (k: string) => string) {
  if (a.kind === "retail") return t("hist.tag_retail");
  return a.sold ? t("hist.tag_sold") : t("hist.tag_asking");
}

function dateLabel(a: PriceAnchor) {
  return a.month ? `${String(a.month).padStart(2, "0")}/${a.year}` : String(a.year);
}

export function HistoryAnchors() {
  const { t } = useLang();
  const anchors = ANCHORS_BY_DATE;
  if (anchors.length === 0) return null;

  // Position dots by fractional year (year + month) so clustered recent points
  // separate instead of stacking. These are individual anchors of different
  // kinds — deliberately no connecting line, this is not a fitted trend.
  const frac = (a: PriceAnchor) => a.year + ((a.month ?? 1) - 1) / 12;
  const fracs = anchors.map(frac);
  const min = Math.min(...fracs);
  const max = Math.max(...fracs);
  const span = Math.max(1, max - min);

  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="font-serif text-lg font-bold text-cloud">{t("hist.title")}</h3>
      <p className="mb-2 text-xs text-muted">{t("hist.desc")}</p>

      <div className="relative mx-1 mb-8 mt-7 h-px bg-white/10">
        {anchors.map((a, i) => {
          const left = `${((frac(a) - min) / span) * 100}%`;
          return (
            <span
              key={i}
              className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-ink"
              style={{ left, background: color(a) }}
              title={`${dateLabel(a)} · ${a.price} kr`}
            />
          );
        })}
        <span className="tabular absolute left-0 top-2 -translate-x-1/2 text-[10px] text-muted">
          {Math.floor(min)}
        </span>
        <span className="tabular absolute right-0 top-2 translate-x-1/2 text-[10px] text-muted">
          {anchors[anchors.length - 1]!.year}
        </span>
      </div>

      <ul className="space-y-2">
        {anchors.map((a, i) => (
          <li
            key={i}
            className="flex items-baseline justify-between gap-3 border-b border-white/5 pb-2 text-sm last:border-0"
          >
            <span className="flex items-baseline gap-2">
              <span
                className="inline-block h-2 w-2 self-center rounded-full"
                style={{ background: color(a) }}
              />
              <span className="tabular w-14 text-muted">{dateLabel(a)}</span>
              <span className="tabular font-semibold text-cloud">{a.price} kr</span>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                style={{ color: color(a), background: `${color(a)}1a` }}
              >
                {tag(a, t)}
              </span>
            </span>
            {a.sourceUrl ? (
              <a
                href={a.sourceUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="shrink-0 hover:underline"
                style={{ color: "#FF4A33" }}
              >
                {a.source} ↗
              </a>
            ) : (
              <span className="shrink-0 text-muted">{a.source}</span>
            )}
          </li>
        ))}
      </ul>

      <p className="mt-3 text-[11px] italic text-muted/60">{t("hist.caption")}</p>
    </div>
  );
}
