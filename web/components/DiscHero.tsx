"use client";

import { useRef, useState, type CSSProperties, type MouseEvent } from "react";

const BURST_COLORS = ["#FF4A33", "#FFC24D", "#FFD56B", "#FF8A5B", "#7CFFB2", "#FFFFFF"];

interface Particle {
  id: number;
  tx: number;
  ty: number;
  size: number;
  color: string;
}

/**
 * The hero: a spinning iridescent DVD disc + the real cover art.
 * Interactive: the cluster tilts toward the cursor (3D), and clicking the disc
 * pops a little magic burst of sparkles. Drop web/public/cover.jpg for the cover.
 */
export function DiscHero() {
  const [hasCover, setHasCover] = useState(true);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Particle[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const seq = useRef(0);

  const prefersReduced = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function onMove(e: MouseEvent) {
    if (prefersReduced()) return;
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: py * -14, y: px * 14 });
  }

  function pop() {
    if (prefersReduced()) return;
    const n = 16;
    const made: Particle[] = Array.from({ length: n }, (_, i) => {
      const angle = (i / n) * Math.PI * 2 + Math.random() * 0.4;
      const dist = 46 + Math.random() * 66;
      return {
        id: seq.current++,
        tx: Math.cos(angle) * dist,
        ty: Math.sin(angle) * dist,
        size: 8 + Math.random() * 12,
        color: BURST_COLORS[Math.floor(Math.random() * BURST_COLORS.length)]!,
      };
    });
    setParticles((p) => [...p, ...made]);
    const ids = new Set(made.map((m) => m.id));
    setTimeout(() => setParticles((p) => p.filter((x) => !ids.has(x.id))), 720);
  }

  return (
    <div
      ref={wrapRef}
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      className="relative mx-auto flex w-fit items-center justify-center py-2"
      style={{ perspective: 900 }}
    >
      <div
        className="flex items-center justify-center gap-5 sm:gap-8"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: "preserve-3d",
          transition: "transform 140ms ease-out",
        }}
      >
        {/* iridescent disc — click for a little magic */}
        <button
          type="button"
          onClick={pop}
          aria-label="Tap the disc for a little magic"
          className="relative h-32 w-32 shrink-0 cursor-pointer appearance-none border-0 bg-transparent p-0 sm:h-48 sm:w-48"
          style={{ filter: "drop-shadow(0 12px 44px rgba(255,74,51,0.34))" } as CSSProperties}
        >
          <span className="spin-slow absolute inset-0 block">
            <span className="disc absolute inset-0 block" />
            <span className="disc-ring" />
            <span className="disc-hub" />
            <span className="disc-hole" />
          </span>
          {particles.map((p) => (
            <svg
              key={p.id}
              className="burst-particle"
              viewBox="0 0 24 24"
              fill="currentColor"
              style={
                {
                  width: p.size,
                  height: p.size,
                  color: p.color,
                  "--tx": `${p.tx}px`,
                  "--ty": `${p.ty}px`,
                } as CSSProperties
              }
            >
              <path d="M12 0c1 6 5 10 11 12-6 2-10 6-11 12-1-6-5-10-11-12C7 10 11 6 12 0z" />
            </svg>
          ))}
        </button>

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
    </div>
  );
}
