import type { Site } from "@/lib/content";
import styles from "./SocialLinks.module.css";

/** Icon links for the platforms filled in content/site.yaml; nothing renders for empty fields. */
export function SocialLinks({ site }: { site: Pick<Site, "instagram" | "email"> }) {
  const links = [
    site.instagram && {
      href: `https://instagram.com/${site.instagram}`,
      label: "Instagram",
      icon: (
        <>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
        </>
      ),
    },
    site.email && {
      href: `mailto:${site.email}`,
      label: "Email",
      icon: (
        <>
          <rect x="3" y="5" width="18" height="14" />
          <path d="m3 6 9 7 9-7" />
        </>
      ),
    },
  ].filter((link) => Boolean(link)) as { href: string; label: string; icon: React.ReactNode }[];

  if (links.length === 0) return null;

  return (
    <ul className={styles.list}>
      {links.map(({ href, label, icon }) => (
        <li key={label}>
          <a
            href={href}
            className={styles.link}
            aria-label={label}
            {...(href.startsWith("http") && { rel: "noopener noreferrer" })}
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              {icon}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
