import type { ReactNode } from "react";
import { format } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Site } from "@/lib/content";
import { SocialIcon, socialAccounts } from "@/components/layout/social";
import styles from "./SocialStrip.module.css";

/** Thin band on the homepage: "SOCIALS" and the accounts filled in content/site.yaml, plus email. */
export function SocialStrip({ site, t }: { site: Site; t: Dictionary }) {
  type Link = {
    key: string;
    label: string;
    href?: string;
    icon: ReactNode;
    external: boolean;
  };
  // Only accounts that exist; empty ones in content/site.yaml are not shown.
  const links: Link[] = socialAccounts(site)
    .filter((a) => a.href)
    .map(({ platform, label, href, icon }) => ({
      key: platform,
      label,
      href,
      icon,
      external: true,
    }));
  if (site.email) {
    links.push({
      key: "email",
      label: t.nav.email,
      href: `mailto:${site.email}`,
      icon: (
        <>
          <rect x="3" y="5" width="18" height="14" />
          <path d="m3 6 9 7 9-7" />
        </>
      ),
      external: false,
    });
  }

  return (
    <section className={styles.strip} aria-labelledby="socials-title">
      <h2 id="socials-title" className={styles.label}>
        {t.home.socials}
      </h2>
      <ul className={styles.list}>
        {links.map((l) => (
          <li key={l.key}>
            {l.href ? (
              <a
                href={l.href}
                className={styles.link}
                aria-label={l.label}
                {...(l.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                <span className={styles.disc} aria-hidden="true" />
                <span className={styles.icon}>
                  <SocialIcon size={24}>{l.icon}</SocialIcon>
                </span>
              </a>
            ) : (
              <span
                className={`${styles.link} ${styles.pending}`}
                title={format(t.home.comingSoon, { label: l.label })}
              >
                <span className={styles.icon}>
                  <SocialIcon size={24}>{l.icon}</SocialIcon>
                </span>
                <span className="visually-hidden">
                  {format(t.home.comingSoon, { label: l.label })}
                </span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
