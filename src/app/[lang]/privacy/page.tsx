import type { Metadata } from "next";
import { Prose } from "@/components/type/Prose";
import { alternates } from "@/i18n/metadata";
import { getI18n } from "@/i18n/server";
import { getPrivacy } from "@/lib/content";
import styles from "../texts/texts.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return {
    title: getPrivacy(locale).title,
    description: t.privacy.description,
    ...alternates(locale, "/privacy"),
  };
}

/** Privacy statement, set like a single text. The text itself is in content/privacy(.nl).md. */
export default async function PrivacyPage() {
  const { locale, t } = await getI18n();
  const privacy = getPrivacy(locale);
  return (
    <article className={`${styles.article} container`}>
      <header className={styles.articleHeader}>
        <h1 className={styles.articleTitle}>{privacy.title}</h1>
        <p className={styles.byline}>
          {t.privacy.updated} {privacy.updated}
        </p>
      </header>
      <div className={styles.body}>
        <Prose html={privacy.html} />
      </div>
    </article>
  );
}
