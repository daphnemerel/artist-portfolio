import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { marked } from "marked";
import { getSite } from "@/lib/content";
import styles from "./about.module.css";

export const metadata: Metadata = { title: "About" };

/*
 * About: a portrait in the studio with a text card laid over its right edge. The rounded corners
 * and the card are a deliberate exception to the codebook (§7, §2 "cards"), asked for by the
 * artist for this page; the portrait is a photograph, not an artwork.
 */
export default function AboutPage() {
  const site = getSite();
  const bio = marked.parse(site.bio, { async: false });

  return (
    <div className="container">
      <section className={styles.about} aria-labelledby="about-title" data-tight-footer="">
        <Image
          src="/images/about-daphne.jpg"
          alt="Daphne Merel, smiling, at a table in her studio, with brushes in a jar and colourful paintings behind her."
          width={537}
          height={791}
          sizes="(max-width: 700px) 100vw, 440px"
          quality={92}
          priority
          className={styles.photo}
        />

        <div className={styles.card}>
          <p className={styles.eyebrow}>{site.name}</p>
          <h1 id="about-title" className={styles.title}>
            About Daphne
          </h1>
          <div className={styles.text} dangerouslySetInnerHTML={{ __html: bio }} />
          <Link href="/contact" className={styles.more}>
            Get in touch <span aria-hidden="true">→</span>
          </Link>

          {(site.cv || site.representation.length > 0) && (
            <div className={styles.extra}>
              {site.representation.map((gallery) => (
                <p key={gallery.name}>
                  Represented by{" "}
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
                  <a href={site.cv}>Download CV (PDF)</a>
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
