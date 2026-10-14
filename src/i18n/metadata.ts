import type { Metadata } from "next";
import { localeTag, locales, defaultLocale, type Locale } from "./config";

/**
 * Canonical URL and hreflang alternates for a page, given its path without language (e.g. "/works").
 * Spread into a page's metadata: { title, ...alternates(locale, "/works") }.
 */
export function alternates(locale: Locale, path: string): Pick<Metadata, "alternates" | "openGraph"> {
  const clean = path === "/" ? "" : path;
  return {
    alternates: {
      canonical: `/${locale}${clean}`,
      languages: {
        ...Object.fromEntries(locales.map((l) => [localeTag[l], `/${l}${clean}`])),
        "x-default": `/${defaultLocale}${clean}`,
      },
    },
    openGraph: { locale: localeTag[locale].replace("-", "_"), url: `/${locale}${clean}` },
  };
}
