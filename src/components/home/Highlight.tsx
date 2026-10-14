import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { format, localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Site, Work } from "@/lib/content";
import styles from "./Highlight.module.css";

const Icon = ({ children }: { children: ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={styles.icon}
  >
    {children}
  </svg>
);
const pin = (
  <>
    <path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11Z" />
    <circle cx="12" cy="10" r="2.3" />
  </>
);
const clock = (
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </>
);
const external = <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />;
const map = (
  <>
    <path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2Z" />
    <path d="M9 4v14M15 6v14" />
  </>
);

/**
 * A current exhibition on the homepage: the work, a short note and button, then the venue
 * (name, address, opening hours, links) and a small map, on a pale pink band.
 */
export function Highlight({
  highlight,
  work,
  locale,
  t,
}: {
  highlight: NonNullable<Site["highlight"]>;
  work: Work;
  locale: Locale;
  t: Dictionary;
}) {
  const image = work.images[0];
  const venue = highlight.venue;
  const mapsLink = venue && `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.map)}`;
  const mapsEmbed =
    venue && `https://maps.google.com/maps?q=${encodeURIComponent(venue.map)}&z=15&hl=${locale}&output=embed`;

  return (
    <section className={styles.band} aria-labelledby="highlight-title" data-venue={venue ? "" : undefined}>
      <div className={styles.inner}>
        <Link
          href={localePath(locale, `/works/${work.slug}`)}
          className={styles.work}
          tabIndex={-1}
          aria-hidden="true"
        >
          <Image
            src={image.url}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes="(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 25vw"
            quality={90}
            className={styles.image}
          />
        </Link>

        <div className={styles.info}>
          <p className={styles.eyebrow}>{highlight.eyebrow}</p>
          <h2 id="highlight-title" className={styles.title}>
            {highlight.title}
          </h2>
          <p className={styles.text}>{highlight.text}</p>
          <Link href={localePath(locale, highlight.link.href)} className={styles.button}>
            {highlight.link.label} <span aria-hidden="true">→</span>
          </Link>
        </div>

        {venue && (
          <>
            <div className={styles.venue}>
              <p className={styles.venueName}>{venue.name}</p>
              {venue.lines.length > 0 && (
                <p className={styles.venueLines}>
                  {venue.lines.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </p>
              )}
              <hr className={styles.venueRule} />
              <dl className={styles.facts}>
                <div className={styles.fact}>
                  <Icon>{pin}</Icon>
                  <dt className="visually-hidden">{t.venue.address}</dt>
                  <dd>
                    {venue.address.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </dd>
                </div>
                {venue.hours.length > 0 && (
                  <div className={styles.fact}>
                    <Icon>{clock}</Icon>
                    <dt>{t.venue.hours}</dt>
                    <dd>
                      {venue.hours.map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
              <ul className={styles.venueLinks}>
                {venue.website && (
                  <li>
                    <a href={venue.website} target="_blank" rel="noopener noreferrer">
                      <Icon>{external}</Icon>
                      {t.venue.website} <span aria-hidden="true">→</span>
                    </a>
                  </li>
                )}
                <li>
                  <a href={mapsLink} target="_blank" rel="noopener noreferrer">
                    <Icon>{map}</Icon>
                    {t.venue.location} <span aria-hidden="true">→</span>
                  </a>
                </li>
              </ul>
            </div>

            <div className={styles.map}>
              <iframe
                src={mapsEmbed}
                title={format(t.venue.map, { name: venue.name })}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className={styles.mapFrame}
              />
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.mapButton}
                tabIndex={-1}
                aria-hidden="true"
              >
                <Icon>{pin}</Icon>
                {t.venue.location} <span aria-hidden="true">→</span>
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
