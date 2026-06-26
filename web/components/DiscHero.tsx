"use client";

import { useState, type CSSProperties } from "react";
import { Sparkles } from "./Sparkles";

/**
 * The hero: a spinning iridescent DVD disc + the real cover art.
 * Drop the cover image at web/public/cover.jpg and it appears automatically;
 * if it's missing, the disc simply stands alone (graceful fallback).
 */
export function DiscHero() {
  const [hasCover, setHasCover] = useState(true);

  return (
    <div className="relative mx-auto flex items-center justify-center gap-7 py-2">
      <Sparkles count={22} />

      {/* iridescent disc */}
      <div
        className="spin-slow relative h-36 w-36 shrink-0 sm:h-48 sm:w-48"
        style={{ filter: "drop-shadow(0 12px 44px rgba(165,123,255,0.4))" } as CSSProperties}
      >
        <div className="disc absolute inset-0" />
        <div className="disc-ring" />
        <div className="disc-hub" />
        <div className="disc-hole" />
      </div>

      {/* real cover art (optional) */}
      {hasCover && (
        <div
          className="glass relative hidden rounded-xl p-1.5 shadow-2xl sm:block"
          style={{ transform: "rotate(3deg)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/cover.jpg"
            alt="Mr. Poxycat & Co. DVD cover"
            width={150}
            height={212}
            className="rounded-lg"
            onError={() => setHasCover(false)}
          />
        </div>
      )}
    </div>
  );
}
