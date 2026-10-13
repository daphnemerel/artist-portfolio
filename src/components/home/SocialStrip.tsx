import type { ReactNode } from "react";
import type { Site } from "@/lib/content";
import { SocialIcon, socialAccounts } from "@/components/layout/social";
import styles from "./SocialStrip.module.css";

/** Thin band on the homepage: "SOCIALS" and the accounts filled in content/site.yaml, plus email. */
export function SocialStrip({ site }: { site: Site }) {
  type Link = { key: string; label: string; href: string; icon: ReactNode; external: boolean };
  const links: Link[] = socialAccounts(site)
    .filter((a) => a.href)
    .map(({ platform, label, href, icon }) => ({ key: platform, label, href: href!, icon, external: true }));
  if (site.email) {
    links.push({
      key: "email",
      label: "Email",
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
  if (links.length === 0) return null;

  return (
    <section className={styles.strip} aria-labelledby="socials-title">
      <h2 id="socials-title" className={styles.label}>
        Socials
      </h2>
      <ul className={styles.list}>
        {links.map((l) => (
          <li key={l.key}>
            <a
              href={l.href}
              className={styles.link}
              aria-label={l.label}
              {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              <SocialIcon size={20}>{l.icon}</SocialIcon>
              <span className={styles.name}>{l.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
