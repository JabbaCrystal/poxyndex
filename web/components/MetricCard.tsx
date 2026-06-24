export function MetricCard({
  label,
  value,
  unit,
  sub,
  accent,
}: {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={
        "rounded-lg border bg-poxy-card p-4 " +
        (accent ? "border-poxy-red/40 shadow-sm" : "border-poxy-line")
      }
    >
      <div className="text-xs font-semibold uppercase tracking-wide text-poxy-muted">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span
          className={
            "tabular font-serif text-3xl font-bold " +
            (accent ? "text-poxy-red" : "text-poxy-ink")
          }
        >
          {value}
        </span>
        {unit && <span className="text-sm text-poxy-muted">{unit}</span>}
      </div>
      {sub && <div className="mt-1 text-xs text-poxy-muted">{sub}</div>}
    </div>
  );
}
