"use client";

import { useEffect, useState, type CSSProperties } from "react";

interface Spark {
  left: number;
  top: number;
  size: number;
  dur: number;
  delay: number;
  color: string;
}

const COLORS = ["#FF4D5E", "#57E0FF", "#FFD56B", "#FFFFFF", "#FF6BD6", "#7CFFB2"];

/**
 * The magician's glitter. Positions are generated AFTER mount (client only) so
 * server-rendered HTML stays deterministic — no hydration mismatch.
 */
export function Sparkles({ count = 18, className = "" }: { count?: number; className?: string }) {
  const [items, setItems] = useState<Spark[]>([]);

  useEffect(() => {
    setItems(
      Array.from({ length: count }, () => ({
        // inset from the edges so sparkles never hard-clip at the container border
        left: 3 + Math.random() * 91,
        top: 3 + Math.random() * 90,
        size: 6 + Math.random() * 16,
        dur: 2.2 + Math.random() * 3.6,
        delay: Math.random() * 4.5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
      }))
    );
  }, [count]);

  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden>
      {items.map((s, i) => (
        <svg
          key={i}
          className="sparkle"
          viewBox="0 0 24 24"
          fill="currentColor"
          style={
            {
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              color: s.color,
              "--dur": `${s.dur}s`,
              "--delay": `${s.delay}s`,
            } as CSSProperties
          }
        >
          <path d="M12 0c1 6 5 10 11 12-6 2-10 6-11 12-1-6-5-10-11-12C7 10 11 6 12 0z" />
        </svg>
      ))}
    </div>
  );
}
