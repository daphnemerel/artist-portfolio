import { getImageProps } from "next/image";
import Link from "next/link";
import { Caption } from "@/components/media/Caption";
import { FadeImage } from "@/components/media/FadeImage";
import { getFeaturedWorks, getSite, getWorks } from "@/lib/content";
import styles from "./home.module.css";

export default function HomePage() {
  const site = getSite();
  const works = getWorks();
  const hero = getFeaturedWorks()[0] ?? works[0];

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

      {/* Experiment: full-bleed studio photograph with the header laid over it. */}
      <section className={styles.studio} data-hero="bleed" aria-label="Studio">
        <picture>
          <source media="(orientation: landscape)" srcSet={landscape} />
          <source srcSet={portraitSrcSet} />
          <img {...portrait} alt={portrait.alt} className={styles.studioImage} />
        </picture>
      </section>
      <p className={styles.studioCaption}>Studio view with Catching Waves, 2026</p>

      {hero && (
        <section className={styles.hero} aria-label="Featured work">
          <figure
            className={styles.heroFigure}
            // Fill the first screen's height (or the page width), whichever comes first.
            style={{
              width: `min(100%, calc((100svh - 200px) * ${hero.images[0].width / hero.images[0].height}))`,
            }}
          >
            <Link href={`/works/${hero.slug}`}>
              <FadeImage
                src={hero.images[0].url}
                alt={hero.images[0].alt}
                width={hero.images[0].width}
                height={hero.images[0].height}
                sizes="100vw"
                quality={90}
                priority
                className={styles.heroImage}
              />
            </Link>
            <figcaption>
              <Caption work={hero} full />
            </figcaption>
          </figure>
        </section>
      )}

      {/* Closing banner, just above the footer. */}
      <section className={styles.banner} aria-labelledby="banner-title">
        <div>
          <h2 id="banner-title" className={styles.bannerTitle}>
            {site.name}
          </h2>
          <p className={styles.bannerText}>Selected works, studio practice and exhibitions.</p>
        </div>
        <Link href="/works" className={styles.bannerLink}>
          View Works →
        </Link>
      </section>
    </div>
  );
}
