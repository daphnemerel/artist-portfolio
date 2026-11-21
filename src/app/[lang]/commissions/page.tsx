import type { Metadata } from "next";
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
 * title, lead, the three steps as rows between hairlines, and a
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

          <h2 className="visually-hidden">{t.stepsLabel}</h2>
          <ol className={styles.steps}>
            {t.steps.map((s, i) => (
              <li key={s.title} className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">
                  {i + 1}
                </span>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepText}>{s.text}</p>
              </li>
            ))}
          </ol>

          <p className={styles.actions}>
            <a href="#aanvraag" className={styles.button}>
              {t.ask} <span aria-hidden="true">↓</span>
            </a>
            <span className={styles.note}>{t.priceNote}</span>
          </p>
        </section>
      </div>

      <div className="container" data-tight-footer="">
        <CommissionForm works={works} email={site.email} />
      </div>
    </>
  );
}
