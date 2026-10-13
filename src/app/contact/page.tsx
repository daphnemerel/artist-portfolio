import type { Metadata } from "next";
import Image from "next/image";
import { getSite } from "@/lib/content";
import { ContactForm } from "./ContactForm";
import styles from "./contact.module.css";

export const metadata: Metadata = { title: "Contact" };

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
export default function ContactPage() {
  const site = getSite();

  return (
    <div className="container">
      <div className={styles.contact} data-tight-footer="">
        <div className={styles.intro}>
          <p className={styles.eyebrow}>Get in touch</p>
          <h1 className={styles.title}>Contact</h1>
          <p className={styles.text}>
            I&rsquo;m always open to new opportunities, collaborations, exhibitions or just a conversation about
            art. Feel free to reach out &mdash; I&rsquo;d love to hear from you.
          </p>
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
                <dt>Email</dt>
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
                <dt>Instagram</dt>
                <dd>
                  <a href={`https://instagram.com/${site.instagram}`} rel="noopener noreferrer">
                    @{site.instagram}
                  </a>
                  <span className={styles.hint}>Also reachable by DM on Instagram</span>
                </dd>
              </div>
            )}
            {site.representation.map((gallery) => (
              <div key={gallery.name} className={styles.detail}>
                <dt>Representation</dt>
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
          alt="The artist at her easel in a sunlit studio, painting Catching Waves."
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
              Send a message
            </p>
            <p className={styles.lead}>
              Prefer to send a direct message? Use the form below and I&rsquo;ll get back to you as soon as
              possible.
            </p>
            <ContactForm email={site.email} />
          </section>
        )}
      </div>
    </div>
  );
}
