import type { Metadata } from "next";
import { HomeView, studioHero } from "@/components/home/HomeView";
import { getI18n } from "@/i18n/server";

// Experiment: the earlier homepage, opening with the studio photo.
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.experimental.studioTitle, robots: { index: false, follow: false } };
}

export default async function HomeConceptStudio() {
  const { locale } = await getI18n();
  return <HomeView hero={studioHero(locale)} />;
}
