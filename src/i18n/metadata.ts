import type { Metadata } from "next";
import { localeTag, locales, defaultLocale, type Locale } from "./config";

/** The share image for pages without their own: Daphne with the red car (her portrait from the homepage). */
export function defaultShareImage(locale: Locale) {
  return {
    url: "/images/og-daphne.jpg",
    width: 1000,
    height: 525,
    alt:
      locale === "nl"
        ? "Daphne Merel, lachend, in de open deur van een rode oldtimer"
        : "Daphne Merel, smiling, in the open door of a red vintage car",
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
