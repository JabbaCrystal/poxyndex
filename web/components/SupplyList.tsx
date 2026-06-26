import { REGION_NAMES, type PublicListing } from "@/lib/types";

const SOURCE_LABELS: Record<string, string> = {
  dba: "DBA",
  guloggratis: "Gul og Gratis",
  laserdisken: "Laserdisken",
};

export function SupplyList({ listings }: { listings: PublicListing[] }) {
  const live = listings.filter((l) => !l.is_reference);
  const reference = listings.find((l) => l.is_reference);

  return (
    <div className="glass rounded-2xl p-4">
      <h3 className="font-serif text-lg font-bold text-cloud">National supply</h3>
      <p className="mb-3 text-xs text-muted">
        Every Poxycat for sale in Denmark, right now. Anonymised to region.
      </p>

      {live.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">
          No copies currently for sale. The supply has vanished. 🎩
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wider text-muted">
              <th className="py-1.5 font-semibold">Price</th>
              <th className="font-semibold">Condition</th>
              <th className="font-semibold">Region</th>
              <th className="text-right font-semibold">Source</th>
            </tr>
          </thead>
          <tbody>
            {live.map((l) => (
              <tr key={l.id} className="border-b border-white/5">
                <td className="tabular py-2 font-semibold text-cloud">{l.price_dkk ?? "—"} kr</td>
                <td className="text-muted">{l.condition ?? "—"}</td>
                <td className="text-muted">
                  {l.region ? REGION_NAMES[l.region] ?? l.region : "—"}
                </td>
                <td className="text-right">
                  <a
                    href={l.source_url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="text-iris-cyan hover:underline"
                    style={{ color: "#57E0FF" }}
                  >
                    {SOURCE_LABELS[l.source] ?? l.source} ↗
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {reference && (
        <p className="mt-3 border-t border-white/10 pt-3 text-xs text-muted">
          Official retail (
          <a href={reference.source_url} target="_blank" rel="noopener noreferrer nofollow" style={{ color: "#57E0FF" }}>
            Laserdisken
          </a>
          ):{" "}
          <strong className="text-cloud">
            {reference.status === "out_of_stock"
              ? "Udgået — unobtainable new"
              : `${reference.price_dkk ?? "—"} kr`}
          </strong>
          .
        </p>
      )}
    </div>
  );
}
