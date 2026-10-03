import type { Site } from "@/lib/content";
import { SocialIcon, socialAccounts, type SocialPlatform } from "./social";
import styles from "./SocialLinks.module.css";

/** Icon-only links for the header: the accounts filled in content/site.yaml, plus email. */
export function SocialLinks({ site }: { site: Pick<Site, SocialPlatform | "email"> }) {
  const links = socialAccounts(site).filter((account) => account.href);

  if (links.length === 0 && !site.email) return null;

  return (
    <ul className={styles.list}>
      {links.map(({ platform, label, href, icon }) => (
        <li key={platform}>
          <a href={href} className={styles.link} aria-label={label} rel="noopener noreferrer">
            <SocialIcon>{icon}</SocialIcon>
          </a>
        </li>
      ))}
      {site.email && (
        <li>
          <a href={`mailto:${site.email}`} className={styles.link} aria-label="Email">
            <SocialIcon>
              <rect x="3" y="5" width="18" height="14" />
              <path d="m3 6 9 7 9-7" />
            </SocialIcon>
          </a>
        </li>
      )}
    </ul>
  );
}
