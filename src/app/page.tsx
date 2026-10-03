import { getImageProps } from "next/image";
import { getSite } from "@/lib/content";
import styles from "./home.module.css";

export default function HomePage() {
  const site = getSite();

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
    </div>
  );
}
