"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "da" | "en";
const LS_KEY = "poxyndex_lang";

// Danish is the primary locale. Keys fall back to English, then to the key itself.
const da: Record<string, string> = {
  "nav.denmark": "Danmark",
  "nav.world": "Verden",
  "sound.on": "Lyd til",
  "sound.off": "Lyd fra",
  "lang.label": "Sprog",

  "hero.tagline_pre": "Et prisindeks for",
  "hero.tagline_post":
    "— den udgåede danske dvd. Vi følger andenhåndsværdien af landets mindst likvide aktiv.",
  "hero.headline": "Overskriftspris",
  "hero.copies_one": "{n} eksemplar til salg i Danmark",
  "hero.copies_other": "{n} eksemplarer til salg i Danmark",
  "hero.thin_note": "tyndt marked — prisen er illustrativ, ikke en tendens",

  "metric.spacex": "I SpaceX-aktier",
  "metric.spacex_sub": "til antaget privat værdiansættelse",
  "metric.work": "Arbejde for ét eksemplar",
  "metric.work_sub": "ved den gennemsnitlige danske løn",
  "metric.real": "I 2025-kroner",
  "metric.real_sub": "inflationskorrigeret (reelt)",
  "metric.velocity": "Median salgstid",
  "metric.days": "dage",
  "metric.gap": "{n}% køb/salg-spænd",
  "metric.awaiting": "afventer salg",
  "metric.min": "min",
  "metric.hr": "t",

  "chart.title": "Poxyndekset over tid",
  "chart.subtitle": "nominelt vs. faste kroner",
  "chart.collecting": "Indsamler historik…",
  "chart.collecting_body":
    "Poxyndekset skal bruge mindst to daglige aflæsninger for at tegne en tendens. Kom igen i morgen — dette marked bevæger sig i en sjælden dvd's tempo.",
  "chart.asking": "Udbudspris",
  "chart.real": "I 2025-kroner",

  "region.title": "Regionalt Poxy-PPP",
  "region.desc": "Hvor er en Poxycat over- eller undervurderet? Median udbudspris pr. region.",
  "region.empty": "Endnu ikke nok annoncer på tværs af regioner til at beregne et spænd.",

  "supply.title": "National forsyning",
  "supply.desc": "Alle Poxycats til salg i Danmark lige nu. Anonymiseret til region.",
  "supply.empty": "Ingen eksemplarer til salg lige nu. Forsyningen er forsvundet. 🎩",
  "supply.col_price": "Pris",
  "supply.col_condition": "Stand",
  "supply.col_region": "Region",
  "supply.col_source": "Kilde",
  "supply.retail": "Officiel detailpris",
  "supply.unobtainable": "Udgået — kan ikke skaffes ny",

  "hist.title": "Historiske nedslag",
  "hist.desc":
    "Verificerede, daterede priser fra offentlige kilder — fra dengang den var ny til andenhåndshandler i dag.",
  "hist.tag_retail": "Ny · detail",
  "hist.tag_sold": "Brugt · solgt",
  "hist.tag_asking": "Brugt · udbudt",
  "hist.caption":
    "Spredte, enkeltvis kildebelagte nedslag — ikke en kurve. Hvert punkt linker til sin kilde. Vokser efterhånden som flere daterede omtaler dukker op.",

  "copy.title": "Vurdér dit eget eksemplar",
  "copy.subtitle": "Har du købt et engang? Se hvordan det har klaret sig — mod markedet og mod inflationen.",
  "copy.paid": "Hvad du betalte (kr)",
  "copy.when": "Hvornår du købte det",
  "copy.region": "Region",
  "copy.optional": "(valgfrit)",
  "copy.reveal": "Afslør",
  "copy.clear": "Ryd",
  "copy.disclosure":
    "Din indtastning indgår anonymt i fællesgennemsnittet — vi gemmer kun et tilfældigt browser-id, prisen, måneden og evt. region. Ingen navn, e-mail eller IP. “Ryd” nulstiller værktøjet på din enhed; dit anonyme datapunkt bliver i gennemsnittet (skriv for at fjerne det).",
  "copy.no_market":
    "Der er ingen eksemplarer på markedet lige nu, så der er intet at vurdere dit op imod. Kom igen, når et er til salg.",
  "copy.value_today": "Anslået værdi i dag",
  "copy.since": "siden du betalte {paid} kr i {month}",
  "copy.real_line_a": "Efter inflation svarer det til",
  "copy.real_line_b": "i nutidens kroner — altså",
  "copy.real_terms": "{pct}% reelt",
  "copy.beat": "det slog inflationen",
  "copy.trailed": "det haltede efter inflationen",
  "copy.annual": "Det er cirka {pct}%/år over {years} år.",
  "copy.disclaimer": "Baseret på den aktuelle median-udbudspris — et skøn, ikke et garanteret salg.",
  "copy.compare_above": "du betalte over de fleste.",
  "copy.compare_below": "du fik det under de fleste.",
  "copy.compare_on": "lige på medianen.",
  "copy.compare_pre": "På tværs af {n} selvrapporterede eksemplarer er medianprisen",
  "copy.teaser_one": "🫂 {n} samler har registreret et eksemplar — median betalt {price} kr. Tilføj dit ovenfor.",
  "copy.teaser_other": "🫂 {n} samlere har registreret et eksemplar — median betalt {price} kr. Tilføj dit ovenfor.",
  "copy.verdict_multi": "🪄 Et omvendt forsvindingsnummer — dit eksemplar er mangedoblet.",
  "copy.verdict_up": "📈 Flot — det er steget i værdi.",
  "copy.verdict_flat": "≈ Cirka uændret — en stabil beholdning.",
  "copy.verdict_down": "📉 Nede på papiret — men du ejer et stykke dansk komediehistorie.",

  "mycopychart.title": "Dit eksemplar siden {month}",
  "mycopychart.inflation": "Hvis det fulgte inflationen",
  "mycopychart.today": "Værd i dag (Poxyndeks)",
  "mycopychart.caption":
    "Guld: hvad du betalte, hvis det blot havde fulgt inflationen. Rød prik: hvad Poxyndekset vurderer det til i dag.",

  "sxrace.title": "Din Poxycat vs. SpaceX siden {year}",
  "sxrace.poxy": "Din kopi",
  "sxrace.spacex": "SpaceX",
  "sxrace.caption":
    "Indekseret til 100 i {year}. SpaceX-værdier er omtrentlige (fra rapporterede runder) — kun til illustration.",

  "comm.title": "Hvad folk har betalt gennem årene",
  "comm.desc":
    "Selvrapporteret median betalt, efter købsår ({n} eksemplarer). Dit eget køb er den røde prik.",
  "comm.median_paid": "median betalt",

  "world.zero": "Ingen annoncer fundet",
  "world.body_pre": "Poxycat-økonomien er endnu ikke gået globalt. Uden for Danmark handles",
  "world.body_post": "til en antydet pris på",
  "world.infinity": "— der er simpelthen ingen at få.",
  "world.switch": "Skift tilbage til 🇩🇰 Danmark for rigtige data.",

  "foot.tagline": "En ikke-kommerciel kuriositet. Aggregerede, anonymiserede data.",
  "foot.method": "Metode & privatliv →",
  "foot.updated": "Sidst opdateret {time}",
  "foot.awaiting": "Afventer første opdatering",

  "err.notconnected": "Live-data er ikke forbundet i dette miljø.",

  "method.back": "← Tilbage til indekset",
  "method.title_pre": "Metode &",
  "method.title_em": "privatliv",
  "method.what_h": "Hvad er det her",
  "method.what_p":
    "Poxyndekset følger andenhåndsprisen på Mr. Poxycat & Co. (2007, Nordisk Film), en dansk dvd der har været udgået i årevis. I samme ånd som The Economists Big Mac-indeks bruger det én absurd specifik vare til at fortælle en lille historie om priser, lønninger og regionale forskelle i Danmark. Det er ikke-kommercielt og lavet for sjov.",
  "method.how_h": "Sådan laves tallene",
  "method.how_li1":
    "En scraper tjekker danske genbrugsmarkedspladser (DBA, Gul og Gratis) flere gange dagligt og registrerer udbudspris, grov region og stand for hver ægte annonce.",
  "method.how_li2":
    "Solgt udledes, ikke observeret. Når en annonce forsvinder og bliver væk ud over en frist, behandler vi den som solgt til sidste udbudspris. Nogle er reelt bare udløbet eller skjult, så »solgt«- og hastighedstal er skøn.",
  "method.how_li3":
    "Det reelle indeks korrigerer overskriften med dansk forbrugerprisindeks (Danmarks Statistik). Arbejdsminutter dividerer med den gennemsnitlige danske timeløn.",
  "method.how_li4":
    "I SpaceX-aktier er joke-målet: prisen på én uopnåelig dvd udtrykt i aktier i verdens mest eftertragtede uopnåelige aktiv. SpaceX er privat, så vi bruger den antydede sekundærmarkedspris pr. aktie (~$220), omregnet til den aktuelle USD/DKK-kurs.",
  "method.how_li5": "Annoncer på mere end ét site opdages og tælles én gang.",
  "method.how_li6":
    "Da der typisk kun er en håndfuld eksemplarer til salg, er enkeltdagstal illustrative, ikke statistisk meningsfulde. Historikken er pointen.",
  "method.privacy_h": "Privatliv",
  "method.privacy_p":
    "Vi gemmer kun aggregerede, anonymiserede data: en pris (et faktum), en grov region, en standkategori og et envejs-hashet annonce-id. Vi gemmer eller viser ikke sælgernavne, kontaktoplysninger, præcise adresser eller annoncefotos. Er du sælger og vil have et datapunkt fjernet, så skriv til",
  "method.community_h": "Fællesskabsdata",
  "method.community_p":
    "»Vurdér dit eget eksemplar«-værktøjet lader dig registrere, hvad du betalte. Det indgår i et anonymt, selvrapporteret fællesgennemsnit, der vises adskilt fra det scrapede indeks — det påvirker aldrig overskrifts-Poxyndekset. Vi gemmer kun et tilfældigt browser-id, prisen, måneden og evt. region — ingen navn, e-mail eller IP. Hver enhed har én indtastning (den første værdi beholdes, så tomgangstest ikke hober sig op), værdier valideres, og tallet er en median, så enkeltindtastninger ikke skævvrider. »Ryd« nulstiller værktøjet på din enhed; dit anonyme punkt bliver i gennemsnittet — for at fjerne det, skriv til",
  "method.notaffil":
    "Ikke tilknyttet The Economist, Nordisk Film, DBA, SpaceX eller nogen, der optræder i Mr. Poxycat & Co.",
};

const en: Record<string, string> = {
  "nav.denmark": "Denmark",
  "nav.world": "World",
  "sound.on": "Sound on",
  "sound.off": "Sound off",
  "lang.label": "Language",

  "hero.tagline_pre": "A price index for",
  "hero.tagline_post":
    "— the out-of-print Danish DVD. Tracking the second-hand value of the nation's least liquid asset.",
  "hero.headline": "Headline price",
  "hero.copies_one": "{n} copy on the market in Denmark",
  "hero.copies_other": "{n} copies on the market in Denmark",
  "hero.thin_note": "thin market — headline is illustrative, not a trend",

  "metric.spacex": "In SpaceX shares",
  "metric.spacex_sub": "at implied private valuation",
  "metric.work": "Work to afford one",
  "metric.work_sub": "at the average Danish wage",
  "metric.real": "In 2025-kroner",
  "metric.real_sub": "CPI-adjusted (real)",
  "metric.velocity": "Median time to sell",
  "metric.days": "days",
  "metric.gap": "{n}% bid–ask gap",
  "metric.awaiting": "awaiting sales",
  "metric.min": "min",
  "metric.hr": "hr",

  "chart.title": "The Poxyndex over time",
  "chart.subtitle": "nominal vs. constant kroner",
  "chart.collecting": "Collecting history…",
  "chart.collecting_body":
    "The Poxyndex needs at least two daily readings to draw a trend. Come back tomorrow — this market moves at the speed of a rare DVD.",
  "chart.asking": "Asking price",
  "chart.real": "In 2025-kroner",

  "region.title": "Regional Poxy-PPP",
  "region.desc": "Where is a Poxycat over- or under-valued? Median asking price by region.",
  "region.empty": "Not enough listings across regions yet to compute a spread.",

  "supply.title": "National supply",
  "supply.desc": "Every Poxycat for sale in Denmark, right now. Anonymised to region.",
  "supply.empty": "No copies currently for sale. The supply has vanished. 🎩",
  "supply.col_price": "Price",
  "supply.col_condition": "Condition",
  "supply.col_region": "Region",
  "supply.col_source": "Source",
  "supply.retail": "Official retail",
  "supply.unobtainable": "Udgået — unobtainable new",

  "hist.title": "Historical anchors",
  "hist.desc":
    "Verified, dated prices from public sources — from when it was new to second-hand trades today.",
  "hist.tag_retail": "New · retail",
  "hist.tag_sold": "Used · sold",
  "hist.tag_asking": "Used · asking",
  "hist.caption":
    "Sparse, individually sourced data points — not a fitted trend. Each links to its source. Grows as more dated mentions surface.",

  "copy.title": "Value your own copy",
  "copy.subtitle": "Bought one once? See how it's aged — against the market and against inflation.",
  "copy.paid": "What you paid (kr)",
  "copy.when": "When you bought it",
  "copy.region": "Region",
  "copy.optional": "(optional)",
  "copy.reveal": "Reveal",
  "copy.clear": "Clear",
  "copy.disclosure":
    "Your entry anonymously joins the community average — we store only a random in-browser ID, the price, the month, and optional region. No name, email, or IP. “Clear” resets this tool on your device; your anonymous data point stays in the average (email to remove it).",
  "copy.no_market":
    "No copies are on the market right now, so there's nothing to value yours against. Check back when one's listed.",
  "copy.value_today": "Estimated value today",
  "copy.since": "since you paid {paid} kr in {month}",
  "copy.real_line_a": "After inflation, that's",
  "copy.real_line_b": "in today's money — so",
  "copy.real_terms": "{pct}% in real terms",
  "copy.beat": "it beat inflation",
  "copy.trailed": "it trailed inflation",
  "copy.annual": "That's roughly {pct}%/year over {years} years.",
  "copy.disclaimer": "Based on the current median asking price — an estimate, not a guaranteed sale.",
  "copy.compare_above": "you paid above the pack.",
  "copy.compare_below": "you got it below the pack.",
  "copy.compare_on": "right on the median.",
  "copy.compare_pre": "Across {n} self-reported copies, the median paid is",
  "copy.teaser_one": "🫂 {n} collector has logged a copy — median paid {price} kr. Add yours above.",
  "copy.teaser_other": "🫂 {n} collectors have logged a copy — median paid {price} kr. Add yours above.",
  "copy.verdict_multi": "🪄 A vanishing act in reverse — your copy multiplied.",
  "copy.verdict_up": "📈 Nicely done — it appreciated.",
  "copy.verdict_flat": "≈ Roughly a wash — a steady hold.",
  "copy.verdict_down": "📉 Down on paper — but you own a piece of Danish comedy history.",

  "mycopychart.title": "Your copy since {month}",
  "mycopychart.inflation": "If it tracked inflation",
  "mycopychart.today": "Worth today (Poxyndex)",
  "mycopychart.caption":
    "Gold: what you paid, had it merely kept pace with inflation. Red dot: what the Poxyndex values it at today.",

  "sxrace.title": "Your Poxycat vs. SpaceX since {year}",
  "sxrace.poxy": "Your copy",
  "sxrace.spacex": "SpaceX",
  "sxrace.caption":
    "Indexed to 100 in {year}. SpaceX figures are approximate (from reported rounds) — illustrative only.",

  "comm.title": "What people paid over the years",
  "comm.desc": "Self-reported median paid, by purchase year ({n} copies). Your own purchase is the red dot.",
  "comm.median_paid": "median paid",

  "world.zero": "No listings found",
  "world.body_pre": "The Poxycat economy has not yet gone global. Outside Denmark,",
  "world.body_post": "trades at an implied price of",
  "world.infinity": "— there is simply none to be had.",
  "world.switch": "Switch back to 🇩🇰 Denmark for actual data.",

  "foot.tagline": "A non-commercial curiosity. Aggregated, anonymised data.",
  "foot.method": "Methodology & privacy →",
  "foot.updated": "Last updated {time}",
  "foot.awaiting": "Awaiting first update",

  "err.notconnected": "Live data isn't connected in this environment.",

  "method.back": "← Back to the index",
  "method.title_pre": "Methodology &",
  "method.title_em": "privacy",
  "method.what_h": "What this is",
  "method.what_p":
    "The Poxyndex tracks the second-hand price of Mr. Poxycat & Co. (2007, Nordisk Film), a Danish DVD that has been out of print for years. In the spirit of The Economist's Big Mac Index, it uses one absurdly specific good to tell a small story about prices, wages and regional differences in Denmark. It is non-commercial and made for fun.",
  "method.how_h": "How the numbers are made",
  "method.how_li1":
    "A scraper checks Danish second-hand marketplaces (DBA, Gul og Gratis) several times a day and records the asking price, coarse region and condition of any genuine listing.",
  "method.how_li2":
    "Sold is inferred, not observed. When a listing disappears and stays gone past a grace window, we treat it as sold at its last asking price. Some are really just expired or hidden, so the “sold” and velocity figures are estimates.",
  "method.how_li3":
    "The real index deflates the headline by Danish CPI (Statistics Denmark). Work-minutes divides by the average Danish hourly wage.",
  "method.how_li4":
    "In SpaceX shares is the joke metric: the price of one unobtainable DVD expressed in shares of the world's most coveted unobtainable asset. SpaceX is private, so we use its implied secondary-market price per share (~$220), converted at the live USD/DKK rate.",
  "method.how_li5": "Listings posted on more than one site are detected and counted once.",
  "method.how_li6":
    "With usually only a handful of copies for sale, single-day figures are illustrative, not statistically meaningful. The history is the point.",
  "method.privacy_h": "Privacy",
  "method.privacy_p":
    "We store only aggregated, anonymised data: a price (a fact), a coarse region, a condition category and a one-way hashed listing id. We do not store or display seller names, contact details, exact addresses, or listing photos. If you are a seller and want a data point removed, email",
  "method.community_h": "Community data",
  "method.community_p":
    "The “value your own copy” tool lets you log what you paid. That joins an anonymous, self-reported community average shown separately from the scraped index — it never affects the headline Poxyndex. We store only a random in-browser ID, the price, the month, and an optional region — no name, email, or IP. Each device keeps a single entry (the first value is kept, so idle testing can't pile up), values are bounds-checked, and the figure shown is a median, so stray inputs can't skew it. “Clear” resets the tool on your device; your anonymous point remains in the average — to remove it, email",
  "method.notaffil":
    "Not affiliated with The Economist, Nordisk Film, DBA, SpaceX, or anyone who appears in Mr. Poxycat & Co.",
};

const DICTS: Record<Lang, Record<string, string>> = { da, en };

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LangContext = createContext<Ctx | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("da");

  useEffect(() => {
    try {
      const s = localStorage.getItem(LS_KEY);
      if (s === "da" || s === "en") setLangState(s);
    } catch {
      /* ignore */
    }
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    try {
      localStorage.setItem(LS_KEY, l);
    } catch {
      /* ignore */
    }
    if (typeof document !== "undefined") document.documentElement.lang = l;
  }

  function t(key: string, vars?: Record<string, string | number>) {
    let s = DICTS[lang][key] ?? en[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      }
    }
    return s;
  }

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export function useLang(): Ctx {
  const c = useContext(LangContext);
  if (!c) throw new Error("useLang must be used within LangProvider");
  return c;
}
