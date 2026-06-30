"use client";

import { useEffect, useState } from "react";
import { SOUND_KEY, playMagicChime } from "@/lib/sound";

/** Header toggle for the magic chime. Off by default; persisted in localStorage. */
export function SoundToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    try {
      setOn(localStorage.getItem(SOUND_KEY) === "on");
    } catch {
      /* ignore */
    }
  }, []);

  function toggle() {
    const next = !on;
    setOn(next);
    try {
      localStorage.setItem(SOUND_KEY, next ? "on" : "off");
    } catch {
      /* ignore */
    }
    if (next) playMagicChime(); // little confirmation sparkle
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={on ? "Turn magic sound off" : "Turn magic sound on"}
      title={on ? "Sound on" : "Sound off"}
      className="glass grid h-9 w-9 place-items-center rounded-full text-sm text-cloud transition-opacity hover:opacity-80"
    >
      {on ? "🔊" : "🔇"}
    </button>
  );
}
