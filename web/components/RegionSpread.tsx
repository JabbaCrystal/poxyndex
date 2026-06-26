import { REGION_NAMES } from "@/lib/types";

/**
 * The within-Denmark "law of one price" gag: median asking price per region.
 */
export function RegionSpread({
  regional,
  national,
}: {
  regional: Record<string, number> | null;
  national: number | null;
}) {
  const entries = Object.entries(regional ?? {});
  const max = entries.length ? Math.max(...entries.map((e) => e[1])) : 0;

  return (
    <div className="glass rounded-2xl p-4">
      <h3 className="font-serif text-lg font-bold text-cloud">Regional Poxy-PPP</h3>
      <p className="mb-3 text-xs text-muted">
        Where is a Poxycat over- or under-valued? Median asking price by region.
      </p>

      {entries.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">
          Not enough listings across regions yet to compute a spread.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {entries
            .sort((a, b) => b[1] - a[1])
            .map(([code, price]) => {
              const ratio = national ? price / national : 1;
              const pct = max ? Math.round((price / max) * 100) : 0;
              return (
                <li key={code} className="flex items-center gap-3 text-sm">
                  <span className="w-24 shrink-0 text-cloud">{REGION_NAMES[code] ?? code}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: "linear-gradient(90deg,#57E0FF,#E26BFF)",
                      }}
                    />
                  </div>
                  <span className="tabular w-16 shrink-0 text-right text-cloud">{Math.round(price)} kr</span>
                  <span
                    className="tabular w-12 shrink-0 text-right text-xs"
                    style={{ color: ratio > 1 ? "#E26BFF" : "#9A93B4" }}
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
