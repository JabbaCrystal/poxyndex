// ── Banked show quotes ───────────────────────────────────────────────────────
// Short homage lines from "Mr. Poxycat & Co." (2007), transcribed from clip
// captions in the official-ish YouTube playlist. Used non-commercially as fan
// homage, kept short and attributed. Wording is best-effort from auto-captions
// — confirm against the source before treating any line as exact.
//
// Add more here over time; the footer rotates through `FOOTER_QUOTES`.

export interface ShowQuote {
  da: string; // kept Danish always (these are the show's lines)
  who: string;
  clip: string;
}

/** Quotes shown in the rotating footer flourish. */
export const FOOTER_QUOTES: ShowQuote[] = [
  { da: "Giv en mand et æg, han er mæt for en dag.", who: "Åge, bedemanden", clip: "Matador" },
  { da: "Lidt magi har aldrig skadet.", who: "Mr. Poxycat", clip: "Lidt magi har aldrig skadet" },
  { da: "Du skal elske mens du gør det, leve mens du tør det.", who: "Mr. Poxycat", clip: "Om døden" },
  { da: "Den sværeste kamp er kampen mod sig selv.", who: "Mr. Poxycat", clip: "Filosofi i bilen" },
];

/** Extra banked lines, not yet placed — kept for future/further use. */
export const BANKED_QUOTES: ShowQuote[] = [
  { da: "Et overforbrug kan rent faktisk have konsekvenser.", who: "Åge, bedemanden", clip: "Matador" },
  { da: "Det er ikke mine penge — det er bankens penge.", who: "Åge, bedemanden", clip: "Matador" },
  { da: "Prøv at spørge banken.", who: "Åge, bedemanden", clip: "Matador" },
];
