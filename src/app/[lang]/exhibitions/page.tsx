import type { Metadata } from "next";
import Link from "next/link";
import { Label } from "@/components/type/Label";
import { PageTitle } from "@/components/type/PageTitle";
import { alternates } from "@/i18n/metadata";
import { getI18n } from "@/i18n/server";
import { getExhibitions, groupByYear, type Exhibition } from "@/lib/content";
import styles from "./exhibitions.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return { title: t.exhibitions.title, ...alternates(locale, "/exhibitions") };
}

export default async function ExhibitionsPage() {
  const { locale, t, href } = await getI18n();
  const exhibitions = getExhibitions(locale);
  const sections: { label: string; types: Exhibition["type"][] }[] = [
    { label: t.exhibitions.solo, types: ["solo"] },
    { label: t.exhibitions.group, types: ["group", "fair", "screening"] },
  ];

  return (
    <div className="container">
      <PageTitle>{t.exhibitions.title}</PageTitle>
      {sections.map(({ label, types }) => {
        const items = exhibitions.filter((e) => types.includes(e.type));
        if (items.length === 0) return null;
        return (
          <section key={label} className={styles.section}>
            <Label as="h2">{label}</Label>
            <ol className={styles.years}>
              {groupByYear(items).map(([year, entries]) => (
                <li key={year ?? "undated"} className={styles.year}>
                  <span className={styles.yearLabel}>{year ?? t.exhibitions.yearToBeAdded}</span>
                  <ul>
                    {entries.map((e) => (
                      <li key={`${e.title}-${e.venue}`} className={styles.entry}>
                        <span className={styles.title}>
                          {e.works[0] ? <Link href={href(`/works/${e.works[0]}`)}>{e.title}</Link> : e.title}
                        </span>
                        <span className={styles.venue}>
                          {e.url ? (
                            <a href={e.url} rel="noopener noreferrer">
                              {e.venue}
                            </a>
                          ) : (
                            e.venue
                          )}
                          , {e.city}
                        </span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
