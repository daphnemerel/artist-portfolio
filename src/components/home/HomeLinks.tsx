import Image from "next/image";
import Link from "next/link";
import { getI18n } from "@/i18n/server";
import styles from "./HomeLinks.module.css";

type Item = {
  title: string;
  text: string;
  href: string;
  label: string;
  image?: { src: string; width: number; height: number; alt: string };
};

/** Two quiet pointers at the end of the homepage, side by side with a hairline between them. */
export async function HomeLinks() {
  const { t, href } = await getI18n();
  const LINKS: Item[] = [
    {
      ...t.home.commissions,
      href: href("/commissions"),
      image: { src: "/images/commissions-window.jpg", width: 1254, height: 1254, alt: t.home.commissions.alt },
    },
    {
      ...t.home.exhibitions,
      href: href("/exhibitions"),
      image: { src: "/images/exhibitions/coda-open-call-055.jpg", width: 1254, height: 1254, alt: t.home.exhibitions.alt },
    },
  ];
  return (
    <nav className={styles.links} aria-label={t.home.more} data-home-links="">
      {LINKS.map((item) => (
        <div key={item.href} className={styles.item} data-image={item.image ? "" : undefined}>
          <div className={styles.body}>
            <h2 className={styles.title}>{item.title}</h2>
            <p className={styles.text}>{item.text}</p>
            <Link href={item.href} className={styles.more}>
              {item.label} <span aria-hidden="true">→</span>
            </Link>
          </div>
          {item.image && (
            <Link href={item.href} className={styles.image} tabIndex={-1} aria-hidden="true">
              <Image {...item.image} sizes="190px" quality={90} alt={item.image.alt} />
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
