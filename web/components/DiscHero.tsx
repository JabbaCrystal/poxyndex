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
    <div className="relative mx-auto flex items-center justify-center gap-5 py-2 sm:gap-8">
      <Sparkles count={22} />

      {/* iridescent disc */}
      <div
        className="spin-slow relative h-32 w-32 shrink-0 sm:h-48 sm:w-48"
        style={{ filter: "drop-shadow(0 12px 44px rgba(165,123,255,0.4))" } as CSSProperties}
      >
        <div className="disc absolute inset-0" />
        <div className="disc-ring" />
        <div className="disc-hub" />
        <div className="disc-hole" />
      </div>

      {/* real cover art (optional — drop web/public/cover.jpg) */}
      {hasCover && (
        <div
          className="glass relative shrink-0 rounded-xl p-1.5 shadow-2xl"
          style={{ transform: "rotate(3deg)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/cover.jpg"
            alt="Mr. Poxycat & Co. DVD cover"
            className="w-24 rounded-lg sm:w-36"
            onError={() => setHasCover(false)}
          />
        </div>
      )}
    </div>
  );
}
