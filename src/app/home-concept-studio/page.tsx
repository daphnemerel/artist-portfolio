import type { Metadata } from "next";
import { HomeView, STUDIO_HERO } from "@/components/home/HomeView";

// Experiment: the earlier homepage, opening with the studio photo.
export const metadata: Metadata = { title: "Homepage concept — studio", robots: { index: false, follow: false } };

export default function HomeConceptStudio() {
  return <HomeView hero={STUDIO_HERO} />;
}
