import type { MetadataRoute } from "next";
import { getTexts, getWorks } from "@/lib/content";
import { siteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/works", "/exhibitions", "/texts", "/about", "/contact"];
  return [
    ...pages.map((path) => ({ url: `${siteUrl}${path}` })),
    ...getWorks().map((work) => ({ url: `${siteUrl}/works/${work.slug}` })),
    ...getTexts().map((text) => ({ url: `${siteUrl}/texts/${text.slug}` })),
  ];
}
