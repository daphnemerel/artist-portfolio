import type { Metadata } from "next";
import Link from "next/link";
import { Label } from "@/components/type/Label";
import { PageTitle } from "@/components/type/PageTitle";
import { getExhibitions, groupByYear, type Exhibition } from "@/lib/content";
import styles from "./exhibitions.module.css";

export const metadata: Metadata = { title: "Exhibitions" };

const sections: { label: string; types: Exhibition["type"][] }[] = [
  { label: "Solo exhibitions", types: ["solo"] },
  { label: "Group exhibitions", types: ["group", "fair", "screening"] },
];

export default function ExhibitionsPage() {
  const exhibitions = getExhibitions();

  return (
    <div className="container">
      <PageTitle>Exhibitions</PageTitle>
      {sections.map(({ label, types }) => {
        const items = exhibitions.filter((e) => types.includes(e.type));
        if (items.length === 0) return null;
        return (
          <section key={label} className={styles.section}>
            <Label as="h2">{label}</Label>
            <ol className={styles.years}>
              {groupByYear(items).map(([year, entries]) => (
                <li key={year ?? "undated"} className={styles.year}>
                  <span className={styles.yearLabel}>{year ?? "Year to be added"}</span>
                  <ul>
                    {entries.map((e) => (
                      <li key={`${e.title}-${e.venue}`} className={styles.entry}>
                        <span className={styles.title}>
                          {e.works[0] ? <Link href={`/works/${e.works[0]}`}>{e.title}</Link> : e.title}
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
