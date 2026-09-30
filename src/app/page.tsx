import Link from "next/link";
import { ArtworkTile } from "@/components/media/ArtworkTile";
import { Caption } from "@/components/media/Caption";
import { FadeImage } from "@/components/media/FadeImage";
import { Label } from "@/components/type/Label";
import { getFeaturedWorks, getSite, getWorks } from "@/lib/content";
import styles from "./home.module.css";

export default function HomePage() {
  const site = getSite();
  const works = getWorks();
  const hero = getFeaturedWorks()[0] ?? works[0];
  const recent = works.filter((w) => w.slug !== hero?.slug).slice(0, 6);

  return (
    <div className="container">
      <section className={styles.intro}>
        <h1 className={styles.name}>{site.name}</h1>
        <p className={styles.description}>{site.description}</p>
      </section>

      {hero && (
        <section className={`${styles.hero} section`} aria-label="Featured work">
          <Link href={`/works/${hero.slug}`} className={styles.heroLink}>
            <FadeImage
              src={hero.images[0].url}
              alt={hero.images[0].alt}
              width={hero.images[0].width}
              height={hero.images[0].height}
              sizes="(max-width: 1024px) 100vw, 75vw"
              quality={90}
              priority
              className={styles.heroImage}
            />
          </Link>
          <Caption work={hero} full />
        </section>
      )}

      {recent.length > 0 && (
        <section className="section">
          <div className={styles.sectionHead}>
            <Label as="h2">Recent works</Label>
            <Link href="/works" className={styles.more}>
              All works
            </Link>
          </div>
          <ul className={styles.grid}>
            {recent.map((work) => (
              <li key={work.slug}>
                <ArtworkTile work={work} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
