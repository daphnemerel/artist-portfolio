"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { otherLocale, switchLocalePath } from "@/i18n/config";
import { useI18n } from "@/i18n/client";
import { FlagNL, FlagUK } from "./flags";
import styles from "./LanguageSwitch.module.css";

/**
 * Round flag button: on Dutch pages the British flag (to English), on English pages the Dutch flag
 * (to Dutch). It always leads to the same page in the other language.
 */
export function LanguageSwitch({ className }: { className?: string }) {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const to = otherLocale(locale);

  return (
    <Link
      href={switchLocalePath(pathname, to)}
      hrefLang={to}
      lang={to}
      className={`${styles.switch} ${className ?? ""}`}
      aria-label={t.language.switchLabel}
      title={t.language.switchLabel}
      scroll={false}
    >
      {to === "en" ? <FlagUK /> : <FlagNL />}
    </Link>
  );
}
