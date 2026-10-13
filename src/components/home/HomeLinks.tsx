import Link from "next/link";
import styles from "./HomeLinks.module.css";

const LINKS = [
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
  },
];

/** Two quiet pointers at the end of the homepage, side by side with a hairline between them. */
export function HomeLinks() {
  return (
    <nav className={styles.links} aria-label="More">
      {LINKS.map((item) => (
        <div key={item.href} className={styles.item}>
          <h2 className={styles.title}>{item.title}</h2>
          <p className={styles.text}>{item.text}</p>
          <Link href={item.href} className={styles.more}>
            {item.label} <span aria-hidden="true">→</span>
          </Link>
        </div>
      ))}
    </nav>
  );
}
