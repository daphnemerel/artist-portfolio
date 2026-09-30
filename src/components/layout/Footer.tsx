import { getSite } from "@/lib/content";
import styles from "./Footer.module.css";

export function Footer() {
  const site = getSite();
  return (
    <footer className={`${styles.footer} container`}>
      <p>
        © {new Date().getFullYear()} {site.name}
      </p>
      <ul className={styles.links}>
        <li>
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </li>
        {site.instagram && (
          <li>
            <a href={`https://instagram.com/${site.instagram}`} rel="noopener noreferrer">
              Instagram
            </a>
          </li>
        )}
      </ul>
    </footer>
  );
}
