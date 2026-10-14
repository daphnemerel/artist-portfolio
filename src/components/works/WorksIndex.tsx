"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useI18n } from "@/i18n/client";
import type { WorkSummary } from "@/lib/content";
import { WorkCard } from "./WorkCard";
import styles from "./WorksIndex.module.css";

type View = "images" | "list";

export function WorksIndex({ works }: { works: WorkSummary[] }) {
  const { locale, t: dict, href } = useI18n();
  const t = dict.works;
  const [view, setView] = useState<View>("images");
  const [series, setSeries] = useState<string | null>(null);

  const allSeries = useMemo(
    () => [...new Set(works.map((w) => w.series).filter((s): s is string => Boolean(s)))],
    [works],
  );
  const visible = series ? works.filter((w) => w.series === series) : works;

  return (
    <>
      <div className={styles.controls}>
        {allSeries.length > 0 && (
          <ul className={styles.filters} aria-label={t.filter}>
            <li>
              <button type="button" aria-pressed={series === null} onClick={() => setSeries(null)}>
                {t.all}
              </button>
            </li>
            {allSeries.map((s) => (
              <li key={s}>
                <button type="button" aria-pressed={series === s} onClick={() => setSeries(s)}>
                  {s}
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className={styles.views} aria-label={t.view}>
          <button type="button" aria-pressed={view === "images"} onClick={() => setView("images")}>
            {t.images}
          </button>
          <button type="button" aria-pressed={view === "list"} onClick={() => setView("list")}>
            {t.list}
          </button>
        </div>
      </div>

      {view === "images" ? (
        <ul className={styles.grid}>
          {visible.map((work, i) => (
            <li key={work.slug}>
              <WorkCard work={work} locale={locale} priority={i < 4} />
            </li>
          ))}
        </ul>
      ) : (
        <table className={styles.list}>
          <thead className="visually-hidden">
            <tr>
              <th>{t.year}</th>
              <th>{t.titleColumn}</th>
              <th>{t.medium}</th>
              <th>{t.dimensions}</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((work) => (
              <tr key={work.slug}>
                <td className={styles.year}>{work.year}</td>
                <td>
                  <Link href={href(`/works/${work.slug}`)}>
                    {work.title}
                  </Link>
                </td>
                <td className={styles.meta}>{work.medium}</td>
                <td className={styles.meta}>{work.dimensions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
