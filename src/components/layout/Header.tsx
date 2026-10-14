import Link from "next/link";
import { getI18n } from "@/i18n/server";
import { getSite } from "@/lib/content";
import { LanguageSwitch } from "./LanguageSwitch";
import { NavLinks } from "./NavLinks";
import { SocialLinks } from "./SocialLinks";
import styles from "./Header.module.css";

export async function Header() {
  const { locale, t, href } = await getI18n();
  const site = getSite(locale);
  return (
    <header className={`${styles.header} container`}>
      <Link href={href("/")} className={styles.name}>
        {site.name}
      </Link>
      {/* Phones: the flag sits next to "Menu", always visible. */}
      <LanguageSwitch className={styles.switchPhone} />
      <NavLinks
        actions={
          <>
            <SocialLinks site={site} emailLabel={t.nav.email} />
            <Link href={href("/works")} className="button">
              {t.nav.viewWorks}
            </Link>
            <LanguageSwitch className={styles.switchDesktop} />
          </>
        }
      />
    </header>
  );
}
