import Link from "next/link";
import { getImageProps } from "next/image";
import { WorkCard } from "@/components/works/WorkCard";
import { getFeaturedWorks, getSite } from "@/lib/content";
import styles from "./home.module.css";

export default function HomePage() {
  const site = getSite();
  // Works with `featured: true`, newest (highest number) on the left; shown by number only for now.
  const works = getFeaturedWorks();

  // Art direction: a landscape photo for wide screens, a portrait one for tall screens.
  const studio = {
    alt: "The artist at her easel in a sunlit studio, painting Catching Waves.",
    sizes: "100vw",
    quality: 90,
    priority: true,
  };
  const { srcSet: landscape } = getImageProps({
    ...studio,
    src: "/images/studio-landscape.jpg",
    width: 1672,
    height: 941,
  }).props;
  const { srcSet: portraitSrcSet, ...portrait } = getImageProps({
    ...studio,
    src: "/images/studio-portrait.jpg",
    width: 941,
    height: 1672,
  }).props;

  return (
    <div className="container">
      <h1 className="visually-hidden">{site.name}</h1>

      {/* Full-bleed studio photograph with the header laid over it. */}
      <section className={styles.studio} data-hero="bleed" aria-label="Studio">
        <picture>
          <source media="(orientation: landscape)" srcSet={landscape} />
          <source srcSet={portraitSrcSet} />
          <img {...portrait} alt={portrait.alt} className={styles.studioImage} />
        </picture>
      </section>
      <p className={styles.studioCaption}>Studio view with Catching Waves, 2026</p>

      {/* 1. A short introduction */}
      {site.intro && (
        <section className={styles.intro} aria-labelledby="intro-title">
          <h2 id="intro-title" className={styles.introLabel}>
            {site.name}
          </h2>
          <div className={styles.introBody}>
            <p className={styles.introText}>{site.intro}</p>
            <Link href="/about" className={styles.more}>
              About {site.name.split(" ")[0]} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      )}

      {/* 2. Selected works */}
      {works.length > 0 && (
        <section className={styles.works} aria-labelledby="works-title">
          <div className={styles.worksHead}>
            <h2 id="works-title" className={styles.worksTitle}>
              Selected works
            </h2>
            <Link href="/works" className={styles.more}>
              All works <span aria-hidden="true">→</span>
            </Link>
          </div>
          <ul className={styles.grid}>
            {works.map((work) => (
              <li key={work.slug}>
                <WorkCard work={work} label={work.number ? String(work.number) : undefined} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
