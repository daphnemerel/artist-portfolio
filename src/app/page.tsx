import { HomeView } from "@/components/home/HomeView";

// Opening photo: a close-up of the new green and pink work (chosen by the artist).
export default function HomePage() {
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
