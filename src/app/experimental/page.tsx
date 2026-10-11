import type { Metadata } from "next";
import Link from "next/link";
import { PageTitle } from "@/components/type/PageTitle";
import { getExperiments } from "@/lib/content";
import styles from "./experimental.module.css";

// Work in progress: kept out of search engines and the sitemap.
export const metadata: Metadata = { title: "Experimental", robots: { index: false, follow: false } };

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export default function ExperimentalPage() {
  const experiments = getExperiments();
  return (
    <div className="container">
      <PageTitle>Experimental</PageTitle>
      <p className={styles.intro}>
        Studies in how the works can be shown online. Work in progress — these pages are not finished.
      </p>
      {experiments.length === 0 ? (
        <p className={styles.empty}>No experiments yet.</p>
      ) : (
        <ol className={styles.list}>
          {experiments.map((e) => (
            <li key={e.href}>
              <Link href={e.href} className={styles.row}>
                <span className={styles.number}>Experiment {e.number}</span>
                <span className={styles.title}>{e.title}</span>
                <span className={styles.meta}>
                  {e.summary && <span className={styles.summary}>{e.summary}</span>}
                  {e.date && <time dateTime={e.date.toISOString().slice(0, 10)}>{dateFormat.format(e.date)}</time>}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
