import type { MetadataRoute } from "next";
import { localeTag, locales } from "@/i18n/config";
import { getTexts, getWorks } from "@/lib/content";
import { siteUrl } from "@/lib/site-url";

/** Every public page in both languages, each listing its other-language version. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/works",
    "/exhibitions",
    // The Texts section only exists once there is a text.
    ...(getTexts("en").length > 0 ? ["/texts"] : []),
    "/commissions",
    "/about",
    "/contact",
    "/privacy",
    ...getWorks("en").map((work) => `/works/${work.slug}`),
    ...getTexts("en").map((text) => `/texts/${text.slug}`),
  ];
  return paths.flatMap((path) =>
    locales.map((locale) => ({
      url: `${siteUrl}/${locale}${path}`,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [localeTag[l], `${siteUrl}/${l}${path}`])),
      },
    })),
  );
}
