import Link from "next/link";
import { format } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { getSite } from "@/lib/content";
import { navLinks } from "./navigation";
import { SocialIcon, socialAccounts } from "./social";
import styles from "./Footer.module.css";

/** Full-width bordeaux band closing every page: name, the main sections, email and social links. */
export async function Footer() {
  const { locale, t, href: localize } = await getI18n();
  const site = getSite(locale);
  const social = socialAccounts(site);

  return (
    <footer className={styles.footer}>
      <div className={`${styles.main} container`}>
        <div>
          <p className={styles.name}>{site.name}</p>
          <p className={styles.role}>{t.footer.role}</p>
        </div>

        <nav aria-label={t.footer.nav}>
          <ul className={styles.nav}>
            {navLinks.map(({ href, key }) => (
              <li key={href}>
                <Link href={localize(href)}>{t.nav[key]}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.contact}>
          {site.email && (
            <div>
              <p className={styles.label}>{t.footer.email}</p>
              <a href={`mailto:${site.email}`} className={styles.email}>
                {site.email}
              </a>
            </div>
          )}
          <div>
            <p className={styles.label}>{t.footer.follow}</p>
            <ul className={styles.social}>
              {social.map(({ platform, label, href, icon }) => (
                <li key={platform}>
                  {href ? (
                    <a href={href} rel="noopener noreferrer" aria-label={label}>
                      <SocialIcon size={26}>{icon}</SocialIcon>
                    </a>
                  ) : (
                    <span
                      className={styles.pending}
                      title={format(t.footer.pending, { label })}
                    >
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
        <Link href={localize("/privacy")}>{t.privacy.link}</Link>
      </div>
    </footer>
  );
}
