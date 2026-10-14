import type { Metadata } from "next";
import { PageTitle } from "@/components/type/PageTitle";
import { alternates } from "@/i18n/metadata";
import { getI18n } from "@/i18n/server";
import { getSite } from "@/lib/content";
import styles from "./commissions.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return { title: t.commissions.title, ...alternates(locale, "/commissions") };
}

// PLACEHOLDER — replace with Daphne's own text about how commissions work.
export default async function CommissionsPage() {
  const { locale, t } = await getI18n();
  const site = getSite(locale);
  const subject = encodeURIComponent(t.commissions.subject);

  return (
    <div className="container">
      <PageTitle>{t.commissions.title}</PageTitle>
      <div className={styles.commissions}>
        <p className={styles.muted}>{t.commissions.placeholder}</p>
        {site.email && (
          <a href={`mailto:${site.email}?subject=${subject}`} className="button">
            {t.commissions.ask} →
          </a>
        )}
      </div>
    </div>
  );
}
