"use client";

import { SoundToggle } from "./SoundToggle";

export type Market = "dk" | "world";

export function Header({
  market,
  setMarket,
}: {
  market: Market;
  setMarket: (m: Market) => void;
}) {
  return (
    <header className="relative z-10 border-b border-white/5">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="font-serif text-xl font-bold tracking-tight">
            The <span className="iri-text">Poxyndex</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <SoundToggle />
          <MarketToggle market={market} setMarket={setMarket} />
        </div>
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
    <div className="glass inline-flex shrink-0 overflow-hidden rounded-full p-0.5 text-sm">
      {(["dk", "world"] as const).map((m) => (
        <button
          key={m}
          onClick={() => setMarket(m)}
          className={
            "rounded-full px-3.5 py-1.5 font-medium transition-all " +
            (market === m
              ? "bg-iris-red text-white shadow"
              : "text-muted hover:text-cloud")
          }
        >
          {m === "dk" ? "🇩🇰 Denmark" : "🌍 World"}
        </button>
      ))}
    </div>
  );
}
