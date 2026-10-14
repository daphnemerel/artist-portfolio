import type { Metadata } from "next";
import { HomeView } from "@/components/home/HomeView";
import { getI18n } from "@/i18n/server";

// Experiment: the homepage with Daphne's portrait by the red car as the opening photo.
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.experimental.redCarTitle, robots: { index: false, follow: false } };
}

export default async function HomeConceptRedCar() {
  const { t } = await getI18n();
  return (
    <HomeView
      hero={{
        portrait: { src: "/images/concepts/daphne-red-car.jpg", width: 1536, height: 2048 },
        alt: t.home.redCarAlt,
        position: "50% 33%",
      }}
    />
  );
}
