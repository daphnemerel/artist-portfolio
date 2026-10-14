import type { Metadata } from "next";
import { HomeView } from "@/components/home/HomeView";
import { isLocale } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionaries";
import { alternates } from "@/i18n/metadata";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? alternates(lang, "/") : {};
}

// Opening photo: a close-up of the new green and pink work (chosen by the artist).
export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  const t = dictionaries[isLocale(lang) ? lang : "nl"];
  return (
    <HomeView
      hero={{
        portrait: { src: "/images/concepts/green-pink-detail.jpg", width: 1800, height: 2400 },
        alt: t.home.heroAlt,
      }}
    />
  );
}
