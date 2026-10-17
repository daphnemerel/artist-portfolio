import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { marked } from "marked";
import { alternates } from "@/i18n/metadata";
import { getI18n } from "@/i18n/server";
import { getSite } from "@/lib/content";
import styles from "./about.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return { title: t.about.title, ...alternates(locale, "/about") };
}

/*
 * About: a portrait in the studio with a text card laid over its right edge. The rounded corners
 * and the card are a deliberate exception to the codebook (§7, §2 "cards"), asked for by the
 * artist for this page; the portrait is a photograph, not an artwork.
 */
export default async function AboutPage() {
  const { locale, t, href } = await getI18n();
  const site = getSite(locale);
  const bio = marked.parse(site.bio, { async: false });

  return (
    <div className="container">
      <section className={styles.about} aria-labelledby="about-title" data-tight-footer="">
        <Image
          src="/images/about-daphne-portrait.jpg"
          alt={t.about.photoAlt}
          width={560}
          height={825}
          sizes="(max-width: 700px) 100vw, 440px"
          quality={92}
          priority
          className={styles.photo}
        />

        <div className={styles.card}>
          <p className={styles.eyebrow}>{site.name}</p>
          <h1 id="about-title" className={styles.title}>
            {t.about.heading}
          </h1>
          <div className={styles.text} dangerouslySetInnerHTML={{ __html: bio }} />
          <Link href={href("/contact")} className={styles.more}>
            {t.about.getInTouch} <span aria-hidden="true">→</span>
          </Link>

          {(site.cv || site.representation.length > 0) && (
            <div className={styles.extra}>
              {site.representation.map((gallery) => (
                <p key={gallery.name}>
                  {t.about.representedBy}{" "}
                  {gallery.url ? (
                    <a href={gallery.url} rel="noopener noreferrer">
                      {gallery.name}
                    </a>
                  ) : (
                    gallery.name
                  )}
                  , {gallery.city}
                </p>
              ))}
              {site.cv && (
                <p>
                  <a href={site.cv}>{t.about.cv}</a>
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
