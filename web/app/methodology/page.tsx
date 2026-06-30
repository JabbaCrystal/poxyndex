"use client";

import { useLang } from "@/lib/i18n";

const EMAIL = "jabbacrystal@gmail.com";

export default function Methodology() {
  const { t } = useLang();
  return (
    <main className="relative min-h-screen">
      <article className="mx-auto max-w-2xl px-5 py-12">
        <a href="/" className="text-sm hover:underline" style={{ color: "#FF4A33" }}>
          {t("method.back")}
        </a>
        <h1 className="mt-4 font-serif text-3xl font-bold">
          {t("method.title_pre")} <span className="iri-text">{t("method.title_em")}</span>
        </h1>

        <h2 className="mt-8 font-serif text-xl font-bold text-cloud">{t("method.what_h")}</h2>
        <p className="mt-2 text-muted">{t("method.what_p")}</p>

        <h2 className="mt-8 font-serif text-xl font-bold text-cloud">{t("method.how_h")}</h2>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-muted">
          <li>{t("method.how_li1")}</li>
          <li>{t("method.how_li2")}</li>
          <li>{t("method.how_li3")}</li>
          <li>{t("method.how_li4")}</li>
          <li>{t("method.how_li5")}</li>
          <li>{t("method.how_li6")}</li>
        </ul>

        <h2 className="mt-8 font-serif text-xl font-bold text-cloud">{t("method.privacy_h")}</h2>
        <p className="mt-2 text-muted">
          {t("method.privacy_p")}{" "}
          <a className="hover:underline" style={{ color: "#FF4A33" }} href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>
          .
        </p>

        <h2 className="mt-8 font-serif text-xl font-bold text-cloud">{t("method.community_h")}</h2>
        <p className="mt-2 text-muted">
          {t("method.community_p")}{" "}
          <a className="hover:underline" style={{ color: "#FF4A33" }} href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>
          .
        </p>

        <p className="mt-8 text-xs text-muted/70">{t("method.notaffil")}</p>
      </article>
    </main>
  );
}
