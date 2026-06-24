import { REGION_NAMES } from "@/lib/types";

/**
 * The within-Denmark "law of one price" gag: median asking price per region,
 * shown as bars relative to the national median.
 */
export function RegionSpread({
  regional,
  national,
}: {
  regional: Record<string, number> | null;
  national: number | null;
}) {
  const entries = Object.entries(regional ?? {});

  return (
    <div className="rounded-lg border border-poxy-line bg-poxy-card p-4">
      <h3 className="mb-1 font-serif text-lg font-bold">Regional Poxy-PPP</h3>
      <p className="mb-3 text-xs text-poxy-muted">
        Where is a Poxycat over- or under-valued? Median asking price by region.
      </p>

      {entries.length === 0 ? (
        <p className="py-6 text-center text-sm text-poxy-muted">
          Not enough listings across regions yet to compute a spread.
        </p>
      ) : (
        <ul className="space-y-2">
          {entries
            .sort((a, b) => b[1] - a[1])
            .map(([code, price]) => {
              const ratio = national ? price / national : 1;
              const pct = Math.min(100, Math.round((price / Math.max(...entries.map((e) => e[1]))) * 100));
              return (
                <li key={code} className="flex items-center gap-3 text-sm">
                  <span className="w-28 shrink-0 text-poxy-ink">
                    {REGION_NAMES[code] ?? code}
                  </span>
                  <div className="h-4 flex-1 overflow-hidden rounded bg-poxy-paper">
                    <div className="h-full bg-poxy-red/80" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="tabular w-16 shrink-0 text-right">{Math.round(price)} kr</span>
                  <span
                    className={
                      "tabular w-12 shrink-0 text-right text-xs " +
                      (ratio > 1 ? "text-poxy-red" : "text-poxy-muted")
                    }
                  >
                    {ratio ? `${ratio > 1 ? "+" : ""}${Math.round((ratio - 1) * 100)}%` : "—"}
                  </span>
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
}
