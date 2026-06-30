import { REGION_NAMES, type PublicListing } from "@/lib/types";
import { useLang } from "@/lib/i18n";

const SOURCE_LABELS: Record<string, string> = {
  dba: "DBA",
  guloggratis: "Gul og Gratis",
  laserdisken: "Laserdisken",
};

export function SupplyList({ listings }: { listings: PublicListing[] }) {
  const { t } = useLang();
  const live = listings.filter((l) => !l.is_reference);

  return (
    <div className="glass rounded-2xl p-4">
      <h3 className="font-serif text-lg font-bold text-cloud">{t("supply.title")}</h3>
      <p className="mb-3 text-xs text-muted">{t("supply.desc")}</p>

      {live.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">{t("supply.empty")}</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wider text-muted">
              <th className="py-1.5 font-semibold">{t("supply.col_price")}</th>
              <th className="font-semibold">{t("supply.col_condition")}</th>
              <th className="font-semibold">{t("supply.col_region")}</th>
              <th className="text-right font-semibold">{t("supply.col_source")}</th>
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
                    style={{ color: "#FF4A33" }}
                  >
                    {SOURCE_LABELS[l.source] ?? l.source} ↗
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
