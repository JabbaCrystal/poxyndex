import { REGION_NAMES, type PublicListing } from "@/lib/types";

const SOURCE_LABELS: Record<string, string> = {
  dba: "DBA",
  guloggratis: "Gul og Gratis",
  laserdisken: "Laserdisken (retail)",
};

export function SupplyList({ listings }: { listings: PublicListing[] }) {
  const live = listings.filter((l) => !l.is_reference);
  const reference = listings.find((l) => l.is_reference);

  return (
    <div className="rounded-lg border border-poxy-line bg-poxy-card p-4">
      <h3 className="mb-1 font-serif text-lg font-bold">National supply</h3>
      <p className="mb-3 text-xs text-poxy-muted">
        Every Poxycat for sale in Denmark, right now. Anonymised to region.
      </p>

      {live.length === 0 ? (
        <p className="py-6 text-center text-sm text-poxy-muted">
          No copies currently for sale. The Poxycat supply has dried up.
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-poxy-line text-left text-xs uppercase text-poxy-muted">
              <th className="py-1.5">Price</th>
              <th>Condition</th>
              <th>Region</th>
              <th className="text-right">Source</th>
            </tr>
          </thead>
          <tbody>
            {live.map((l) => (
              <tr key={l.id} className="border-b border-poxy-line/60">
                <td className="tabular py-2 font-semibold">{l.price_dkk ?? "—"} kr</td>
                <td className="text-poxy-muted">{l.condition ?? "—"}</td>
                <td className="text-poxy-muted">
                  {l.region ? REGION_NAMES[l.region] ?? l.region : "—"}
                </td>
                <td className="text-right">
                  <a
                    href={l.source_url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="text-poxy-red hover:underline"
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
        <p className="mt-3 border-t border-poxy-line pt-3 text-xs text-poxy-muted">
          Official retail (
          <a href={reference.source_url} target="_blank" rel="noopener noreferrer nofollow" className="text-poxy-red hover:underline">
            Laserdisken
          </a>
          ):{" "}
          <strong className="text-poxy-ink">
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
