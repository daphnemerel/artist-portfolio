import Link from "next/link";
import { getSite } from "@/lib/content";
import { SocialLinks } from "./SocialLinks";
import styles from "./Footer.module.css";

/** Full-width bordeaux band closing every page: name, social links and a way into the works. */
export function Footer() {
  const site = getSite();
  return (
    <footer className={styles.footer}>
      <div className={`${styles.main} container`}>
        <div>
          <p className={styles.name}>{site.name}</p>
          <p className={styles.tagline}>Selected works, studio practice and exhibitions.</p>
        </div>
        <div className={styles.social}>
          <SocialLinks site={site} />
        </div>
        <Link href="/works" className={styles.cta}>
          View Works →
        </Link>
      </div>
      <div className={`${styles.meta} container`}>
        <p>
          © {new Date().getFullYear()} {site.name}
        </p>
        <Link href="/texts">Texts</Link>
      </div>
    </footer>
  );
}
