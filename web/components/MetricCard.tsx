export function MetricCard({
  label,
  value,
  unit,
  sub,
  icon,
  note,
}: {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  icon?: string;
  note?: string;
}) {
  return (
    <div className="glass group rounded-2xl p-4 transition-transform duration-200 hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          {label}
        </div>
        {icon && <span className="text-base opacity-70">{icon}</span>}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="tabular font-serif text-3xl font-bold text-cloud">{value}</span>
        {unit && <span className="text-sm text-muted">{unit}</span>}
      </div>
      {sub && <div className="mt-1 text-xs text-muted">{sub}</div>}
      {note && <div className="mt-1 font-serif text-[11px] italic text-muted/50">{note}</div>}
    </div>
  );
}
