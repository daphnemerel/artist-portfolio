import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Label } from "@/components/type/Label";
import { Prose } from "@/components/type/Prose";
import { alternates } from "@/i18n/metadata";
import { getI18n } from "@/i18n/server";
import { getText, getTexts } from "@/lib/content";
import styles from "../texts.module.css";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getTexts("en").map((text) => ({ slug: text.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await getI18n();
  const { slug } = await params;
  const text = getText(slug, locale);
  return text ? { title: text.title, ...alternates(locale, `/texts/${slug}`) } : {};
}

export default async function TextPage({ params }: Props) {
  const { locale, t } = await getI18n();
  const text = getText((await params).slug, locale);
  if (!text) notFound();

  return (
    <article className={`${styles.article} container`}>
      <header className={styles.articleHeader}>
        <Label>{t.texts.kinds[text.kind]}</Label>
        <h1 className={styles.articleTitle}>{text.title}</h1>
        <p className={styles.byline}>
          {[text.author, text.publication, text.year].filter(Boolean).join(", ")}
        </p>
      </header>
      <div className={styles.body}>
        <Prose html={text.html} />
      </div>
    </article>
  );
}
