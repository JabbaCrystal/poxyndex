// Minimal client for the Statistics Denmark (Danmarks Statistik) StatBank API.
// Docs: https://www.dst.dk/en/Statistik/brug-statistikken/muligheder-i-statistikbanken/api
// POST https://api.statbank.dk/v1/data  with a JSON body selecting a table slice.

export interface StatbankVar {
  code: string;
  values: string[];
}

/**
 * Fetch a table slice as CSV (semicolon-delimited) and return parsed rows.
 * Returns an array of { time, value } pairs (best-effort column detection).
 */
export async function statbankSeries(
  table: string,
  variables: StatbankVar[]
): Promise<Array<{ time: string; value: number }>> {
  const res = await fetch("https://api.statbank.dk/v1/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      table,
      format: "CSV",
      delimiter: "Semicolon",
      variables,
    }),
  });
  if (!res.ok) throw new Error(`StatBank ${table} -> HTTP ${res.status}`);
  const csv = await res.text();

  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = lines[0]!.split(";").map((h) => h.trim().toUpperCase());
  const timeIdx = header.findIndex((h) => h === "TID" || h === "TIME");
  const valIdx = header.findIndex((h) => h === "INDHOLD" || h === "CONTENT");

  const rows: Array<{ time: string; value: number }> = [];
  for (const line of lines.slice(1)) {
    const cols = line.split(";").map((c) => c.trim());
    const time = timeIdx >= 0 ? cols[timeIdx]! : cols[cols.length - 2]!;
    const rawVal = valIdx >= 0 ? cols[valIdx]! : cols[cols.length - 1]!;
    const value = Number(rawVal.replace(/\./g, "").replace(",", "."));
    if (time && Number.isFinite(value)) rows.push({ time, value });
  }
  return rows;
}

/** '2026M04' -> '2026-04' */
export function statbankMonth(t: string): string {
  const m = t.match(/(\d{4})M(\d{2})/);
  return m ? `${m[1]}-${m[2]}` : t;
}
