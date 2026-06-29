"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animates a number from 0 up to `value` once, with an ease-out. Renders "—"
 * when value is null, and jumps straight to the value if the user prefers
 * reduced motion.
 */
export function CountUp({
  value,
  className,
}: {
  value: number | null;
  className?: string;
}) {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (value == null) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setDisplay(value);
      return;
    }
    const duration = 900;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(value * eased));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [value]);

  if (value == null) return <span className={className}>—</span>;
  return <span className={className}>{display.toLocaleString("da-DK")}</span>;
}
