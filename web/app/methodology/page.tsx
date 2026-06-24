export const metadata = { title: "Poxyndex — Methodology & Privacy" };

export default function Methodology() {
  return (
    <main className="min-h-screen">
      <div className="poxy-rule" />
      <article className="mx-auto max-w-2xl px-5 py-10">
        <a href="/" className="text-sm text-poxy-red hover:underline">
          ← Back to the index
        </a>
        <h1 className="mt-4 font-serif text-3xl font-bold">Methodology &amp; privacy</h1>

        <h2 className="mt-8 font-serif text-xl font-bold">What this is</h2>
        <p className="mt-2 text-poxy-ink/90">
          The Poxyndex tracks the second-hand price of <em>Mr. Poxycat &amp; Co.</em>{" "}
          (2007, Nordisk Film), a Danish DVD that has been out of print for years.
          In the spirit of The Economist&apos;s Big Mac Index, it uses one
          absurdly specific good to tell a small story about prices, wages and
          regional differences in Denmark. It is non-commercial and made for fun.
        </p>

        <h2 className="mt-8 font-serif text-xl font-bold">How the numbers are made</h2>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-poxy-ink/90">
          <li>
            A scraper checks Danish second-hand marketplaces (DBA, Gul og Gratis)
            once a day and records the asking price, coarse region and condition
            of any genuine listing.
          </li>
          <li>
            <strong>Sold is inferred, not observed.</strong> When a listing
            disappears and stays gone past a grace window, we treat it as sold at
            its last asking price. Some of those are really just expired or hidden,
            so the &ldquo;sold&rdquo; and velocity figures are estimates.
          </li>
          <li>
            The <strong>real index</strong> deflates the headline by Danish CPI
            (Statistics Denmark). <strong>Work-minutes</strong> divides by the
            average Danish hourly wage. <strong>Big Macs</strong> divides by the
            Danish Big Mac price from The Economist&apos;s open data.
          </li>
          <li>
            Listings posted on more than one site are detected and counted once.
          </li>
          <li>
            With usually only a handful of copies for sale, single-day figures are
            illustrative, not statistically meaningful. The history is the point.
          </li>
        </ul>

        <h2 className="mt-8 font-serif text-xl font-bold">Privacy</h2>
        <p className="mt-2 text-poxy-ink/90">
          We store only aggregated, anonymised data: a price (a fact), a coarse
          region, a condition category and a one-way hashed listing id. We do{" "}
          <strong>not</strong> store or display seller names, contact details,
          exact addresses, or listing photos. If you are a seller and want a data
          point removed, email{" "}
          <a className="text-poxy-red hover:underline" href="mailto:jabbacrystal@gmail.com">
            jabbacrystal@gmail.com
          </a>
          .
        </p>

        <p className="mt-8 text-xs text-poxy-muted">
          Not affiliated with The Economist, Nordisk Film, DBA, or anyone who
          appears in <em>Mr. Poxycat &amp; Co.</em>
        </p>
      </article>
    </main>
  );
}
