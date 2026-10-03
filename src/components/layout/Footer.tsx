import Link from "next/link";
import { getSite } from "@/lib/content";
import { navLinks } from "./navigation";
import { SocialIcon, socialAccounts } from "./social";
import styles from "./Footer.module.css";

/** Full-width bordeaux band closing every page: name, the main sections, email and social links. */
export function Footer() {
  const site = getSite();
  // Facebook only appears once an account is filled in; the others are always shown.
  const social = socialAccounts(site).filter((a) => a.href || a.platform !== "facebook");

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

        <div className={styles.contact}>
          {site.email && (
            <div>
              <p className={styles.label}>Email</p>
              <a href={`mailto:${site.email}`} className={styles.email}>
                {site.email}
              </a>
            </div>
          )}
          <div>
            <p className={styles.label}>Follow</p>
            <ul className={styles.social}>
              {social.map(({ platform, label, href, icon }) => (
                <li key={platform}>
                  {href ? (
                    <a href={href} rel="noopener noreferrer" aria-label={label}>
                      <SocialIcon size={26}>{icon}</SocialIcon>
                    </a>
                  ) : (
                    <span className={styles.pending} title={`${label}: account to be added`}>
                      <SocialIcon size={26}>{icon}</SocialIcon>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
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
