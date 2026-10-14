import Image from "next/image";
import Link from "next/link";
import { format, localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Site, Work } from "@/lib/content";
import styles from "./Highlight.module.css";

/**
 * A current exhibition on the homepage, in one slim pale pink band (as tall as a work card): the
 * work, a short note and button, the venue (name, address, opening hours, links) and a small map.
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
            {/* The venue, set like a museum label: no icons, hairlines and tidy columns. */}
            <div className={styles.venue}>
              <p className={styles.venueEyebrow}>{t.venue.visit}</p>
              <p className={styles.venueName}>{venue.name}</p>
              {venue.lines.map((line) => (
                <p key={line} className={styles.venueLine}>
                  {line}
                </p>
              ))}
              <address className={styles.address}>
                {venue.address.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </address>
              {venue.hours.length > 0 && (
                <dl className={styles.hours} aria-label={t.venue.hours}>
                  {venue.hours.map((line) => {
                    const [days, ...time] = line.split(": ");
                    return (
                      <div key={line} className={styles.hoursRow}>
                        <dt>{days}</dt>
                        <dd>{time.join(": ")}</dd>
                      </div>
                    );
                  })}
                </dl>
              )}
              <p className={styles.venueLinks}>
                {venue.website && (
                  <a href={venue.website} target="_blank" rel="noopener noreferrer">
                    {t.venue.website} <span aria-hidden="true">↗</span>
                  </a>
                )}
                <a href={mapsLink} target="_blank" rel="noopener noreferrer">
                  {t.venue.route} <span aria-hidden="true">↗</span>
                </a>
              </p>
            </div>

            {/* A small map in its own colours, in a bordeaux frame; the whole tile opens the route. */}
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.map}
              aria-label={`${t.venue.location}: ${venue.name}`}
            >
              <span className={styles.mapPlan}>
                <iframe
                  src={mapsEmbed}
                  title={format(t.venue.map, { name: venue.name })}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  tabIndex={-1}
                  className={styles.mapFrame}
                />
                <span className={styles.mapTint} aria-hidden="true" />
              </span>
              <span className={styles.mapCaption} aria-hidden="true">
                <span>{t.venue.location}</span>
                <span>→</span>
              </span>
            </a>
          </>
        )}
      </div>
    </section>
  );
}
