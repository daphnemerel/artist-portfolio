import type { Metadata } from "next";
import Image from "next/image";
import { alternates } from "@/i18n/metadata";
import { getI18n } from "@/i18n/server";
import { getSite } from "@/lib/content";
import { ContactForm } from "./ContactForm";
import styles from "./contact.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return { title: t.contact.title, ...alternates(locale, "/contact") };
}

const icon = (children: React.ReactNode) => (
  <svg
    viewBox="0 0 24 24"
    width={24}
    height={24}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={styles.icon}
  >
    {children}
  </svg>
);

/** Contact: introduction and details, a studio photograph, and a message form. */
export default async function ContactPage() {
  const { locale, t } = await getI18n();
  const site = getSite(locale);

  return (
    <div className="container">
      <div className={styles.contact} data-tight-footer="">
        <div className={styles.intro}>
          <p className={styles.eyebrow}>{t.contact.eyebrow}</p>
          <h1 className={styles.title}>{t.contact.title}</h1>
          <p className={styles.text}>{t.contact.text}</p>
          <span className={styles.rule} aria-hidden="true" />

          <dl className={styles.details}>
            {site.email && (
              <div className={styles.detail}>
                {icon(
                  <>
                    <rect x="3" y="5" width="18" height="14" />
                    <path d="m3 6 9 7 9-7" />
                  </>,
                )}
                <dt>{t.contact.email}</dt>
                <dd>
                  <a href={`mailto:${site.email}`}>{site.email}</a>
                </dd>
              </div>
            )}
            {site.instagram && (
              <div className={styles.detail}>
                {icon(
                  <>
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <path d="M17.5 6.5v.01" />
                  </>,
                )}
                <dt>{t.contact.instagram}</dt>
                <dd>
                  <a href={`https://instagram.com/${site.instagram}`} rel="noopener noreferrer">
                    @{site.instagram}
                  </a>
                  <span className={styles.hint}>{t.contact.instagramHint}</span>
                </dd>
              </div>
            )}
            {site.representation.map((gallery) => (
              <div key={gallery.name} className={styles.detail}>
                <dt>{t.contact.representation}</dt>
                <dd>
                  {gallery.url ? (
                    <a href={gallery.url} rel="noopener noreferrer">
                      {gallery.name}
                    </a>
                  ) : (
                    gallery.name
                  )}
                  <span className={styles.hint}>{gallery.city}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <Image
          src="/images/studio-portrait.jpg"
          alt={t.contact.photoAlt}
          width={941}
          height={1672}
          sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 30vw"
          quality={90}
          priority
          className={styles.photo}
        />

        {site.email && (
          <section className={styles.message} aria-labelledby="message-title">
            <p id="message-title" className={styles.eyebrow}>
              {t.contact.messageEyebrow}
            </p>
            <p className={styles.lead}>{t.contact.lead}</p>
            <ContactForm email={site.email} />
          </section>
        )}
      </div>
    </div>
  );
}
