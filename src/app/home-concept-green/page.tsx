import type { Metadata } from "next";
import { HomeView } from "@/components/home/HomeView";

// Experiment: the homepage opening with a close-up of the new green and pink work.
export const metadata: Metadata = { title: "Homepage concept — green and pink", robots: { index: false, follow: false } };

export default function HomeConceptGreen() {
  return (
    <HomeView
      hero={{
        portrait: { src: "/images/concepts/green-pink-detail.jpg", width: 1800, height: 2400 },
        alt: "Close-up of a new painting: dabs of green, pink, plum and peach paint with ridged, textured patches.",
        caption: "Detail of a new work, 2026",
      }}
    />
  );
}
