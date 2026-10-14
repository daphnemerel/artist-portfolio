import type { Metadata } from "next";
import Link from "next/link";
import { PageTitle } from "@/components/type/PageTitle";
import { format, localeTag } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { getExperiments } from "@/lib/content";
import styles from "./experimental.module.css";

// Work in progress: kept out of search engines and the sitemap.
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.experimental.title, robots: { index: false, follow: false } };
}

export default async function ExperimentalPage() {
  const { locale, t, href } = await getI18n();
  const dateFormat = new Intl.DateTimeFormat(localeTag[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const experiments = getExperiments(locale);
  return (
    <div className="container">
      <PageTitle>{t.experimental.title}</PageTitle>
      <p className={styles.intro}>
        {t.experimental.intro}
      </p>
      {experiments.length === 0 ? (
        <p className={styles.empty}>{t.experimental.empty}</p>
      ) : (
        <ol className={styles.list}>
          {experiments.map((e) => (
            <li key={e.href}>
              <Link href={href(e.href)} className={styles.row}>
                <span className={styles.number}>{format(t.experimental.experiment, { number: e.number })}</span>
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
