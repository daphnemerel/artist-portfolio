import type { Metadata } from "next";
import Link from "next/link";
import { PageTitle } from "@/components/type/PageTitle";
import { alternates } from "@/i18n/metadata";
import { getI18n } from "@/i18n/server";
import { getTexts } from "@/lib/content";
import styles from "./texts.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return { title: t.texts.title, ...alternates(locale, "/texts") };
}

export default async function TextsPage() {
  const { locale, t, href } = await getI18n();
  const texts = getTexts(locale);
  return (
    <div className="container">
      <PageTitle>{t.texts.title}</PageTitle>
      <ul className={styles.list}>
        {texts.map((text) => (
          <li key={text.slug}>
            <Link href={href(`/texts/${text.slug}`)} className={styles.row}>
              <span className={styles.kind}>{t.texts.kinds[text.kind]}</span>
              <span className={styles.title}>{text.title}</span>
              <span className={styles.meta}>
                {[text.author, text.publication, text.year].filter(Boolean).join(", ")}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
