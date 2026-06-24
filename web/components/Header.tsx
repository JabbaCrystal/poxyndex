"use client";

export type Market = "dk" | "world";

export function Header({
  market,
  setMarket,
}: {
  market: Market;
  setMarket: (m: Market) => void;
}) {
  return (
    <header className="border-b border-poxy-line bg-poxy-paper">
      <div className="poxy-rule" />
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-4xl font-bold tracking-tight text-poxy-ink sm:text-5xl">
            The <span className="text-poxy-red">Poxyndex</span>
          </h1>
          <p className="mt-1 max-w-xl text-sm text-poxy-muted">
            A Big Mac Index for <em>Mr. Poxycat &amp; Co.</em> — the out-of-print
            Danish DVD. Tracking the second-hand price of the nation&apos;s least
            liquid asset.
          </p>
        </div>
        <MarketToggle market={market} setMarket={setMarket} />
      </div>
    </header>
  );
}

function MarketToggle({
  market,
  setMarket,
}: {
  market: Market;
  setMarket: (m: Market) => void;
}) {
  return (
    <div className="inline-flex shrink-0 overflow-hidden rounded-full border border-poxy-line bg-white text-sm">
      {(["dk", "world"] as const).map((m) => (
        <button
          key={m}
          onClick={() => setMarket(m)}
          className={
            "px-4 py-1.5 font-medium transition-colors " +
            (market === m
              ? "bg-poxy-red text-white"
              : "text-poxy-muted hover:bg-poxy-paper")
          }
        >
          {m === "dk" ? "🇩🇰 Denmark" : "🌍 Rest of World"}
        </button>
      ))}
    </div>
  );
}
