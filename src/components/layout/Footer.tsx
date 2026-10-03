import Link from "next/link";
import { getSite } from "@/lib/content";
import { navLinks } from "./navigation";
import { SocialIcon, socialAccounts } from "./social";
import styles from "./Footer.module.css";

/** Full-width bordeaux band closing every page: name, the main sections and social accounts. */
export function Footer() {
  const site = getSite();
  return (
    <footer className={styles.footer}>
      <div className={`${styles.main} container`}>
        <div>
          <p className={styles.name}>{site.name}</p>
          <p className={styles.role}>Dutch Mixed Media Artist</p>
        </div>

        <nav aria-label="Footer">
          <ul className={styles.nav}>
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link href={href}>{label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <ul className={styles.social}>
          {socialAccounts(site).map(({ platform, label, handle, href, icon }) => (
            <li key={platform}>
              {href ? (
                <a href={href} rel="noopener noreferrer" aria-label={`${label}: ${handle}`}>
                  <SocialIcon>{icon}</SocialIcon>
                  <span>{handle}</span>
                </a>
              ) : (
                <span className={styles.pending} aria-label={`${label}: account to be added`}>
                  <SocialIcon>{icon}</SocialIcon>
                  <span>account to be added</span>
                </span>
              )}
            </li>
          ))}
        </ul>
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
