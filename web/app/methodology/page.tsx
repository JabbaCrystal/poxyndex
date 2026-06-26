export const metadata = { title: "Poxyndex — Methodology & Privacy" };

export default function Methodology() {
  return (
    <main className="relative min-h-screen">
      <article className="mx-auto max-w-2xl px-5 py-12">
        <a href="/" className="text-sm hover:underline" style={{ color: "#57E0FF" }}>
          ← Back to the index
        </a>
        <h1 className="mt-4 font-serif text-3xl font-bold">
          Methodology &amp; <span className="iri-text">privacy</span>
        </h1>

        <h2 className="mt-8 font-serif text-xl font-bold text-cloud">What this is</h2>
        <p className="mt-2 text-muted">
          The Poxyndex tracks the second-hand price of <em>Mr. Poxycat &amp; Co.</em>{" "}
          (2007, Nordisk Film), a Danish DVD that has been out of print for years.
          In the spirit of The Economist&apos;s Big Mac Index, it uses one
          absurdly specific good to tell a small story about prices, wages and
          regional differences in Denmark. It is non-commercial and made for fun.
        </p>

        <h2 className="mt-8 font-serif text-xl font-bold text-cloud">How the numbers are made</h2>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-muted">
          <li>
            A scraper checks Danish second-hand marketplaces (DBA, Gul og Gratis)
            several times a day and records the asking price, coarse region and
            condition of any genuine listing.
          </li>
          <li>
            <strong className="text-cloud">Sold is inferred, not observed.</strong>{" "}
            When a listing disappears and stays gone past a grace window, we treat
            it as sold at its last asking price. Some are really just expired or
            hidden, so the &ldquo;sold&rdquo; and velocity figures are estimates.
          </li>
          <li>
            The <strong className="text-cloud">real index</strong> deflates the
            headline by Danish CPI (Statistics Denmark).{" "}
            <strong className="text-cloud">Work-minutes</strong> divides by the
            average Danish hourly wage.
          </li>
          <li>
            <strong className="text-cloud">In SpaceX shares</strong> is the joke
            metric: the price of one unobtainable DVD expressed in shares of the
            world&apos;s most coveted <em>un</em>obtainable asset. SpaceX is
            private, so we use its implied secondary-market price per share
            (~$220), converted at the live USD/DKK rate. Two of the least liquid
            assets on Earth, finally on one scale.
          </li>
          <li>
            Listings posted on more than one site are detected and counted once.
          </li>
          <li>
            With usually only a handful of copies for sale, single-day figures are
            illustrative, not statistically meaningful. The history is the point.
          </li>
        </ul>

        <h2 className="mt-8 font-serif text-xl font-bold text-cloud">Privacy</h2>
        <p className="mt-2 text-muted">
          We store only aggregated, anonymised data: a price (a fact), a coarse
          region, a condition category and a one-way hashed listing id. We do{" "}
          <strong className="text-cloud">not</strong> store or display seller
          names, contact details, exact addresses, or listing photos. If you are a
          seller and want a data point removed, email{" "}
          <a className="hover:underline" style={{ color: "#57E0FF" }} href="mailto:jabbacrystal@gmail.com">
            jabbacrystal@gmail.com
          </a>
          .
        </p>

        <p className="mt-8 text-xs text-muted/70">
          Not affiliated with The Economist, Nordisk Film, DBA, SpaceX, or anyone
          who appears in <em>Mr. Poxycat &amp; Co.</em>
        </p>
      </article>
    </main>
  );
}
