import type { Metadata } from "next";
import { localeTag, locales, defaultLocale, type Locale } from "./config";

/** The share image for pages without their own: the name and three works, per language. */
export function defaultShareImage(locale: Locale) {
  return {
    url: `/images/og-default-${locale}.jpg`,
    width: 1200,
    height: 630,
    alt:
      locale === "nl"
        ? "Daphne Merel, mixed media kunstenaar"
        : "Daphne Merel, mixed media artist",
  };
}

/**
 * Canonical URL and hreflang alternates for a page, given its path without language (e.g. "/works").
 * Spread into a page's metadata: { title, ...alternates(locale, "/works") }.
 */
export function alternates(
  locale: Locale,
  path: string,
): Pick<Metadata, "alternates" | "openGraph"> {
  const clean = path === "/" ? "" : path;
  return {
    alternates: {
      canonical: `/${locale}${clean}`,
      languages: {
        ...Object.fromEntries(
          locales.map((l) => [localeTag[l], `/${l}${clean}`]),
        ),
        "x-default": `/${defaultLocale}${clean}`,
      },
    },
    // Each page repeats the site-wide link-preview details, because a page's openGraph replaces the
    // layout's. Work pages put their own photo in `images` afterwards.
    openGraph: {
      siteName: "Daphne Merel",
      type: "website",
      locale: localeTag[locale].replace("-", "_"),
      url: `/${locale}${clean}`,
      images: [defaultShareImage(locale)],
    },
  };
}
