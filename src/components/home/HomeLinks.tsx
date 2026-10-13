import Image from "next/image";
import Link from "next/link";
import styles from "./HomeLinks.module.css";

type Item = {
  title: string;
  text: string;
  href: string;
  label: string;
  image?: { src: string; width: number; height: number; alt: string };
};

const LINKS: Item[] = [
  {
    title: "Commissions",
    text: "Interested in a custom work or collaboration?",
    href: "/commissions",
    label: "View commissions",
  },
  {
    title: "Exhibitions",
    text: "View current and past exhibitions and projects.",
    href: "/exhibitions",
    label: "View exhibitions",
    image: {
      src: "/images/exhibitions/gigalerie-acec-2026.jpg",
      width: 1254,
      height: 1254,
      alt: "Poster for Gigalerie × ACEC, 18.12 – 20.12.2026: large black lettering beside a blurred close-up of pink, blue and green paint.",
    },
  },
];

/** Two quiet pointers at the end of the homepage, side by side with a hairline between them. */
export function HomeLinks() {
  return (
    <nav className={styles.links} aria-label="More" data-home-links="">
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
