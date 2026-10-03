import Link from "next/link";
import { getSite } from "@/lib/content";
import { NavLinks } from "./NavLinks";
import { SocialLinks } from "./SocialLinks";
import styles from "./Header.module.css";

export function Header() {
  const site = getSite();
  return (
    <header className={`${styles.header} container`}>
      <Link href="/" className={styles.name}>
        {site.name}
      </Link>
      <NavLinks
        actions={
          <>
            <SocialLinks site={site} />
            <Link href="/works" className="button">
              View Works
            </Link>
          </>
        }
      />
    </header>
  );
}
