import type { Metadata } from "next";
import { HomeView } from "@/components/home/HomeView";
import { isLocale } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionaries";
import { alternates } from "@/i18n/metadata";
import { getSite } from "@/lib/content";
import { siteUrl } from "@/lib/site-url";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? alternates(lang, "/") : {};
}

// Opening photo: a close-up of the new green and pink work (chosen by the artist).
export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "nl";
  const t = dictionaries[locale];
  const site = getSite(locale);
  // Tells search engines who the site is about and which photo shows her.
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    url: `${siteUrl}/${locale}`,
    image: `${siteUrl}/images/portrait-daphne.jpg`,
    jobTitle: t.footer.role,
    ...(site.instagram && { sameAs: [`https://www.instagram.com/${site.instagram}`] }),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person).replace(/</g, "\\u003c") }}
      />
      <HomeView
        hero={{
          portrait: { src: "/images/concepts/green-pink-detail.jpg", width: 1800, height: 2400 },
          alt: t.home.heroAlt,
        }}
      />
    </>
  );
}
