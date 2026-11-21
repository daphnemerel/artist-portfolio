import type { Metadata } from "next";
import Image from "next/image";
import { alternates } from "@/i18n/metadata";
import { getI18n } from "@/i18n/server";
import { getSite, getWorks } from "@/lib/content";
import { CommissionForm, type CommissionWork } from "./CommissionForm";
import styles from "./commissions.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return {
    title: t.commissions.title,
    description: t.commissions.lead,
    ...alternates(locale, "/commissions"),
  };
}

/**
 * Commissions — design B ("Atelier"), chosen by Daphne. One screen:
 * title, lead and a
 * button down to the request form below (choose a work, colours, a description and a size).
 * Texts in src/i18n/dictionaries.
 */
export default async function CommissionsPage() {
  const { locale, t: dict } = await getI18n();
  const t = dict.commissions;
  const site = getSite(locale);
  // Every painting, newest first, as a starting point for the request.
  const works: CommissionWork[] = getWorks(locale)
    .filter((w) => w.category === "painting")
    .map((w) => ({
      slug: w.slug,
      title: w.title,
      image: {
        url: w.images[0].url,
        alt: w.images[0].alt,
        width: w.images[0].width,
        height: w.images[0].height,
      },
    }));

  return (
    <>
      <div className={`${styles.page} container`}>
        <section className={styles.text} aria-labelledby="commissions-title">
          <h1 id="commissions-title" className={styles.title}>
            {t.title}
          </h1>
          <p className={styles.lead}>{t.lead}</p>

          <p className={styles.actions}>
            <a href="#aanvraag" className={styles.button}>
              {t.ask} <span aria-hidden="true">↓</span>
            </a>
            <span className={styles.note}>{t.priceNote}</span>
          </p>

          <figure className={styles.photo}>
            <Image
              src="/images/commissions-egret.jpg"
              alt={t.photoAlt}
              width={1061}
              height={1403}
              sizes="(max-width: 900px) 100vw, 22rem"
              quality={90}
              priority
              className={styles.photoImage}
            />
            <figcaption className={styles.caption}>{t.photoCaption}</figcaption>
          </figure>
        </section>
      </div>

      <div className="container" data-tight-footer="">
        <CommissionForm works={works} email={site.email} />
      </div>
    </>
  );
}
