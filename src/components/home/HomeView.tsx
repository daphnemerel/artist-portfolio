import Image from "next/image";
import Link from "next/link";
import { getImageProps } from "next/image";
import { WorkCard } from "@/components/works/WorkCard";
import { Highlight } from "./Highlight";
import { HomeLinks } from "./HomeLinks";
import { ScrollCue } from "./ScrollCue";
import { SocialStrip } from "./SocialStrip";
import { WorksCarousel } from "./WorksCarousel";
import { dictionaries } from "@/i18n/dictionaries";
import { getI18n } from "@/i18n/server";
import { getFeaturedWorks, getSite, getWork } from "@/lib/content";
import styles from "@/app/home.module.css";

type Picture = { src: string; width: number; height: number };

export type HomeHero = {
  /** Photo for tall screens (and the fallback). */
  portrait: Picture;
  /** Optional separate photo for wide screens. */
  landscape?: Picture;
  alt: string;
  caption?: string;
  /** CSS object-position, to keep the subject in view when the photo is cropped to the screen. */
  position?: string;
};

/** The earlier studio photo (used by the "studio" homepage concept), with texts per language. */
export const studioHero = (locale: keyof typeof dictionaries): HomeHero => ({
  portrait: { src: "/images/studio-portrait.jpg", width: 941, height: 1672 },
  landscape: { src: "/images/studio-landscape.jpg", width: 1672, height: 941 },
  alt: dictionaries[locale].home.studioAlt,
  caption: dictionaries[locale].home.studioCaption,
});

/** The homepage: a full-bleed opening photo, a short introduction and the selected works. */
export async function HomeView({ hero }: { hero: HomeHero }) {
  const { locale, t, href } = await getI18n();
  const site = getSite(locale);
  const highlight = site.highlight;
  const highlightWork = highlight && getWork(highlight.work, locale);
  if (highlight && !highlightWork) {
    throw new Error(
      `site.yaml highlight.work "${highlight.work}" is not a folder in content/works`,
    );
  }
  // Works with `featured: true`, newest (highest number) on the left; shown by number only for now.
  const works = getFeaturedWorks(locale).slice(0, 8); // max. 8 on the homepage

  // Art direction: a landscape photo for wide screens, a portrait one for tall screens.
  const common = { alt: hero.alt, sizes: "100vw", quality: 90, priority: true };
  const landscape =
    hero.landscape &&
    getImageProps({ ...common, ...hero.landscape }).props.srcSet;
  const { srcSet: portraitSrcSet, ...portrait } = getImageProps({
    ...common,
    ...hero.portrait,
  }).props;

  return (
    <div className="container">
      <h1 className="visually-hidden">{site.name}</h1>

      {/* Full-bleed studio photograph with the header laid over it. */}
      <section
        className={styles.studio}
        data-hero="bleed"
        data-hero-glass
        aria-label={t.home.studio}
      >
        <picture>
          {landscape && (
            <source media="(orientation: landscape)" srcSet={landscape} />
          )}
          <source srcSet={portraitSrcSet} />
          <img
            {...portrait}
            alt={portrait.alt}
            className={styles.studioImage}
            style={
              hero.position ? { objectPosition: hero.position } : undefined
            }
          />
        </picture>
        <ScrollCue target="intro" />
      </section>
      {hero.caption && <p className={styles.studioCaption}>{hero.caption}</p>}

      {/* 1. Introduction: portrait in a circle, a few words beside it */}
      {site.intro && (
        <section
          id="intro"
          className={styles.intro}
          aria-labelledby="intro-title"
        >
          <Image
            src="/images/portrait-daphne.jpg"
            alt={t.home.portraitAlt}
            width={1000}
            height={1000}
            sizes="(max-width: 700px) 200px, 340px"
            quality={90}
            className={styles.portrait}
          />
          <div className={styles.introBody}>
            <h2 id="intro-title" className={styles.introLabel}>
              {site.name}
            </h2>
            <p className={styles.introText}>{site.intro}</p>
            <Link href={href("/about")} className={styles.more}>
              {t.home.aboutMe} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      )}

      {/* 2. Socials: a thin band */}
      <SocialStrip site={site} t={t} />

      {/* 3. Current exhibition */}
      {highlight && highlightWork && (
        <Highlight highlight={highlight} work={highlightWork} locale={locale} t={t} />
      )}

      {/* 4. Recent works, with Commissions and Exhibitions below */}
      {works.length === 0 && <HomeLinks />}
      {works.length > 0 && (
        <WorksCarousel
          title={t.home.recentWorks}
          after={<HomeLinks />}
          items={works.map((work) => ({
            key: work.slug,
            card: (
              <WorkCard
                work={work}
                locale={locale}
                label={work.number ? String(work.number) : undefined}
              />
            ),
          }))}
        />
      )}
    </div>
  );
}
